"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import DocumentUploadZone from "@/components/kyc/DocumentUploadZone";
import {
  INTL_REQUIRED_DOCS,
  UAE_REQUIRED_DOCS,
  type KycDocumentKey,
  type KycDocuments,
  type KycProfileType,
  type KycUploadedDocument,
} from "@/components/kyc/types";

interface DocumentsStepProps {
  profileType: Exclude<KycProfileType, null>;
  documents: KycDocuments;
  uploadedDocuments: KycUploadedDocument[];
  custodyAgreed: boolean;
  setDocument: (key: KycDocumentKey, file: File | null) => void;
  setCustodyAgreed: (value: boolean) => void;
  onContinue: () => Promise<void> | void;
  onBack: () => void;
  loading?: boolean;
  fieldErrors?: Record<string, string>;
}

export default function DocumentsStep({
  profileType,
  documents,
  uploadedDocuments,
  custodyAgreed,
  setDocument,
  setCustodyAgreed,
  onContinue,
  onBack,
  loading = false,
  fieldErrors = {},
}: DocumentsStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const isUae = profileType === "uae_resident";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [custodyError, setCustodyError] = useState<string | null>(null);

  const uaeDocs: {
    key: KycDocumentKey;
    title: string;
    hint: string;
    required: boolean;
  }[] = [
    {
      key: "emirates_id_front",
      title: t("kyc.doc_eid_front"),
      hint: t("kyc.doc_eid_front_hint"),
      required: true,
    },
    {
      key: "emirates_id_back",
      title: t("kyc.doc_eid_back"),
      hint: t("kyc.doc_eid_back_hint"),
      required: true,
    },
    {
      key: "selfie_with_id",
      title: t("kyc.doc_selfie_id"),
      hint: t("kyc.doc_selfie_id_hint"),
      required: true,
    },
    {
      key: "ded_traffic_file",
      title: t("kyc.doc_ded"),
      hint: t("kyc.doc_ded_hint"),
      required: false,
    },
  ];

  const intlDocs: {
    key: KycDocumentKey;
    title: string;
    hint: string;
    required: boolean;
  }[] = [
    {
      key: "passport_bio_page",
      title: t("kyc.doc_passport"),
      hint: t("kyc.doc_passport_hint"),
      required: true,
    },
    {
      key: "selfie_with_passport",
      title: t("kyc.doc_selfie_passport"),
      hint: t("kyc.doc_selfie_passport_hint"),
      required: true,
    },
    {
      key: "proof_of_address",
      title: t("kyc.doc_address"),
      hint: t("kyc.doc_address_hint"),
      required: true,
    },
    {
      key: "source_of_funds",
      title: t("kyc.doc_funds"),
      hint: t("kyc.doc_funds_hint"),
      required: false,
    },
  ];

  const docs = isUae ? uaeDocs : intlDocs;
  const requiredKeys = isUae ? UAE_REQUIRED_DOCS : INTL_REQUIRED_DOCS;

  const hasDoc = (key: KycDocumentKey) => {
    if (documents[key]) return true;
    return uploadedDocuments.some(
      (doc) => doc.type === key || doc.type === key.replace(/_/g, "-"),
    );
  };

  const uploadedLabelFor = (key: KycDocumentKey) => {
    if (documents[key]) return null;
    const match = uploadedDocuments.find((doc) => doc.type === key);
    return match?.name || (match ? t("kyc.file_selected") : null);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    requiredKeys.forEach((key) => {
      if (!hasDoc(key)) {
        next[key] = t("kyc.upload_required");
      }
    });

    let custodyMsg: string | null = null;
    if (!isUae && !custodyAgreed) {
      custodyMsg = t("kyc.custody_required");
    }

    setLocalErrors(next);
    setCustodyError(custodyMsg);

    if (Object.keys(next).length > 0) {
      toast.error(t("kyc.upload_required"));
      return false;
    }
    if (custodyMsg) {
      toast.error(custodyMsg);
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    await onContinue();
  };

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
            uploadedLabel={uploadedLabelFor(doc.key)}
            required={doc.required}
            error={localErrors[doc.key] || fieldErrors[doc.key]}
            onChange={(key, file) => {
              setDocument(key, file);
              setLocalErrors((prev) => {
                if (!prev[key]) return prev;
                const next = { ...prev };
                delete next[key];
                return next;
              });
            }}
          />
        ))}
      </div>

      {!isUae && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => {
              setCustodyAgreed(!custodyAgreed);
              setCustodyError(null);
            }}
            className={`w-full flex items-start gap-3 rounded-2xl border px-4 py-4 text-start transition-colors ${isRTL ? "flex-row-reverse text-right" : ""}`}
            style={{
              borderColor:
                custodyError || fieldErrors.custody_agreement_accepted
                  ? getColor("error")
                  : getColor("border"),
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
          {(custodyError || fieldErrors.custody_agreement_accepted) && (
            <p
              className={`text-[10px] mt-1.5 ${isRTL ? "text-right" : "text-left"}`}
              style={{ color: getColor("error") }}
            >
              {custodyError || fieldErrors.custody_agreement_accepted}
            </p>
          )}
        </div>
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
          disabled={loading}
        >
          {t("kyc.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleContinue}
          loading={loading}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {t("kyc.confirm")}
        </Button>
      </div>
    </div>
  );
}
