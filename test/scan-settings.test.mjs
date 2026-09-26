import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scanSettingsError } from '../.test-dist/scan-errors.js';
test('missing scan settings routes explain an API update instead of suggesting a connection retry', () => {
  for (const status of [404, 405])
    assert.match(scanSettingsError({ status }), /API needs an update/);
});
test('scan settings distinguish session, role, service and connection failures without leaking errors', () => {
  assert.match(scanSettingsError({ status: 401 }), /Sign in again/);
  assert.match(scanSettingsError({ status: 403 }), /patient accounts/);
  assert.match(scanSettingsError({ status: 503 }), /temporarily unavailable/);
  assert.match(
    scanSettingsError(new Error('private server details')),
    /Check your connection/,
  );
  assert.match(scanSettingsError(null, true), /Unable to save/);
  assert.doesNotMatch(
    scanSettingsError(new Error('private server details')),
    /private/,
  );
});
