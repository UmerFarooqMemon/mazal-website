"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Shield, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import Stepper, { type StepItem } from "@/components/private-deal/Stepper";
import ProfileStep from "@/components/kyc/ProfileStep";
import IdentityStep from "@/components/kyc/IdentityStep";
import DocumentsStep from "@/components/kyc/DocumentsStep";
import ReviewStep from "@/components/kyc/ReviewStep";
import { useAuth } from "@/hooks/useAuth";
import {
  dialCodeForCountry,
  formatEmiratesId,
  INITIAL_IDENTITY,
  INITIAL_KYC_STATE,
  type KycDocumentKey,
  type KycFormState,
  type KycProfileType,
  type KycUploadedDocument,
} from "@/components/kyc/types";
import {
  ensurePhoneDigitsWithDial,
  toNationalFromPhoneDigits,
} from "@/lib/phone-validation";
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

function KycFormSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <section className="border-b border-gray-200 bg-linear-to-b from-gray-100 to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div className="w-52 h-8 rounded-full bg-gray-200 mb-4" />
          <div className="w-full max-w-xl h-12 rounded-xl bg-gray-200 mb-3" />
          <div className="w-full max-w-lg h-5 rounded bg-gray-200 mb-2" />
          <div className="w-full max-w-md h-5 rounded bg-gray-200" />

          <div className="flex flex-wrap gap-3 w-full pt-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex-1 min-w-[140px] rounded-[14px] border border-gray-200 bg-white p-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-[23px] rounded-full bg-gray-200 shrink-0" />
                  <div className="w-20 h-3 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-8">
        <div className="rounded-[20px] border border-gray-200 bg-white p-8 md:p-10 shadow-[0_30px_60px_-25px_rgba(1,15,81,0.08)]">
          <div className="w-40 h-8 rounded-lg bg-gray-200 mb-2" />
          <div className="w-full max-w-md h-4 rounded bg-gray-200 mb-8" />

          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <div className="w-28 h-3 rounded bg-gray-200 mb-2" />
                <div className="w-full h-12 rounded-xl bg-gray-100" />
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="w-28 h-11 rounded-xl bg-gray-200" />
            <div className="w-44 h-11 rounded-xl bg-gray-200" />
          </div>
        </div>

        <div className="w-full max-w-3xl h-4 rounded bg-gray-200 mx-auto mt-8" />
      </section>
    </div>
  );
}

function parseUploadedDocuments(
  documents: KycApplication["documents"],
): KycUploadedDocument[] {
  if (!documents) return [];

  if (Array.isArray(documents)) {
    const parsed: KycUploadedDocument[] = [];
    for (const doc of documents) {
      const type = String(doc.type || doc.document_type || "");
      if (!type) continue;
      const originalName =
        typeof doc.original_name === "string"
          ? doc.original_name
          : typeof doc.name === "string"
            ? doc.name
            : undefined;
      parsed.push({
        id: typeof doc.id === "number" ? doc.id : undefined,
        type,
        name: originalName,
        downloadUrl:
          typeof doc.download_url === "string" ? doc.download_url : undefined,
      });
    }
    return parsed;
  }

  return Object.entries(documents).map(([type, value]) => {
    if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      const originalName =
        typeof record.original_name === "string"
          ? record.original_name
          : typeof record.name === "string"
            ? record.name
            : undefined;
      return {
        id: typeof record.id === "number" ? record.id : undefined,
        type,
        name: originalName,
        downloadUrl:
          typeof record.download_url === "string"
            ? record.download_url
            : undefined,
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
  const phoneCountryCode =
    kyc.phone_country_code ||
    (kyc.country_of_residence
      ? dialCodeForCountry(kyc.country_of_residence)
      : "+971");

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
      phone: kyc.phone
        ? ensurePhoneDigitsWithDial(String(kyc.phone), phoneCountryCode)
        : "",
      email: kyc.email || "",
      phoneCountryCode,
      phoneCountryIso:
        phoneCountryCode === "+971"
          ? "ae"
          : phoneCountryCode === "+966"
            ? "sa"
            : phoneCountryCode === "+92"
              ? "pk"
              : phoneCountryCode === "+91"
                ? "in"
                : phoneCountryCode === "+1"
                  ? "us"
                  : phoneCountryCode === "+44"
                    ? "gb"
                    : "ae",
    },
    uploadedDocuments: parseUploadedDocuments(kyc.documents),
    custodyAgreed: Boolean(kyc.custody_agreement_accepted),
    status: kyc.status || null,
    statusLabel: kyc.status_label || null,
    rejectionReason: kyc.rejection_reason || null,
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
  const { user, updateUser } = useAuth();

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
        const verified = Boolean(
          currentRes.data.verified || currentRes.data.kyc_verified,
        );
        setForm((prev) => ({
          ...prev,
          ...mapped,
          identity: mapped.identity || prev.identity,
          verified,
          profileType:
            mapped.profileType ||
            currentRes.data.kyc_profile_type ||
            prev.profileType,
        }));

        const kyc = currentRes.data.kyc;
        if (kyc?.status || verified) {
          updateUser({
            kyc_verified: verified || kyc?.status === "approved",
            kyc_status: verified ? "approved" : kyc?.status || null,
            kyc_status_label:
              verified
                ? "Approved"
                : kyc?.status_label || null,
            kyc_rejection_reason:
              kyc?.status === "rejected" ? kyc.rejection_reason || null : null,
            kyc_profile_type: kyc?.profile_type || currentRes.data.kyc_profile_type || null,
          });
        }

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
  }, [locale, t, updateUser]);

  const setProfileType = (profileType: KycProfileType) => {
    setForm((prev) => ({
      ...prev,
      profileType,
      // Changing profile clears identity + docs on the backend; mirror locally.
      identity:
        prev.profileType && prev.profileType !== profileType
          ? INITIAL_IDENTITY
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
  const isVerified =
    Boolean(user?.kyc_verified) ||
    form.verified ||
    form.status === "approved";
  const isPendingReview = !isVerified && form.status === "pending_review";
  const isRejected =
    !isVerified &&
    (form.status === "rejected" || Boolean(form.rejectionReason));
  const isLocked =
    isVerified || isPendingReview;

  const stepperSteps: StepItem[] = useMemo(
    () =>
      STEPS.map((key, index) => ({
        key,
        label: t(`kyc.step_${key}`),
        status: isVerified
          ? index <= step
            ? "completed"
            : "upcoming"
          : index < step
            ? "completed"
            : index === step
              ? "current"
              : "upcoming",
      })),
    [isVerified, step, t],
  );

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
      const dialCode =
        activeProfileType === "uae_resident"
          ? "+971"
          : form.identity.phoneCountryCode || "+971";
      const phone = toNationalFromPhoneDigits(form.identity.phone, dialCode);
      const payload =
        activeProfileType === "uae_resident"
          ? {
              full_legal_name: form.identity.fullLegalName.trim(),
              date_of_birth: form.identity.dateOfBirth,
              emirates_id: form.identity.emiratesId,
              emirate_of_residence: form.identity.emirateOfResidence,
              phone_country_code: "+971",
              phone,
              email: form.identity.email.trim(),
            }
          : {
              full_legal_name: form.identity.fullLegalName.trim(),
              date_of_birth: form.identity.dateOfBirth,
              passport_number: form.identity.passportNumber.trim(),
              country_of_residence: form.identity.countryOfResidence,
              phone_country_code: dialCode,
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

      // Only call upload when there is something new to send
      const hasNewFiles = Object.values(form.documents).some(Boolean);
      const needsCustodyPost =
        activeProfileType === "international" && !form.custodyAgreed;

      if (hasNewFiles || needsCustodyPost) {
        if (activeProfileType === "international") {
          payload.append("custody_agreement_accepted", "true");
        }

        const response = await uploadKycDocuments(payload, locale);
        const uploaded = parseUploadedDocuments(response.data.kyc?.documents);
        setForm((prev) => ({
          ...prev,
          documents: {},
          uploadedDocuments:
            uploaded.length > 0 ? uploaded : prev.uploadedDocuments,
          custodyAgreed:
            activeProfileType === "international" ? true : prev.custodyAgreed,
          rejectionReason:
            response.data.kyc?.rejection_reason ?? prev.rejectionReason,
          status: response.data.kyc?.status || prev.status,
          statusLabel: response.data.kyc?.status_label || prev.statusLabel,
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
      const kyc = response.data.kyc;
      const status = kyc?.status;
      setForm((prev) => ({
        ...prev,
        status: status || prev.status,
        statusLabel: kyc?.status_label || prev.statusLabel,
        rejectionReason: null,
        verified: status === "approved" ? true : prev.verified,
      }));

      updateUser({
        kyc_verified: status === "approved",
        kyc_status: status || "pending_review",
        kyc_status_label: kyc?.status_label || null,
        kyc_rejection_reason: null,
      });

      toast.success(
        status === "approved"
          ? t("kyc.submit_approved")
          : t("kyc.submit_success"),
      );

      if (status === "approved") {
        router.push(`/${locale}/profile`);
      }
    } catch (error) {
      handleApiError(error, t("kyc.submit_error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <KycFormSkeleton />;
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
            className={`inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full mb-4 border`}
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
            className="max-w-3xl font-serif text-4xl md:text-5xl tracking-tight leading-[1.15] mb-4 text-start"
            style={{ color: getColor("primaryText") }}
          >
            {t("kyc.title")}
          </h1>

          <p
            className="max-w-2xl text-base leading-relaxed text-start"
            style={{ color: getColor("secondaryText") }}
          >
            {t("kyc.description")}
          </p>

          {(isPendingReview || isVerified) && (
            <p
              className={`mt-4 text-sm font-medium text-start`}
              style={{ color: isVerified ? getColor("success") : getColor("primary") }}
            >
              {isVerified
                ? t("kyc.already_verified")
                : t("kyc.pending_review_note")}
            </p>
          )}

          {isRejected && (
            <div
              className="mt-5 w-full rounded-2xl border p-4 text-start"
              style={{
                backgroundColor: "#FEF2F2",
                borderColor: "#FECACA",
              }}
            >
              <div className="flex items-start gap-3">
                <XCircle
                  className="mt-0.5 h-5 w-5 shrink-0"
                  style={{ color: "#DC2626" }}
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#B91C1C" }}
                  >
                    {form.statusLabel || t("kyc.rejected_title")}
                  </p>
                  {form.rejectionReason && (
                    <p
                      className="mt-1 text-sm leading-relaxed"
                      style={{ color: "#991B1B" }}
                    >
                      {form.rejectionReason}
                    </p>
                  )}
                  <p
                    className="mt-2 text-xs leading-relaxed"
                    style={{ color: "#7F1D1D" }}
                  >
                    {t("kyc.rejected_helper")}
                  </p>
                </div>
              </div>
            </div>
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

        {step === 3 && isVerified && (
          <div
            className="rounded-[20px] border p-8 md:p-10 shadow-[0_30px_60px_-25px_rgba(1,15,81,0.2)]"
            style={{
              backgroundColor: getColor("surface"),
              borderColor: `${getColor("success")}33`,
            }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.18em] uppercase"
              style={{
                backgroundColor: `${getColor("success")}14`,
                borderColor: `${getColor("success")}33`,
                color: getColor("success"),
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              {t("kyc.submit_verified")}
            </div>

            <h2
              className="mt-5 text-start font-serif text-3xl tracking-tight"
              style={{ color: getColor("primaryText") }}
            >
              {t("kyc.verified_title")}
            </h2>

            <p
              className="mt-3 max-w-2xl text-start text-sm leading-7"
              style={{ color: getColor("secondaryText") }}
            >
              {t("kyc.verified_description")}
            </p>

            <div
              className="mt-6 rounded-2xl border p-5"
              style={{
                backgroundColor: `${getColor("success")}0D`,
                borderColor: `${getColor("success")}22`,
              }}
            >
              <p
                className="text-sm font-medium text-start"
                style={{ color: getColor("primaryText") }}
              >
                {t("kyc.submit_approved")}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push(`/${locale}/marketplace`)}
              >
                {t("common.marketplace")}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push(`/${locale}/dashboard-certificates`)}
              >
                {t("common.dashboard")}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && !isVerified && (
          <ReviewStep
            state={{
              ...form,
              profileType: activeProfileType,
              verified: isVerified,
              status: isPendingReview ? "pending_review" : form.status,
            }}
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
