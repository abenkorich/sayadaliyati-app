export const units = [
  'TABLET',
  'CAPSULE',
  'ML',
  'MG',
  'G',
  'DOSE',
  'SACHET',
  'AMPOULE',
  'VIAL',
  'SUPPOSITORY',
  'DROP',
  'PATCH',
  'OTHER',
];

export function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function stockError(
  quantity: string,
  unit: string,
  expiry: string,
): string | null {
  if (!/^\d+(\.\d{1,3})?$/.test(quantity) || Number(quantity) > 999999999.999)
    return 'Enter a quantity of 0 or more, with up to 3 decimal places.';
  if (!units.includes(unit))
    return 'Choose the unit shown on your medicine packaging.';
  if (
    expiry &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(expiry) ||
      !Number.isFinite(Date.parse(expiry)) ||
      new Date(expiry).toISOString().slice(0, 10) !== expiry)
  )
    return 'Enter a valid expiry date as YYYY-MM-DD.';
  return null;
}
