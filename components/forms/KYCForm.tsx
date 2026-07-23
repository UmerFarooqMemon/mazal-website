"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import Stepper, { type StepItem } from "@/components/private-deal/Stepper";
import ProfileStep from "@/components/kyc/ProfileStep";
import IdentityStep from "@/components/kyc/IdentityStep";
import DocumentsStep from "@/components/kyc/DocumentsStep";
import ReviewStep from "@/components/kyc/ReviewStep";
import {
  formatEmiratesId,
  INITIAL_IDENTITY,
  INITIAL_KYC_STATE,
  sanitizePhone,
  type KycDocumentKey,
  type KycFormState,
  type KycProfileType,
  type KycUploadedDocument,
} from "@/components/kyc/types";
import {
  getCurrentKyc,
  getKycOptions,
  getKycReview,
  normalizeOptionList,
  saveKycIdentity,
  saveKycProfile,
  submitKyc,
  uploadKycDocuments,
  type KycApplication,
  type KycReviewSummary,
} from "@/services/kyc";

const STEPS = ["profile", "identity", "documents", "review"] as const;

function parseUploadedDocuments(
  documents: KycApplication["documents"],
): KycUploadedDocument[] {
  if (!documents) return [];

  if (Array.isArray(documents)) {
    const parsed: KycUploadedDocument[] = [];
    for (const doc of documents) {
      const type = String(doc.type || doc.document_type || "");
      if (!type) continue;
      parsed.push({
        id: typeof doc.id === "number" ? doc.id : undefined,
        type,
        name: typeof doc.name === "string" ? doc.name : undefined,
      });
    }
    return parsed;
  }

  return Object.entries(documents).map(([type, value]) => {
    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      return {
        id: typeof record.id === "number" ? record.id : undefined,
        type,
        name: typeof record.name === "string" ? record.name : undefined,
      };
    }
    return { type, name: typeof value === "string" ? value : undefined };
  });
}

function mapApplicationToForm(kyc: KycApplication | null | undefined): Partial<KycFormState> {
  if (!kyc) return {};

  const dob = kyc.date_of_birth
    ? String(kyc.date_of_birth).slice(0, 10)
    : "";

  return {
    profileType: (kyc.profile_type as KycProfileType) || null,
    identity: {
      ...INITIAL_IDENTITY,
      fullLegalName: kyc.full_legal_name || "",
      dateOfBirth: dob,
      emiratesId: kyc.emirates_id ? formatEmiratesId(String(kyc.emirates_id)) : "",
      emirateOfResidence: kyc.emirate_of_residence || "",
      passportNumber: kyc.passport_number || "",
      countryOfResidence: kyc.country_of_residence || "",
      phone: kyc.phone || "",
      email: kyc.email || "",
      phoneCountryCode: kyc.phone_country_code || "+971",
    },
    uploadedDocuments: parseUploadedDocuments(kyc.documents),
    custodyAgreed: Boolean(kyc.custody_agreement_accepted),
    status: kyc.status || null,
  };
}

function inferStepFromApplication(kyc: KycApplication | null | undefined) {
  if (!kyc?.profile_type) return 0;
  if (!kyc.full_legal_name || !kyc.date_of_birth) return 1;

  const uploaded = parseUploadedDocuments(kyc.documents).map((d) => d.type);
  const required =
    kyc.profile_type === "uae_resident"
      ? ["emirates_id_front", "emirates_id_back", "selfie_with_id"]
      : ["passport_bio_page", "selfie_with_passport", "proof_of_address"];

  const docsComplete = required.every((key) => uploaded.includes(key));
  if (!docsComplete) return 2;
  if (kyc.status === "draft" || kyc.status === "rejected") return 3;
  return 3;
}

export default function KYCForm() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();
  const isRTL = locale === "ar";

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<KycFormState>(INITIAL_KYC_STATE);
  const [emiratesOptions, setEmiratesOptions] = useState<
    { key: string; label: string }[]
  >([]);
  const [review, setReview] = useState<KycReviewSummary | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      try {
        const [optionsRes, currentRes] = await Promise.all([
          getKycOptions(locale).catch(() => null),
          getCurrentKyc(locale),
        ]);

        if (cancelled) return;

        if (optionsRes?.data) {
          setEmiratesOptions(
            normalizeOptionList(optionsRes.data.emirates_of_residence),
          );
        }

        const mapped = mapApplicationToForm(currentRes.data.kyc);
        setForm((prev) => ({
          ...prev,
          ...mapped,
          identity: mapped.identity || prev.identity,
          verified: Boolean(
            currentRes.data.verified || currentRes.data.kyc_verified,
          ),
          profileType:
            mapped.profileType ||
            currentRes.data.kyc_profile_type ||
            prev.profileType,
        }));

        if (
          currentRes.data.kyc?.status === "pending_review" ||
          currentRes.data.kyc?.status === "approved" ||
          currentRes.data.verified ||
          currentRes.data.kyc_verified
        ) {
          setStep(3);
          try {
            const reviewRes = await getKycReview(locale);
            if (!cancelled) {
              setReview(reviewRes.data.review || null);
            }
          } catch {
            // Review may be unavailable for approved apps; keep local summary.
          }
        } else {
          setStep(inferStepFromApplication(currentRes.data.kyc));
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : t("kyc.load_error");
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [locale, t]);

  const stepperSteps: StepItem[] = useMemo(
    () =>
      STEPS.map((key, index) => ({
        key,
        label: t(`kyc.step_${key}`),
        status:
          index < step ? "completed" : index === step ? "current" : "upcoming",
      })),
    [step, t],
  );

  const setProfileType = (profileType: KycProfileType) => {
    setForm((prev) => ({
      ...prev,
      profileType,
      // Changing profile clears identity + docs on the backend; mirror locally.
      identity:
        prev.profileType && prev.profileType !== profileType
          ? {
              ...INITIAL_IDENTITY,
              phoneCountryCode:
                profileType === "international" ? "+44" : "+971",
            }
          : prev.identity,
      documents:
        prev.profileType && prev.profileType !== profileType
          ? {}
          : prev.documents,
      uploadedDocuments:
        prev.profileType && prev.profileType !== profileType
          ? []
          : prev.uploadedDocuments,
      custodyAgreed:
        prev.profileType && prev.profileType !== profileType
          ? false
          : prev.custodyAgreed,
    }));
    setFieldErrors({});
  };

  const setIdentity = (identity: KycFormState["identity"]) => {
    setForm((prev) => ({ ...prev, identity }));
  };

  const setDocument = (key: KycDocumentKey, file: File | null) => {
    setForm((prev) => ({
      ...prev,
      documents: { ...prev.documents, [key]: file },
    }));
  };

  const setCustodyAgreed = (custodyAgreed: boolean) => {
    setForm((prev) => ({ ...prev, custodyAgreed }));
  };

  const goBack = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((prev) => Math.max(0, prev - 1));
    setFieldErrors({});
  };

  const goNext = () => setStep((prev) => Math.min(STEPS.length - 1, prev + 1));

  const activeProfileType = form.profileType ?? "uae_resident";
  const isLocked =
    form.verified ||
    form.status === "approved" ||
    form.status === "pending_review";

  const handleApiError = (error: unknown, fallback: string) => {
    const err = error as Error & { fieldErrors?: Record<string, string> };
    if (err.fieldErrors) {
      setFieldErrors(err.fieldErrors);
    }
    toast.error(err.message || fallback);
  };

  const handleSaveProfile = async () => {
    if (!form.profileType) return;
    setSaving(true);
    setFieldErrors({});
    try {
      await saveKycProfile(form.profileType, locale);
      goNext();
    } catch (error) {
      handleApiError(error, t("kyc.save_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIdentity = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      const phone = sanitizePhone(
        form.identity.phone,
        form.identity.phoneCountryCode,
      );
      const payload =
        activeProfileType === "uae_resident"
          ? {
              full_legal_name: form.identity.fullLegalName.trim(),
              date_of_birth: form.identity.dateOfBirth,
              emirates_id: form.identity.emiratesId,
              emirate_of_residence: form.identity.emirateOfResidence,
              phone_country_code: form.identity.phoneCountryCode,
              phone,
              email: form.identity.email.trim(),
            }
          : {
              full_legal_name: form.identity.fullLegalName.trim(),
              date_of_birth: form.identity.dateOfBirth,
              passport_number: form.identity.passportNumber.trim(),
              country_of_residence: form.identity.countryOfResidence,
              phone_country_code: form.identity.phoneCountryCode,
              phone,
              email: form.identity.email.trim(),
            };

      await saveKycIdentity(payload, locale);
      goNext();
    } catch (error) {
      handleApiError(error, t("kyc.save_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocuments = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      const payload = new FormData();
      Object.entries(form.documents).forEach(([key, file]) => {
        if (file) payload.append(key, file);
      });

      if (activeProfileType === "international") {
        payload.append("custody_agreement_accepted", "true");
      }

      // Only call upload when there is something new to send
      const hasNewFiles = Object.values(form.documents).some(Boolean);
      if (hasNewFiles || activeProfileType === "international") {
        const response = await uploadKycDocuments(payload, locale);
        const uploaded = parseUploadedDocuments(response.data.kyc?.documents);
        setForm((prev) => ({
          ...prev,
          documents: {},
          uploadedDocuments:
            uploaded.length > 0 ? uploaded : prev.uploadedDocuments,
          custodyAgreed:
            activeProfileType === "international" ? true : prev.custodyAgreed,
        }));
      }

      const reviewRes = await getKycReview(locale);
      setReview(reviewRes.data.review || null);
      goNext();
    } catch (error) {
      handleApiError(error, t("kyc.save_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (isLocked) {
      toast.success(
        form.status === "pending_review"
          ? t("kyc.pending_review_note")
          : t("kyc.already_verified"),
      );
      return;
    }

    setSubmitting(true);
    setFieldErrors({});
    try {
      const response = await submitKyc(locale);
      const status = response.data.kyc?.status;
      setForm((prev) => ({
        ...prev,
        status: status || prev.status,
        verified: status === "approved" ? true : prev.verified,
      }));

      toast.success(
        status === "approved"
          ? t("kyc.submit_approved")
          : t("kyc.submit_success"),
      );

      if (status === "approved") {
        router.push(`/${locale}/dashboard-certificates`);
      }
    } catch (error) {
      handleApiError(error, t("kyc.submit_error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: getColor("background") }}
      >
        <p style={{ color: getColor("secondaryText") }}>{t("kyc.loading")}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: getColor("background") }}
    >
      <section
        className="border-b"
        style={{
          borderColor: getColor("border"),
          background: `linear-gradient(to bottom, ${getColor("primaryLight")}66, ${getColor("background")})`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div
            className={`inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4 border ${isRTL ? "flex-row-reverse" : ""}`}
            style={{
              backgroundColor: `${getColor("primary")}0D`,
              borderColor: `${getColor("primary")}33`,
              color: getColor("primaryText"),
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            {t("kyc.badge")}
          </div>

          <h1
            className={`max-w-3xl font-serif text-4xl md:text-5xl tracking-tight leading-[1.15] mb-4 ${isRTL ? "text-right mr-0 ml-auto" : "text-left"}`}
            style={{ color: getColor("primaryText") }}
          >
            {t("kyc.title")}
          </h1>

          <p
            className={`max-w-2xl text-base leading-relaxed ${isRTL ? "text-right mr-0 ml-auto" : "text-left"}`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("kyc.description")}
          </p>

          {(form.status === "pending_review" || form.verified) && (
            <p
              className={`mt-4 text-sm font-medium ${isRTL ? "text-right" : "text-left"}`}
              style={{ color: getColor("primary") }}
            >
              {form.verified
                ? t("kyc.already_verified")
                : t("kyc.pending_review_note")}
            </p>
          )}

          <Stepper steps={stepperSteps} />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-8">
        {step === 0 && (
          <ProfileStep
            profileType={form.profileType}
            setProfileType={setProfileType}
            onContinue={handleSaveProfile}
            onBack={goBack}
            loading={saving || isLocked}
          />
        )}

        {step === 1 && (
          <IdentityStep
            profileType={activeProfileType}
            identity={form.identity}
            setIdentity={setIdentity}
            onContinue={handleSaveIdentity}
            onBack={goBack}
            loading={saving || isLocked}
            emiratesOptions={emiratesOptions}
            fieldErrors={fieldErrors}
          />
        )}

        {step === 2 && (
          <DocumentsStep
            profileType={activeProfileType}
            documents={form.documents}
            uploadedDocuments={form.uploadedDocuments}
            custodyAgreed={form.custodyAgreed}
            setDocument={setDocument}
            setCustodyAgreed={setCustodyAgreed}
            onContinue={handleUploadDocuments}
            onBack={goBack}
            loading={saving || isLocked}
            fieldErrors={fieldErrors}
          />
        )}

        {step === 3 && (
          <ReviewStep
            state={{ ...form, profileType: activeProfileType }}
            review={review}
            submitting={submitting}
            onSubmit={handleSubmit}
            onBack={goBack}
          />
        )}

        <p
          className="text-center text-sm mt-8 max-w-3xl mx-auto"
          style={{ color: getColor("secondaryText") }}
        >
          {t("kyc.footer_note")}
        </p>
      </section>
    </div>
  );
}
