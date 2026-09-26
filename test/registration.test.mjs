import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registrationError } from '../.test-dist/registration.js';
const input = {
  firstName: 'Test',
  lastName: 'Patient',
  password: 'a'.repeat(15),
};
test('registration explains short and long passwords before submission', () => {
  assert.match(
    registrationError({ ...input, password: 'short' }),
    /at least 15 characters/,
  );
  assert.match(
    registrationError({ ...input, password: 'a'.repeat(129) }),
    /no more than 128/,
  );
  assert.equal(registrationError(input), null);
});
test('Unicode characters count once and password whitespace is preserved', () => {
  assert.match(
    registrationError({ ...input, password: '😀'.repeat(14) }),
    /too short/,
  );
  assert.equal(
    registrationError({ ...input, password: '😀'.repeat(15) }),
    null,
  );
  assert.equal(registrationError({ ...input, password: ' '.repeat(15) }), null);
  assert.match(
    registrationError({ ...input, password: 'a'.repeat(15) + '\ud800' }),
    /unsupported character/,
  );
});
test('registration identifies missing and overlong names', () => {
  assert.equal(
    registrationError({ ...input, firstName: ' ' }),
    'Enter your first name.',
  );
  assert.equal(
    registrationError({ ...input, lastName: '' }),
    'Enter your last name.',
  );
  assert.match(
    registrationError({ ...input, lastName: 'x'.repeat(101) }),
    /Last name must/,
  );
});
