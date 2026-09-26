export type Crop = { left: number; top: number; right: number; bottom: number };
// A layout suggestion only. It cannot locate patient information.
export const suggestedCrop = (): Crop => ({
  left: 0.06,
  top: 0.3,
  right: 0.94,
  bottom: 0.78,
});
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
export type CropCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export function resizeCrop(
  crop: Crop,
  corner: CropCorner,
  dx: number,
  dy: number,
): Crop {
  const left = corner === 'topLeft' || corner === 'bottomLeft';
  const top = corner === 'topLeft' || corner === 'topRight';
  return {
    left: left ? clamp(crop.left + dx, 0, crop.right - 0.05) : crop.left,
    right: left ? crop.right : clamp(crop.right + dx, crop.left + 0.05, 1),
    top: top ? clamp(crop.top + dy, 0, crop.bottom - 0.05) : crop.top,
    bottom: top ? crop.bottom : clamp(crop.bottom + dy, crop.top + 0.05, 1),
  };
}
export function moveCorner(
  crop: Crop,
  corner: 'start' | 'end',
  dx: number,
  dy: number,
): Crop {
  return resizeCrop(
    crop,
    corner === 'start' ? 'topLeft' : 'bottomRight',
    dx,
    dy,
  );
}
export function cropPixels(crop: Crop, width: number, height: number) {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    ![crop.left, crop.top, crop.right, crop.bottom].every(Number.isFinite) ||
    crop.left < 0 ||
    crop.top < 0 ||
    crop.right > 1 ||
    crop.bottom > 1 ||
    crop.right <= crop.left ||
    crop.bottom <= crop.top
  )
    throw new Error('Invalid crop selection.');
  const originX = Math.floor(crop.left * width),
    originY = Math.floor(crop.top * height);
  return {
    originX,
    originY,
    width: Math.min(
      width - originX,
      Math.max(1, Math.ceil(crop.right * width) - originX),
    ),
    height: Math.min(
      height - originY,
      Math.max(1, Math.ceil(crop.bottom * height) - originY),
    ),
  };
}

// Keep uploads below the API raster limit before decoding or contacting AI.
export function scanImageSize(width: number, height: number) {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < 1 ||
    height < 1
  )
    throw new Error('Invalid crop dimensions.');
  const scale = Math.min(1, 2400 / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
