import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stockError, localDate } from '../.test-dist/stock.js';
test('stock entry rejects invalid quantity and requires an explicit unit', () => {
  for (const quantity of ['', '-1', '1e3', '1.2345', '1000000000', 'NaN'])
    assert.match(stockError(quantity, 'TABLET', ''), /quantity/);
  assert.match(stockError('20', '', ''), /unit/);
  assert.equal(stockError('0', 'ML', ''), null);
  assert.equal(stockError('999999999.999', 'ML', ''), null);
});
test('expiry input validates real calendar dates without rejecting expired stock', () => {
  for (const date of ['2026-02-29', '2026-04-31', '2026-13-01', 'tomorrow'])
    assert.match(stockError('2', 'TABLET', date), /valid expiry/);
  assert.equal(stockError('2', 'TABLET', '2024-02-29'), null);
  assert.equal(stockError('2', 'TABLET', ''), null);
});
test('expiry filters use a padded local calendar date', () => {
  assert.equal(localDate(new Date(2026, 0, 2, 23, 59)), '2026-01-02');
});
