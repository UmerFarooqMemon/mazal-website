"use client";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

export default function CertificateFAQ() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { getColor } = useTheme();

  const faqs = [{ key: "independent" }, { key: "verified" }, { key: "valid" }];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      {faqs.map((faq, idx) => (
        <div
          key={idx}
          className="rounded-2xl p-6 shadow-sm"
          style={{
            backgroundColor: getColor("surface"),
            borderColor: getColor("border"),
            borderWidth: "1px",
          }}
        >
          <div
            className={`flex items-center gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={getColor("primary")}
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h4
              className="font-semibold text-base"
              style={{ color: getColor("primaryText") }}
            >
              {t(`certificates.faq_${faq.key}_title`)}
            </h4>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: getColor("secondaryText") }}
          >
            {t(`certificates.faq_${faq.key}_desc`)}
          </p>
        </div>
      ))}
    </div>
  );
}
