import {
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";
import examples from "libphonenumber-js/mobile/examples";

/** E.164 from react-phone-input-2 digit string (e.g. "256712345678" → "+256712345678") */
export function toE164FromPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

/** Normalize any phone string to E.164 for reliable equality checks. */
export function normalizePhoneE164(phone: string | null | undefined) {
  if (!phone?.trim()) return "";

  try {
    const parsed = parsePhoneNumberFromString(phone);
    if (parsed) return parsed.format("E.164");
  } catch {
    // fall through to digit normalization
  }

  const digits = phone.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

/** Digits only (no + / spaces) — suitable as CountryPhoneInput value. */
export function toPhoneInputDigits(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Ensure value includes dial digits for CountryPhoneInput.
 * Accepts national, local (0…), or full international input.
 */
export function ensurePhoneDigitsWithDial(value: string, dialCode: string) {
  let digits = value.replace(/\D/g, "");
  const dial = dialCode.replace(/\D/g, "");
  if (!digits) return "";
  if (dial && digits.startsWith(dial)) return digits;
  if (digits.startsWith("0")) digits = digits.slice(1);
  return dial ? dial + digits : digits;
}

/** National digits only (strip dial code / leading 0). */
export function toNationalFromPhoneDigits(value: string, dialCode: string) {
  let digits = value.replace(/\D/g, "");
  const dial = dialCode.replace(/\D/g, "");
  if (dial && digits.startsWith(dial)) digits = digits.slice(dial.length);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function phoneExampleForIso(countryIso: string) {
  const iso = countryIso.toUpperCase() as CountryCode;
  try {
    const example = getExampleNumber(iso, examples);
    if (example) return example.formatInternational();
  } catch {
    // fall through
  }
  return "";
}

/** Expected national digit count for a country (from mobile example). */
export function expectedNationalLength(countryIso: string) {
  const iso = countryIso.toUpperCase() as CountryCode;
  try {
    const example = getExampleNumber(iso, examples);
    return example?.nationalNumber?.length ?? 0;
  } catch {
    return 0;
  }
}

/**
 * National mask for react-phone-input-2, derived from that country's
 * real mobile example — works for every ISO country dynamically.
 * e.g. AE → ".. ... ....", PK → "... .......", US → "... ... ...."
 */
export function nationalMaskForIso(countryIso: string) {
  const iso = countryIso.toUpperCase() as CountryCode;
  try {
    const example = getExampleNumber(iso, examples);
    if (!example) return undefined;

    const dial = `+${example.countryCallingCode}`;
    const intl = example.formatInternational();
    const nationalPart = intl.startsWith(dial)
      ? intl.slice(dial.length).replace(/^\s+/, "")
      : example.nationalNumber;

    const mask = nationalPart.replace(/\d/g, ".");
    return mask.includes(".") ? mask : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Clamp to dial + max national digits for ANY selected country
 * (length comes from libphonenumber mobile example).
 */
export function clampPhoneToCountryMax(
  value: string,
  dialCode: string,
  countryIso: string,
) {
  const digits = value.replace(/\D/g, "");
  const dial = dialCode.replace(/\D/g, "");
  if (!digits) return "";
  if (!dial || !digits.startsWith(dial)) return digits;

  const maxNat = expectedNationalLength(countryIso);
  if (maxNat <= 0) return digits;

  return dial + digits.slice(dial.length, dial.length + maxNat);
}

/**
 * Bloom-style message prefix (no country mobile-prefix example).
 * Prefix/start-digit rules are not enforced anywhere in the app.
 */
export function invalidPhoneMessage(
  _countryIso: string,
  prefix = "Invalid phone number",
  _exampleLabel = "Example",
) {
  return prefix.endsWith(".") ? prefix : `${prefix}.`;
}

/** True when digits include more than just the dialing code. */
export function hasNationalPhoneDigits(value: string, dialCode: string) {
  const digits = value.replace(/\D/g, "");
  const dial = dialCode.replace(/\D/g, "");
  return digits.length > dial.length;
}

/**
 * True when the user has typed enough national digits for this country.
 */
export function isPhoneEntryComplete(
  value: string,
  dialCode: string,
  countryIso: string,
) {
  const digits = value.replace(/\D/g, "");
  const dial = dialCode.replace(/\D/g, "");
  if (digits.length <= dial.length) return false;

  const nationalLen = digits.length - dial.length;
  const expected = expectedNationalLength(countryIso);
  if (expected > 0 && nationalLen >= expected) return true;

  try {
    const parsed = parsePhoneNumberFromString(
      toE164FromPhoneDigits(value),
      countryIso.toUpperCase() as CountryCode,
    );
    return Boolean(parsed?.isPossible());
  } catch {
    return false;
  }
}

/**
 * True when national digit count matches the selected country's expected length.
 * Does not enforce mobile prefix rules (e.g. UAE starting with 5).
 */
export function isValidPhoneByLength(
  value: string,
  dialCode: string,
  countryIso: string,
) {
  const digits = value.replace(/\D/g, "");
  const dial = dialCode.replace(/\D/g, "");
  if (!digits || digits.length <= dial.length) return false;

  const nationalLen = digits.length - dial.length;
  const expected = expectedNationalLength(countryIso);
  if (expected > 0) return nationalLen === expected;

  try {
    const parsed = parsePhoneNumberFromString(
      toE164FromPhoneDigits(value),
      countryIso.toUpperCase() as CountryCode,
    );
    return Boolean(parsed?.isPossible());
  } catch {
    return false;
  }
}

/**
 * Phone validity for forms: length/mask only (no start-digit / mobile-type rules).
 */
export function isValidCountryPhoneNumber(
  value: string,
  countryIso?: string,
) {
  const digits = value.replace(/\D/g, "");
  if (!digits || digits.length < 5) return false;

  if (!countryIso) {
    return digits.length >= 8 && digits.length <= 15;
  }

  try {
    const dial = `+${getCountryCallingCode(countryIso.toUpperCase() as CountryCode)}`;
    return isValidPhoneByLength(value, dial, countryIso);
  } catch {
    return false;
  }
}
