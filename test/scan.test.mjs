import assert from 'node:assert/strict';
import { test } from 'node:test';
import { suggestedCrop, moveCorner, cropPixels } from '../.test-dist/crop.js';
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
  try {
    globalThis.FormData = class {
      append(name, value) {
        entries.push([name, value]);
      }
    };
    scanUpload(crop, true, true);
  } finally {
    globalThis.FormData = original;
  }
  assert.deepEqual(entries, [
    ['file', { uri: crop.uri, type: 'image/jpeg', name: 'medicines-crop.jpg' }],
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
