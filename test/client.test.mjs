/* global Response */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiClient, apiUrl } from '../.test-dist/client.js';
const base = 'https://example.test/api/v1';
const response = (data, status = 200) =>
  new Response(
    JSON.stringify(
      status === 200 ? { data } : { error: { code: 'AUTH_REQUIRED' } },
    ),
    { status },
  );
function vault(initial = null) {
  let value = initial;
  return {
    get: async () => value,
    set: async (x) => {
      value = x;
    },
    clear: async () => {
      value = null;
    },
  };
}
test('release API URLs require HTTPS and reject embedded credentials', () => {
  assert.equal(apiUrl(base + '/', false), base);
  for (const url of [
    'http://example.test/api/v1',
    'https://user:secret@example.test/api/v1',
    'https://example.test/api/v1?token=x',
    undefined,
  ])
    assert.throws(() => apiUrl(url, false));
  assert.equal(
    apiUrl('http://10.0.2.2:3000/api/v1', true),
    'http://10.0.2.2:3000/api/v1',
  );
});
test('concurrent requests rotate once and persist only the new refresh token', async () => {
  const store = vault('old');
  let refreshes = 0;
  const client = new ApiClient(base, store, async (url, opts) => {
    if (url.endsWith('/auth/refresh')) {
      refreshes++;
      assert.equal(JSON.parse(opts.body).refreshToken, 'old');
      return response({ accessToken: 'access', refreshToken: 'new' });
    }
    assert.equal(opts.headers.Authorization, 'Bearer access');
    return response({ ok: true });
  });
  await Promise.all([
    client.request('/me/profile'),
    client.request('/me/notifications'),
  ]);
  assert.equal(refreshes, 1);
  assert.equal(await store.get(), 'new');
});
test('ambiguous refresh failure discards the single-use token instead of retrying it', async () => {
  const store = vault('old');
  let calls = 0;
  const client = new ApiClient(base, store, async () => {
    calls++;
    throw new Error('network');
  });
  await assert.rejects(client.restore());
  await assert.rejects(client.request('/me/profile'));
  assert.equal(calls, 1);
  assert.equal(await store.get(), null);
});
test('concurrent expired requests share a refresh and retry with the new access token', async () => {
  const store = vault();
  let refreshes = 0;
  const client = new ApiClient(base, store, async (url, opts) => {
    if (url.endsWith('/auth/login'))
      return response({ accessToken: 'expired', refreshToken: 'old' });
    if (url.endsWith('/auth/refresh')) {
      refreshes++;
      return response({ accessToken: 'fresh', refreshToken: 'new' });
    }
    return opts.headers.Authorization === 'Bearer expired'
      ? response(null, 401)
      : response({ ok: true });
  });
  await client.signIn({});
  await Promise.all([client.request('/one'), client.request('/two')]);
  assert.equal(refreshes, 1);
});
test('logout clears local credentials even if revocation fails', async () => {
  const store = vault('old');
  const client = new ApiClient(base, store, async (url) =>
    url.endsWith('/auth/refresh')
      ? response({ accessToken: 'access', refreshToken: 'new' })
      : Promise.reject(new Error('offline')),
  );
  await assert.rejects(client.logout());
  assert.equal(await store.get(), null);
});
test('late refresh response cannot resurrect a cleared session', async () => {
  const store = vault('old');
  let complete;
  let started;
  const begun = new Promise((r) => {
    started = r;
  });
  const client = new ApiClient(base, store, async () => {
    started();
    return new Promise((r) => {
      complete = r;
    });
  });
  const restoring = client.restore();
  await begun;
  await client.clear();
  complete(response({ accessToken: 'stale', refreshToken: 'stale' }));
  await assert.rejects(restoring);
  assert.equal(await store.get(), null);
});
