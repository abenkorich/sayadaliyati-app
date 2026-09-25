import assert from 'node:assert/strict';
import { ApiClient, apiUrl } from '../.test-dist/client.js';
const endpoint = process.env.API_TEST_URL;
if (
  !endpoint ||
  !process.env.API_TEST_IDENTIFIER ||
  !process.env.API_TEST_PASSWORD
)
  throw new Error(
    'Configure API_TEST_URL, API_TEST_IDENTIFIER and API_TEST_PASSWORD in ignored .env.test using a dedicated test account.',
  );
const url = new URL(endpoint);
const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
const base = apiUrl(endpoint, local);
let stored = null;
const vault = {
  get: async () => stored,
  set: async (value) => {
    stored = value;
  },
  clear: async () => {
    stored = null;
  },
};
const client = new ApiClient(base, vault);
let signedIn = false;
try {
  await client.signIn({
    identifier: process.env.API_TEST_IDENTIFIER,
    password: process.env.API_TEST_PASSWORD,
  });
  signedIn = true;
  const restored = new ApiClient(base, vault);
  assert.equal(await restored.restore(), true);
  try {
    const [profile, catalog, inbox, preferences] = await Promise.all([
      restored.request('/me/profile'),
      restored.request('/medicines?limit=1'),
      restored.request('/me/notifications?limit=1'),
      restored.request('/me/notification-preferences'),
    ]);
    assert.equal(typeof profile.data.firstName, 'string');
    assert.ok(Array.isArray(catalog.data));
    assert.ok(Array.isArray(inbox.data));
    assert.equal(typeof preferences.data.configured, 'boolean');
  } finally {
    await restored.logout();
    signedIn = false;
  }
  assert.equal(stored, null);
  console.log(
    'HTTP-only API smoke test passed: sign-in, rotation, profile, catalog, inbox, preferences, logout.',
  );
} finally {
  if (signedIn) await client.logout();
}
