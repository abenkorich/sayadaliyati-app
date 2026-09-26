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

export function scanExtractionError(error: unknown): string {
  const value =
    error && typeof error === 'object'
      ? (error as { status?: number; code?: string; name?: string })
      : {};
  if (value.code === 'PRESCRIPTION_SCAN_NOT_CONFIGURED')
    return 'Your server has not configured OpenAI extraction yet.';
  if (value.status === 413 || value.code === 'FILE_TOO_LARGE')
    return 'The image exceeds the upload limit. Choose a smaller photo or a smaller crop.';
  if (value.status === 415 || value.code === 'FILE_UNSUPPORTED_TYPE')
    return 'The server rejected the image format. Choose another photo and crop it again.';
  if (value.status === 401)
    return 'Your session has expired. Sign in again before scanning.';
  if (value.status === 403)
    return 'This account is not allowed to scan. Sign in with a patient account.';
  if (value.status === 404 || value.status === 405)
    return 'The scan endpoint is unavailable. The API needs an update.';
  if (value.status === 429 || value.code === 'RATE_LIMITED')
    return 'Scan limit reached. Wait before trying again.';
  if (value.code === 'PRESCRIPTION_SCAN_FAILED')
    return 'The AI service could not complete extraction. Try again later or enter details manually.';
  if (value.status === 400)
    return 'The server rejected the scan upload before extraction. Try selecting the photo again.';
  if (typeof value.status === 'number' && value.status >= 500)
    return 'The scan server is unavailable or could not process the upload. Try again later.';
  if (
    value.code === 'INVALID_RESPONSE' ||
    (typeof value.status === 'number' &&
      value.status >= 200 &&
      value.status < 300)
  )
    return 'The server returned an unreadable scan response. Please try again later.';
  if (value.name === 'AbortError' || value.name === 'TimeoutError')
    return 'The scan request timed out. Check your connection before trying again.';
  if (value.name === 'TypeError')
    return 'The scan upload could not be completed. Check your connection and try again.';
  return 'The scan could not be completed. Choose the photo again or enter details manually.';
}
