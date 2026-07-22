"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import DocumentUploadZone from "@/components/kyc/DocumentUploadZone";
import type {
  KycDocumentKey,
  KycDocuments,
  KycProfileType,
} from "@/components/kyc/types";

interface DocumentsStepProps {
  profileType: Exclude<KycProfileType, null>;
  documents: KycDocuments;
  custodyAgreed: boolean;
  setDocument: (key: KycDocumentKey, file: File | null) => void;
  setCustodyAgreed: (value: boolean) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function DocumentsStep({
  profileType,
  documents,
  custodyAgreed,
  setDocument,
  setCustodyAgreed,
  onContinue,
  onBack,
}: DocumentsStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const isUae = profileType === "uae_resident";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const uaeDocs: { key: KycDocumentKey; title: string; hint: string }[] = [
    {
      key: "eidFront",
      title: t("kyc.doc_eid_front"),
      hint: t("kyc.doc_eid_front_hint"),
    },
    {
      key: "eidBack",
      title: t("kyc.doc_eid_back"),
      hint: t("kyc.doc_eid_back_hint"),
    },
    {
      key: "selfieId",
      title: t("kyc.doc_selfie_id"),
      hint: t("kyc.doc_selfie_id_hint"),
    },
    {
      key: "ded",
      title: t("kyc.doc_ded"),
      hint: t("kyc.doc_ded_hint"),
    },
  ];

  const intlDocs: { key: KycDocumentKey; title: string; hint: string }[] = [
    {
      key: "passport",
      title: t("kyc.doc_passport"),
      hint: t("kyc.doc_passport_hint"),
    },
    {
      key: "selfiePassport",
      title: t("kyc.doc_selfie_passport"),
      hint: t("kyc.doc_selfie_passport_hint"),
    },
    {
      key: "addressProof",
      title: t("kyc.doc_address"),
      hint: t("kyc.doc_address_hint"),
    },
    {
      key: "sourceOfFunds",
      title: t("kyc.doc_funds"),
      hint: t("kyc.doc_funds_hint"),
    },
  ];

  const docs = isUae ? uaeDocs : intlDocs;

  return (
    <div
      className="rounded-[20px] border p-8 md:p-10 shadow-[0_30px_60px_-25px_rgba(1,15,81,0.2)]"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <h2
        className={`text-2xl font-serif tracking-tight mb-1 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("primaryText") }}
      >
        {t("kyc.documents_title")}
      </h2>
      <p
        className={`text-sm mb-8 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("secondaryText") }}
      >
        {t("kyc.documents_subtitle")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {docs.map((doc) => (
          <DocumentUploadZone
            key={doc.key}
            docKey={doc.key}
            title={doc.title}
            hint={doc.hint}
            file={documents[doc.key]}
            onChange={setDocument}
          />
        ))}
      </div>

      {!isUae && (
        <button
          type="button"
          onClick={() => setCustodyAgreed(!custodyAgreed)}
          className={`w-full flex items-start gap-3 rounded-2xl border px-4 py-4 mb-6 text-start transition-colors ${isRTL ? "flex-row-reverse text-right" : ""}`}
          style={{
            borderColor: getColor("border"),
            backgroundColor: getColor("primaryLight"),
          }}
        >
          <span
            className="mt-0.5 flex items-center justify-center size-5 rounded shrink-0 border"
            style={{
              backgroundColor: custodyAgreed
                ? getColor("primary")
                : getColor("surface"),
              borderColor: custodyAgreed
                ? getColor("primary")
                : getColor("border"),
            }}
          >
            {custodyAgreed && (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            )}
          </span>
          <span
            className="text-sm leading-relaxed"
            style={{ color: getColor("primaryText") }}
          >
            {t("kyc.custody_agreement")}
          </span>
        </button>
      )}

      <div
        className={`flex items-center justify-between border-t pt-6 ${isRTL ? "flex-row-reverse" : ""}`}
        style={{ borderColor: getColor("border") }}
      >
        <Button
          variant="outline"
          size="md"
          onClick={onBack}
          leftIcon={<BackIcon className="w-4 h-4" />}
          className="opacity-70"
        >
          {t("kyc.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onContinue}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {t("kyc.confirm")}
        </Button>
      </div>
    </div>
  );
}
