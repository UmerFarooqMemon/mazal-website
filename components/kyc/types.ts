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
}

export interface KycFormState {
  profileType: KycProfileType;
  identity: KycIdentityData;
  documents: KycDocuments;
  uploadedDocuments: KycUploadedDocument[];
  custodyAgreed: boolean;
  status: string | null;
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
};

export const INITIAL_KYC_STATE: KycFormState = {
  profileType: null,
  identity: INITIAL_IDENTITY,
  documents: {},
  uploadedDocuments: [],
  custodyAgreed: false,
  status: null,
  verified: false,
};

/** Digits only; Emirates ID must be 15 digits starting with 784 */
export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatEmiratesId(value: string) {
  const digits = digitsOnly(value).slice(0, 15);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 7),
    digits.slice(7, 14),
    digits.slice(14, 15),
  ].filter(Boolean);

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${parts[0]}-${parts[1]}`;
  if (digits.length <= 14) return `${parts[0]}-${parts[1]}-${parts[2]}`;
  return `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}`;
}

export function isValidEmiratesId(value: string) {
  const digits = digitsOnly(value);
  return digits.length === 15 && digits.startsWith("784");
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
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
