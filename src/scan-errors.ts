export function scanSettingsError(error: unknown, saving = false): string {
  const status =
    error && typeof error === 'object' && 'status' in error
      ? error.status
      : undefined;
  if (status === 404 || status === 405)
    return 'Scan settings are not available on this server yet. The API needs an update before account permissions can be saved.';
  if (status === 401)
    return 'Your session has expired. Sign in again to manage scan settings.';
  if (status === 403)
    return 'Scan settings are available to patient accounts only.';
  if (typeof status === 'number' && status >= 500)
    return 'The scan settings service is temporarily unavailable. Please try again later.';
  return saving
    ? 'Unable to save scan settings. Check your connection and try again.'
    : 'Unable to load scan settings. Check your connection and try again.';
}
