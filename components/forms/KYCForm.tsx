"use client";

import { useMemo, useState } from "react";
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
  INITIAL_KYC_STATE,
  type KycDocumentKey,
  type KycFormState,
  type KycProfileType,
} from "@/components/kyc/types";

const STEPS = ["profile", "identity", "documents", "review"] as const;

export default function KYCForm() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();
  const isRTL = locale === "ar";

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<KycFormState>(INITIAL_KYC_STATE);

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
    setForm((prev) => ({ ...prev, profileType }));
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
  };

  const goNext = () => setStep((prev) => Math.min(STEPS.length - 1, prev + 1));

  const activeProfileType = form.profileType ?? "uae_resident";

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("profile_type", activeProfileType);
      payload.append("full_legal_name", form.identity.fullLegalName);
      payload.append("date_of_birth", form.identity.dateOfBirth);
      payload.append("mobile", `${form.identity.countryCode}${form.identity.mobile}`);
      payload.append("email", form.identity.email);
      payload.append("custody_agreed", String(form.custodyAgreed));

      if (activeProfileType === "uae_resident") {
        payload.append("emirates_id", form.identity.emiratesId);
        payload.append("emirate", form.identity.emirate);
      } else {
        payload.append("passport_number", form.identity.passportNumber);
        payload.append("country", form.identity.country);
      }

      Object.entries(form.documents).forEach(([key, file]) => {
        if (file) payload.append(key, file);
      });

      const response = await fetch("/api/auth/verify-kyc", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("submit_failed");
      }

      toast.success(t("kyc.submit_success"));
      router.push(`/${locale}/dashboard-certificates`);
    } catch {
      toast.error(t("kyc.submit_error"));
    } finally {
      setSubmitting(false);
    }
  };

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

          <Stepper steps={stepperSteps} />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-8">
        {step === 0 && (
          <ProfileStep
            profileType={form.profileType}
            setProfileType={setProfileType}
            onContinue={goNext}
            onBack={goBack}
          />
        )}

        {step === 1 && (
          <IdentityStep
            profileType={activeProfileType}
            identity={form.identity}
            setIdentity={setIdentity}
            onContinue={goNext}
            onBack={goBack}
          />
        )}

        {step === 2 && (
          <DocumentsStep
            profileType={activeProfileType}
            documents={form.documents}
            custodyAgreed={form.custodyAgreed}
            setDocument={setDocument}
            setCustodyAgreed={setCustodyAgreed}
            onContinue={goNext}
            onBack={goBack}
          />
        )}

        {step === 3 && (
          <ReviewStep
            state={{ ...form, profileType: activeProfileType }}
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
