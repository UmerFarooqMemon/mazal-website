"use client";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import VerifiedCertificateCard, {
  SAMPLE_CERTIFICATE,
} from "@/components/certificates/VerifiedCertificateCard";

export default function CertificatePreview() {
  const { t } = useLocale();
  const { getColor } = useTheme();

  return (
    <div className="w-full">
      <div className="mb-6 text-start">
        <div
          className="text-xs font-bold uppercase tracking-wider mb-1"
          style={{ color: getColor("primary") }}
        >
          {t("certificates.live_preview")}
        </div>
        <h2
          className="text-3xl md:text-4xl font-serif font-bold"
          style={{ color: getColor("primaryText") }}
        >
          {t("certificates.preview_title")}
        </h2>
      </div>

      <VerifiedCertificateCard
        data={{
          ...SAMPLE_CERTIFICATE,
          showPreviewBadge: false,
          maskAssessedValue: true,
        }}
      />
    </div>
  );
}
