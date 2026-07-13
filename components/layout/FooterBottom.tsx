"use client";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

export default function FooterBottom() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { getColor } = useTheme();

  return (
    <div
      className="border-t"
      style={{
        backgroundColor: getColor("secondary"),
        borderColor: `${getColor("border")}20`,
      }}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs ${isRTL ? "flex-row-reverse" : ""}`}
        style={{ color: getColor("mutedText") }}
      >
        <span>{t("common.copyright")}</span>
        <span>{t("common.licensed_escrow")}</span>
      </div>
    </div>
  );
}
