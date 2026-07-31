/** UAE mobile visual mask: +971 XX XXX XXXX (e.g. +971 50 123 4567) */
export const UAE_PHONE_PLACEHOLDER = "+971 50 123 4567";
/** National digits only (country code selected separately): XX XXX XXXX */
export const UAE_NATIONAL_PHONE_PLACEHOLDER = "50 123 4567";
export const UAE_PHONE_MAX_LENGTH = 16;
export const UAE_NATIONAL_PHONE_MAX_LENGTH = 11;

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Normalize to up to 9 national mobile digits (no country code, no leading 0).
 * Accepts local (05…), national (5…), or international (+971 / 971…) input.
 */
export function toUaeNationalDigits(value: string) {
  let digits = digitsOnly(value);
  if (digits.startsWith("971")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 9);
}

function formatNationalGroups(national: string) {
  const p1 = national.slice(0, 2);
  const p2 = national.slice(2, 5);
  const p3 = national.slice(5, 9);

  let formatted = p1;
  if (p2) formatted += ` ${p2}`;
  if (p3) formatted += ` ${p3}`;
  return formatted;
}

/** Format as +971 XX XXX XXXX */
export function formatUaePhone(value: string) {
  const national = toUaeNationalDigits(value);
  if (!national) return "";
  return `+971 ${formatNationalGroups(national)}`;
}

/** Format national number as XX XXX XXXX (for use with a separate +971 selector) */
export function formatUaeNationalPhone(value: string) {
  const national = toUaeNationalDigits(value);
  if (!national) return "";
  return formatNationalGroups(national);
}

/** E.164 without spaces: +971501234567 */
export function toUaePhoneE164(value: string) {
  const national = toUaeNationalDigits(value);
  return national ? `+971${national}` : "";
}

export function isValidUaeMobile(value: string) {
  const national = toUaeNationalDigits(value);
  return national.length === 9 && national.startsWith("5");
}
