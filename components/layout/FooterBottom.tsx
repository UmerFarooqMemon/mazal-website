"use client";
import { useLocale } from "@/context/LocaleContext";

export default function FooterBottom() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="border-t border-white/10 bg-[#041443]">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <span>{t("common.copyright")}</span>
        <span>{t("common.licensed_escrow")}</span>
      </div>
    </div>
  );
}
