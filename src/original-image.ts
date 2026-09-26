import { File } from 'expo-file-system';
import { uploadError } from './prescription-model';
import type { OriginalImage } from './scan-preview';
export function originalUpload(image: OriginalImage, page: number) {
  if (!Number.isInteger(page) || page < 1 || page > 20)
    throw new Error('A prescription supports up to 20 original images.');
  const file = new File(image.uri);
  const error = uploadError(image.mimeType, file.size);
  if (error) throw new Error(error);
  if (image.width * image.height > 20000000)
    throw new Error(
      'The original image exceeds 20 million pixels. Attach a smaller original separately.',
    );
  const form = new FormData();
  form.append('file', file);
  form.append('pageNumber', String(page));
  return form;
}
