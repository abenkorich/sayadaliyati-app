import { units, stockError } from './stock';
import { blank, fields, type Inputs } from './prescription-model';
export type OriginalImage = {
  uri: string;
  mimeType: string;
  width: number;
  height: number;
};
export type ScanPreview = {
  originalImage?: OriginalImage;
  packageInfo?: { quantity: string; unit: string; expiryDate: string };
  medications: Inputs[];
  prescriptionDate: string;
  validUntil: string;
  warnings: string[];
};
export function scanPreview(value: unknown): ScanPreview {
  if (!value || typeof value !== 'object')
    throw new Error('Invalid extraction response.');
  const data = value as Record<string, unknown>;
  if (
    data.provider !== 'OpenAI' ||
    data.requiresReview !== true ||
    !Array.isArray(data.medications) ||
    data.medications.length > 20
  )
    throw new Error('Invalid extraction response.');
  const medications = data.medications.map((item) => {
    if (!item || typeof item !== 'object')
      throw new Error('Invalid medicine suggestion.');
    const row = item as Record<string, unknown>,
      result = blank();
    for (const field of fields) {
      if (field.name === 'medicineId') continue;
      const v = row[field.name];
      if (v === null || v === undefined) continue;
      if (field.kind === 'times') {
        if (
          !Array.isArray(v) ||
          v.length > 24 ||
          v.some(
            (x) =>
              typeof x !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(x),
          )
        )
          throw new Error('Invalid extracted times.');
        result[field.name] = v.join(', ');
      } else if (field.kind === 'number') {
        if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0)
          throw new Error('Invalid extracted number.');
        result[field.name] = String(v);
      } else {
        if (typeof v !== 'string' || v.length > 4000)
          throw new Error('Invalid extracted text.');
        result[field.name] = v;
      }
    }
    return result;
  });
  const date = (v: unknown) =>
    typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '';
  const pack = data.packageInfo as Record<string, unknown> | undefined;
  const quantity =
    typeof pack?.quantity === 'number' &&
    Number.isFinite(pack.quantity) &&
    pack.quantity > 0
      ? String(pack.quantity)
      : '';
  const unit =
    typeof pack?.unit === 'string' && units.includes(pack.unit)
      ? pack.unit
      : '';
  const expiry = date(pack?.expiryDate);
  return {
    ...(pack
      ? {
          packageInfo: {
            quantity,
            unit,
            expiryDate:
              expiry && !stockError('1', 'TABLET', expiry) ? expiry : '',
          },
        }
      : {}),
    medications,
    prescriptionDate: date(data.prescriptionDate),
    validUntil: date(data.validUntil),
    warnings: Array.isArray(data.warnings)
      ? data.warnings
          .filter((v): v is string => typeof v === 'string')
          .slice(0, 20)
          .map((x) => x.slice(0, 400))
      : [],
  };
}
// A selected/cropped local URI is the only image source accepted by this flow.
export function scanUpload(
  image: { uri: string; mimeType: string },
  privacyConfirmed: boolean,
  processingConsent: boolean,
  file: Blob,
) {
  if (!privacyConfirmed)
    throw new Error(
      'Confirm the crop contains only medicines and no patient information.',
    );
  if (!processingConsent)
    throw new Error(
      'Agree to server and OpenAI processing before sending this crop.',
    );
  if (
    !image.uri.startsWith('file://') ||
    !['image/jpeg', 'image/png'].includes(image.mimeType)
  )
    throw new Error('Choose and crop a local JPEG or PNG image.');
  const form = new FormData();
  // Expo 57 fetch needs a Blob/File with readable bytes, not an RN URI descriptor.
  form.append(
    'file',
    file,
    'medicines-crop.' + (image.mimeType === 'image/png' ? 'png' : 'jpg'),
  );
  form.append('externalProcessingConsent', 'true');
  form.append('medicinesOnlyCropConfirmed', 'true');
  return form;
}
