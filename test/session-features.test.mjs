import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  dateValue,
  parseDate,
  parseTime,
  timeValue,
} from '../.test-dist/date-time.js';
import { languages, messages, translate } from '../.test-dist/translations.js';
import { blank, createBody } from '../.test-dist/prescription-model.js';

test('calendar values survive timezones without UTC date shifts', () => {
  const original = process.env.TZ;
  try {
    for (const zone of [
      'Africa/Algiers',
      'America/Los_Angeles',
      'Pacific/Kiritimati',
    ]) {
      process.env.TZ = zone;
      for (const value of [
        '2028-02-29',
        '2026-01-01',
        '2026-12-31',
        '0001-01-01',
      ]) {
        const parsed = parseDate(value);
        assert.ok(parsed);
        assert.equal(dateValue(parsed), value);
      }
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
test('picker conversion rejects invalid dates and keeps minute precision', () => {
  for (const value of [
    '',
    '2026-02-29',
    '2026-13-01',
    '2026-04-31',
    '0000-01-01',
  ])
    assert.equal(parseDate(value), null);
  for (const value of ['00:00', '08:05', '23:59'])
    assert.equal(timeValue(parseTime(value)), value);
  for (const value of ['', '24:00', '8:00', '12:60'])
    assert.equal(parseTime(value), null);
});
test('picker values preserve the prescription API contract and optional blanks', () => {
  const line = {
    ...blank(),
    extractedName: 'Example medicine',
    startDate: dateValue(parseDate('2026-10-01')),
    endDate: dateValue(parseDate('2026-10-03')),
    scheduledTimes: ['08:05', '20:30']
      .map((value) => timeValue(parseTime(value)))
      .join(','),
  };
  const body = createBody([line], '2026-09-30', '');
  assert.deepEqual(body.medications[0].scheduledTimes, ['08:05', '20:30']);
  assert.equal(body.medications[0].startDate, '2026-10-01');
  assert.equal(body.medications[0].endDate, '2026-10-03');
  assert.equal(body.validUntil, null);
  assert.throws(() =>
    createBody([{ ...line, scheduledTimes: '08:05,08:05' }], '', ''),
  );
  assert.throws(() =>
    createBody([{ ...line, scheduledTimes: '08:05,' }], '', ''),
  );
});
test('all app translations include each language and preserve placeholders', () => {
  assert.deepEqual(languages, ['en', 'fr', 'ar']);
  for (const [key, entry] of Object.entries(messages)) {
    const expected = [...key.matchAll(/\{(\w+)\}/g)]
      .map((match) => match[1])
      .sort();
    for (const language of languages) {
      assert.ok(entry[language]?.trim(), `${key}: ${language}`);
      assert.deepEqual(
        [...entry[language].matchAll(/\{(\w+)\}/g)]
          .map((match) => match[1])
          .sort(),
        expected,
        `${key}: ${language}`,
      );
    }
  }
  assert.equal(translate('fr', 'Sign in'), 'Se connecter');
  assert.equal(translate('ar', 'Back'), 'رجوع');
  assert.equal(
    translate('fr', 'Open {name}', { name: 'Medicine $& {code}' }),
    'Ouvrir Medicine $& {code}',
  );
  assert.equal(
    translate('ar', 'Daily time {number}', { number: 2 }),
    'وقت الجرعة اليومية 2',
  );
});
