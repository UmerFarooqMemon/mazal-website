/** UAE mobile mask outline (like Emirates ID dashes — not a sample number) */
export const UAE_PHONE_PLACEHOLDER = "+971 -- --- ----";
export const UAE_PHONE_MAX_LENGTH = 16;

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Up to 9 national digits (no country code, no leading 0).
 * Accepts local (05…), national (5…), or international (+971 / 971…) input.
 */
export function toUaeNationalDigits(value: string) {
  let digits = digitsOnly(value);
  if (digits.startsWith("971")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 9);
}

/** Sample shown in validation errors */
export const UAE_PHONE_SAMPLE = "+971 50 123 4567";

/** `null` = empty · `true` = starts with 5 · `false` = starts with something else */
export function uaeMobileStartsWithFive(value: string): boolean | null {
  const national = toUaeNationalDigits(value);
  if (!national) return null;
  return national.startsWith("5");
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

/** Format as +971 XX XXX XXXX — empty until the user types a digit */
export function formatUaePhone(value: string) {
  const national = toUaeNationalDigits(value);
  if (!national) return "";
  return `+971 ${formatNationalGroups(national)}`;
}

/** National-only format XX XXX XXXX (legacy / country-code selector flows) */
export function formatUaeNationalPhone(value: string) {
  const national = toUaeNationalDigits(value);
  if (!national) return "";
  return formatNationalGroups(national);
}

export const UAE_NATIONAL_PHONE_PLACEHOLDER = "-- --- ----";
export const UAE_NATIONAL_PHONE_MAX_LENGTH = 11;

/** E.164 without spaces: +971501234567 */
export function toUaePhoneE164(value: string) {
  const national = toUaeNationalDigits(value);
  return national ? `+971${national}` : "";
}

export function isValidUaeMobile(value: string) {
  const national = toUaeNationalDigits(value);
  return national.length === 9;
}

/**
 * How many *national* digits sit before `rawCaret` in a raw/masked phone string.
 * Ignores the fixed +971 / 971 prefix so caret math matches Emirates ID behavior.
 */
export function countUaeNationalDigitsBefore(rawValue: string, rawCaret: number) {
  const before = rawValue.slice(0, Math.max(0, rawCaret));
  return toUaeNationalDigits(before).length;
}

/** Caret index in a +971-masked value right after `nationalDigitCount` national digits */
export function caretAfterUaeNationalDigits(
  masked: string,
  nationalDigitCount: number,
) {
  if (nationalDigitCount <= 0) {
    // Place caret after "+971 " so the next digit lands in the national part
    const prefix = masked.match(/^\+971\s*/);
    return prefix ? prefix[0].length : 0;
  }

  const prefix = masked.match(/^\+971\s*/);
  const start = prefix ? prefix[0].length : 0;

  let seen = 0;
  for (let index = start; index < masked.length; index++) {
    const char = masked[index];
    if (char < "0" || char > "9") continue;

    seen++;
    if (seen < nationalDigitCount) continue;

    let caret = index + 1;
    while (caret < masked.length && (masked[caret] < "0" || masked[caret] > "9")) {
      caret++;
    }
    return caret;
  }

  return masked.length;
}
