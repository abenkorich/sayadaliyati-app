export type Credentials = { accessToken: string; refreshToken: string };
export type Vault = {
  get(): Promise<string | null>;
  set(value: string): Promise<void>;
  clear(): Promise<void>;
};
export class ClientError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
export function apiUrl(
  value: string | undefined,
  development: boolean,
): string {
  if (!value)
    throw new Error('Set EXPO_PUBLIC_API_URL before starting the app.');
  const url = new URL(value);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !['https:', 'http:'].includes(url.protocol)
  )
    throw new Error('Invalid API URL.');
  if (url.protocol !== 'https:' && !development)
    throw new Error('Release builds require HTTPS.');
  if (url.pathname.replace(/\/$/, '') !== '/api/v1')
    throw new Error('API URL must end with /api/v1.');
  return url.href.replace(/\/$/, '');
}
export class ApiClient {
  private access: string | null = null;
  private refreshTask: Promise<void> | null = null;
  private generation = 0;
  private storageTask: Promise<void> = Promise.resolve();
  private persist(token: string | null, epoch: number): Promise<void> {
    const task = this.storageTask
      .catch(() => {})
      .then(async () => {
        if (epoch !== this.generation)
          throw new ClientError(401, 'SESSION_CHANGED');
        if (token === null) await this.vault.clear();
        else await this.vault.set(token);
      });
    this.storageTask = task;
    return task;
  }
  constructor(
    private base: string,
    private vault: Vault,
    private transport: typeof fetch = fetch,
  ) {}
  private async send(
    path: string,
    method: string,
    body?: unknown,
    token?: string | null,
  ) {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      path.startsWith('/me/prescription-scan') ? 60000 : 15000,
    );
    try {
      const response = await this.transport(this.base + path, {
        method,
        headers: {
          ...(body !== undefined && !(body instanceof FormData)
            ? { 'Content-Type': 'application/json' }
            : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body !== undefined
          ? { body: body instanceof FormData ? body : JSON.stringify(body) }
          : {}),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok)
        throw new ClientError(
          response.status,
          result?.error?.code ?? 'REQUEST_FAILED',
        );
      return result;
    } finally {
      clearTimeout(timer);
    }
  }
  async signIn(input: unknown, register = false) {
    await this.clear();
    const epoch = this.generation;
    const result = await this.send(
      register ? '/auth/register' : '/auth/login',
      'POST',
      input,
    );
    if (epoch !== this.generation)
      throw new ClientError(401, 'SESSION_CHANGED');
    await this.persist(result.data.refreshToken, epoch);
    if (epoch !== this.generation)
      throw new ClientError(401, 'SESSION_CHANGED');
    this.access = result.data.accessToken;
  }
  async restore() {
    if (!(await this.vault.get())) return false;
    await this.refresh();
    return true;
  }
  private refresh(): Promise<void> {
    if (this.refreshTask) return this.refreshTask;
    const epoch = this.generation;
    this.refreshTask = (async () => {
      const token = await this.vault.get();
      if (!token) throw new ClientError(401, 'AUTH_REQUIRED');
      // A consumed refresh token must never be retried after an ambiguous failure.
      await this.persist(null, epoch);
      try {
        const result = await this.send('/auth/refresh', 'POST', {
          refreshToken: token,
        });
        if (epoch !== this.generation)
          throw new ClientError(401, 'SESSION_CHANGED');
        await this.persist(result.data.refreshToken, epoch);
        if (epoch !== this.generation)
          throw new ClientError(401, 'SESSION_CHANGED');
        this.access = result.data.accessToken;
      } catch (error) {
        if (epoch === this.generation) this.access = null;
        throw error;
      }
    })().finally(() => {
      this.refreshTask = null;
    });
    return this.refreshTask;
  }
  async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    // Public catalog suggestions must not depend on a refresh token or rotate a session.
    if (method === 'GET' && path.split('?')[0] === '/medicines/suggestions')
      return this.send(path, method);
    const epoch = this.generation;
    if (!this.access) await this.refresh();
    const used = this.access;
    try {
      const result = await this.send(path, method, body, used);
      if (epoch !== this.generation)
        throw new ClientError(401, 'SESSION_CHANGED');
      return result;
    } catch (error) {
      if (
        !(error instanceof ClientError) ||
        error.status !== 401 ||
        epoch !== this.generation
      )
        throw error;
      if (this.access === used) await this.refresh();
      const result = await this.send(path, method, body, this.access);
      if (epoch !== this.generation)
        throw new ClientError(401, 'SESSION_CHANGED');
      return result;
    }
  }
  async logout() {
    try {
      await this.request('/auth/logout', 'POST', {});
    } finally {
      await this.clear();
    }
  }
  async clear() {
    this.generation++;
    this.access = null;
    await this.persist(null, this.generation);
  }
}
