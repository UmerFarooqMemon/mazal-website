"use client";
import Link from "next/link";
import { useLocale } from "../../context/LocaleContext";

export default function CTASection() {
  const { t, locale } = useLocale();

  return (
    <section className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#041443] leading-tight mb-4">
          {t("home.cta_title")}
        </h2>
        <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          {t("home.cta_subtitle")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={`/${locale}/listings/create`}
            className="bg-[#0A3B9E] text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-blue-800 transition shadow-md hover:shadow-lg"
          >
            {t("home.cta_list")}
          </Link>
          <Link
            href={`/${locale}/trader/overview`}
            className="bg-white border border-gray-200 text-gray-800 px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-gray-50 transition shadow-sm"
          >
            {t("home.cta_dashboard")}
          </Link>
        </div>
      </div>
    </section>
  );
}
