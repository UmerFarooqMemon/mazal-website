export type KycProfileType = "uae_resident" | "international" | null;

export interface KycIdentityData {
  fullLegalName: string;
  dateOfBirth: string;
  emiratesId: string;
  emirateOfResidence: string;
  passportNumber: string;
  countryOfResidence: string;
  phone: string;
  email: string;
  phoneCountryCode: string;
  /** ISO2 for CountryPhoneInput (e.g. ae, pk) */
  phoneCountryIso?: string;
}

/** API multipart field names for document uploads */
export type KycDocumentKey =
  | "emirates_id_front"
  | "emirates_id_back"
  | "selfie_with_id"
  | "ded_traffic_file"
  | "passport_bio_page"
  | "selfie_with_passport"
  | "proof_of_address"
  | "source_of_funds";

export type KycDocuments = Partial<Record<KycDocumentKey, File | null>>;

export interface KycUploadedDocument {
  id?: number;
  type: string;
  name?: string;
  downloadUrl?: string;
}

export interface KycFormState {
  profileType: KycProfileType;
  identity: KycIdentityData;
  documents: KycDocuments;
  uploadedDocuments: KycUploadedDocument[];
  custodyAgreed: boolean;
  status: string | null;
  statusLabel: string | null;
  rejectionReason: string | null;
  verified: boolean;
}

export const UAE_REQUIRED_DOCS: KycDocumentKey[] = [
  "emirates_id_front",
  "emirates_id_back",
  "selfie_with_id",
];

export const INTL_REQUIRED_DOCS: KycDocumentKey[] = [
  "passport_bio_page",
  "selfie_with_passport",
  "proof_of_address",
];

export const KYC_MAX_FILE_SIZE_KB = 5120;
export const KYC_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];
export const KYC_ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "pdf",
] as const;

export const INITIAL_IDENTITY: KycIdentityData = {
  fullLegalName: "",
  dateOfBirth: "",
  emiratesId: "",
  emirateOfResidence: "",
  passportNumber: "",
  countryOfResidence: "",
  phone: "",
  email: "",
  phoneCountryCode: "+971",
  phoneCountryIso: "ae",
};

export const INITIAL_KYC_STATE: KycFormState = {
  profileType: null,
  identity: INITIAL_IDENTITY,
  documents: {},
  uploadedDocuments: [],
  custodyAgreed: false,
  status: null,
  statusLabel: null,
  rejectionReason: null,
  verified: false,
};

/** Visual mask: 3-4-7-1 digit groups (784-XXXX-XXXXXXX-X) */
export const EMIRATES_ID_PREFIX = "784";
export const EMIRATES_ID_PLACEHOLDER = "784 - ---- - ------- -";
export const EMIRATES_ID_MAX_LENGTH = 18;

/** Digits only; Emirates ID must be 15 digits starting with 784 */
export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/** First 3 digits must be 784 — user types manually; wrong digits are rejected */
export function enforceEmiratesIdPrefix(digits: string) {
  let result = "";
  for (let i = 0; i < digits.length && i < 15; i++) {
    if (i < EMIRATES_ID_PREFIX.length) {
      if (digits[i] !== EMIRATES_ID_PREFIX[i]) break;
      result += digits[i];
    } else {
      result += digits[i];
    }
  }
  return result;
}

export function formatEmiratesId(value: string) {
  const digits = enforceEmiratesIdPrefix(digitsOnly(value));
  if (!digits) return "";

  const seg1 = digits.slice(0, 3);
  const seg2 = digits.slice(3, 7);
  const seg3 = digits.slice(7, 14);
  const seg4 = digits.slice(14, 15);

  let formatted = seg1;
  if (seg2) formatted += `-${seg2}`;
  if (seg3) formatted += `-${seg3}`;
  if (seg4) formatted += `-${seg4}`;

  return formatted;
}

export function isValidEmiratesId(value: string) {
  const digits = digitsOnly(value);
  return digits.length === 15 && digits.startsWith("784");
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const PHONE_LENGTH_BY_CODE: Record<string, { min: number; max: number }> = {
  "+971": { min: 9, max: 9 }, // UAE mobile
  "+966": { min: 9, max: 9 }, // Saudi mobile
  "+974": { min: 8, max: 8 }, // Qatar
  "+973": { min: 8, max: 8 }, // Bahrain
  "+968": { min: 8, max: 8 }, // Oman
  "+965": { min: 8, max: 8 }, // Kuwait
  "+1": { min: 10, max: 10 }, // US / Canada
  "+44": { min: 10, max: 10 }, // UK mobile
  "+91": { min: 10, max: 10 }, // India
  "+92": { min: 10, max: 10 }, // Pakistan
};

const DEFAULT_PHONE_LENGTH = { min: 7, max: 15 };

/** Country of residence label → E.164 dialing code */
export const KYC_COUNTRY_DIAL_CODES: Record<string, string> = {
  "United Arab Emirates": "+971",
  "Saudi Arabia": "+966",
  Kuwait: "+965",
  Bahrain: "+973",
  Qatar: "+974",
  Oman: "+968",
  India: "+91",
  Pakistan: "+92",
  "United Kingdom": "+44",
  "United States": "+1",
  Other: "+971",
};

export function dialCodeForCountry(countryName: string): string {
  return KYC_COUNTRY_DIAL_CODES[countryName] || "+971";
}

export function getPhoneLengthRule(countryCode: string) {
  return PHONE_LENGTH_BY_CODE[countryCode] ?? DEFAULT_PHONE_LENGTH;
}

/** National digits only (no dial code / leading 0), capped to country max */
export function toNationalPhoneDigits(value: string, countryCode: string) {
  const codeDigits = countryCode.replace(/\D/g, "");
  let digits = digitsOnly(value);
  if (codeDigits && digits.startsWith(codeDigits)) {
    digits = digits.slice(codeDigits.length);
  }
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, getPhoneLengthRule(countryCode).max);
}

/** Digits only, capped to the country max (strips leading 0) */
export function sanitizePhone(value: string, countryCode: string) {
  return toNationalPhoneDigits(value, countryCode);
}

export function isValidPhone(value: string, countryCode: string) {
  const digits = toNationalPhoneDigits(value, countryCode);
  if (!digits) return false;
  const { min, max } = getPhoneLengthRule(countryCode);
  if (digits.length < min || digits.length > max) return false;
  return true;
}

/** Display format: +CODE followed by national digits (UAE keeps XX XXX XXXX groups) */
export function formatPhoneWithCountryCode(value: string, countryCode: string) {
  const national = toNationalPhoneDigits(value, countryCode);
  if (!national) return "";

  if (countryCode === "+971") {
    const p1 = national.slice(0, 2);
    const p2 = national.slice(2, 5);
    const p3 = national.slice(5, 9);
    let formatted = p1;
    if (p2) formatted += ` ${p2}`;
    if (p3) formatted += ` ${p3}`;
    return `${countryCode} ${formatted}`;
  }

  // Group remaining national digits in chunks of 3–4 for readability
  const parts: string[] = [];
  let i = 0;
  while (i < national.length) {
    const size = i === 0 && national.length > 8 ? 3 : 3;
    parts.push(national.slice(i, i + size));
    i += size;
  }
  return `${countryCode} ${parts.join(" ")}`;
}

export function phonePlaceholderForCode(countryCode: string) {
  const { max } = getPhoneLengthRule(countryCode);
  if (countryCode === "+971") return "+971 -- --- ----";
  const dashes = "-".repeat(Math.min(max, 10));
  return `${countryCode} ${dashes}`;
}

export function phoneMaxLengthForCode(countryCode: string) {
  // code + spaces + national digits
  return countryCode.length + 1 + getPhoneLengthRule(countryCode).max + 4;
}

export function isAllowedKycFile(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const mimeOk =
    !file.type ||
    KYC_ALLOWED_MIME_TYPES.includes(file.type) ||
    file.type === "image/jpg";
  const extOk = KYC_ALLOWED_EXTENSIONS.includes(
    ext as (typeof KYC_ALLOWED_EXTENSIONS)[number],
  );
  return mimeOk && extOk;
}

export function isWithinKycFileSize(file: File, maxKb = KYC_MAX_FILE_SIZE_KB) {
  return file.size <= maxKb * 1024;
}
