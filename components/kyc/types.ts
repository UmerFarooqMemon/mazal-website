export type KycProfileType = "uae_resident" | "international" | null;

export interface KycIdentityData {
  fullLegalName: string;
  dateOfBirth: string;
  emiratesId: string;
  emirate: string;
  passportNumber: string;
  country: string;
  mobile: string;
  email: string;
  countryCode: string;
}

export type KycDocumentKey =
  | "eidFront"
  | "eidBack"
  | "selfieId"
  | "ded"
  | "passport"
  | "selfiePassport"
  | "addressProof"
  | "sourceOfFunds";

export type KycDocuments = Partial<Record<KycDocumentKey, File | null>>;

export interface KycFormState {
  profileType: KycProfileType;
  identity: KycIdentityData;
  documents: KycDocuments;
  custodyAgreed: boolean;
}

export const INITIAL_IDENTITY: KycIdentityData = {
  fullLegalName: "",
  dateOfBirth: "",
  emiratesId: "",
  emirate: "",
  passportNumber: "",
  country: "",
  mobile: "",
  email: "",
  countryCode: "+971",
};

export const INITIAL_KYC_STATE: KycFormState = {
  profileType: null,
  identity: INITIAL_IDENTITY,
  documents: {},
  custodyAgreed: false,
};
