/* global Blob */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  suggestedCrop,
  moveCorner,
  resizeCrop,
  cropPixels,
  scanImageSize,
} from '../.test-dist/crop.js';
import { scanUpload, scanPreview } from '../.test-dist/scan-preview.js';
test('suggested crop excludes borders and adjustable edges remain in image bounds', () => {
  const crop = suggestedCrop();
  assert.ok(crop.top > 0 && crop.bottom < 1 && crop.left > 0 && crop.right < 1);
  const start = moveCorner(crop, 'start', -10, -10);
  assert.equal(start.left, 0);
  assert.equal(start.top, 0);
  const end = moveCorner(crop, 'end', -10, -10);
  assert.ok(end.right > crop.left);
  assert.ok(end.bottom > crop.top);
  assert.deepEqual(
    cropPixels({ left: 0.1, top: 0.25, right: 0.9, bottom: 0.75 }, 1000, 2000),
    { originX: 100, originY: 500, width: 800, height: 1000 },
  );
  assert.throws(() => cropPixels({ ...crop, left: -1 }, 100, 100));
  assert.throws(() => cropPixels(crop, 0, 100));
});
test('crop upload requires both explicit privacy attestation and processing agreement', () => {
  const crop = {
    uri: 'file:///local/medicines-crop.jpg',
    mimeType: 'image/jpeg',
  };
  assert.throws(() => scanUpload(crop, false, true), /no patient information/);
  assert.throws(() => scanUpload(crop, true, false), /Agree to server/);
  assert.throws(
    () =>
      scanUpload(
        { uri: 'https://remote/image.jpg', mimeType: 'image/jpeg' },
        true,
        true,
      ),
    /local JPEG/,
  );
  const original = globalThis.FormData;
  const entries = [];
  const file = new Blob(['synthetic'], { type: 'image/jpeg' });
  try {
    globalThis.FormData = class {
      append(name, value) {
        entries.push([name, value]);
      }
    };
    scanUpload(crop, true, true, file);
  } finally {
    globalThis.FormData = original;
  }
  assert.deepEqual(entries, [
    ['file', file],
    ['externalProcessingConsent', 'true'],
    ['medicinesOnlyCropConfirmed', 'true'],
  ]);
});
test('suggestions cannot inject catalog links, confirmations, or infer missing dose from strength', () => {
  const result = scanPreview({
    provider: 'OpenAI',
    requiresReview: true,
    prescriptionDate: null,
    validUntil: null,
    warnings: [],
    medications: [
      {
        extractedName: 'Synthetic medicine',
        strength: '500 mg',
        dosage: null,
        medicineId: 'injected',
        confirmed: true,
        scheduledTimes: null,
      },
    ],
  });
  assert.equal(result.medications[0].medicineId, '');
  assert.equal(result.medications[0].strength, '500 mg');
  assert.equal(result.medications[0].dosage, '');
  assert.equal(result.medications[0].scheduledTimes, '');
  assert.equal('confirmed' in result.medications[0], false);
  assert.throws(() =>
    scanPreview({ provider: 'OpenAI', requiresReview: false, medications: [] }),
  );
  assert.throws(() =>
    scanPreview({
      provider: 'OpenAI',
      requiresReview: true,
      medications: [{ dosage: '1' }],
    }),
  );
});

test('box suggestions keep pack quantity separate from prescribed quantity and reject partial expiry', () => {
  const result = scanPreview({
    provider: 'OpenAI',
    requiresReview: true,
    medications: [{ extractedName: 'Synthetic', strength: '500 mg' }],
    packageInfo: { quantity: 20, unit: 'TABLET', expiryDate: '2027-02' },
    warnings: [],
  });
  assert.equal(result.medications[0].quantity, '');
  assert.equal(result.medications[0].dosage, '');
  assert.equal(result.packageInfo.quantity, '20');
  assert.equal(result.packageInfo.expiryDate, '');
});

test('all four crop corners preserve opposite edges and stop at image boundaries', () => {
  const initial = { left: 0.2, top: 0.2, right: 0.8, bottom: 0.8 };
  for (const corner of ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']) {
    const left = corner.endsWith('Left'),
      top = corner.startsWith('top');
    const expanded = resizeCrop(
      initial,
      corner,
      left ? -10 : 10,
      top ? -10 : 10,
    );
    assert.equal(expanded.left, left ? 0 : initial.left);
    assert.equal(expanded.right, left ? initial.right : 1);
    assert.equal(expanded.top, top ? 0 : initial.top);
    assert.equal(expanded.bottom, top ? initial.bottom : 1);
    const collapsed = resizeCrop(
      initial,
      corner,
      left ? 10 : -10,
      top ? 10 : -10,
    );
    assert.ok(collapsed.right - collapsed.left >= 0.049999);
    assert.ok(collapsed.bottom - collapsed.top >= 0.049999);
    assert.doesNotThrow(() => cropPixels(collapsed, 1200, 800));
  }
});
test('crop gesture displacement is relative to the grab point and can reverse smoothly', () => {
  const start = { left: 0.2, top: 0.2, right: 0.8, bottom: 0.8 };
  const moved = resizeCrop(start, 'topRight', 30 / 300, 60 / 600);
  assert.equal(moved.right, 0.9);
  assert.ok(Math.abs(moved.top - 0.3) < 1e-9);
  assert.deepEqual(resizeCrop(start, 'topRight', 0, 0), start);
  assert.deepEqual(resizeCrop(moved, 'bottomLeft', 0, 0), moved);
});

test('high-resolution camera crops are scaled below upload raster limits without upscaling', () => {
  assert.deepEqual(scanImageSize(8000, 6000), { width: 2400, height: 1800 });
  assert.deepEqual(scanImageSize(6000, 8000), { width: 1800, height: 2400 });
  assert.deepEqual(scanImageSize(800, 600), { width: 800, height: 600 });
  assert.deepEqual(scanImageSize(10000, 1), { width: 2400, height: 1 });
  assert.throws(() => scanImageSize(0, 100));
});
