"use client";
import { useParams } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";

export default function ValuationPage() {
  const params = useParams();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center px-4">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1 className="text-3xl font-serif font-bold text-[#041443] mb-4">
          {t("valuation.title") || "Valuation Submitted"}
        </h1>
        <p className="text-gray-500 mb-2">
          {t("valuation.success_message") ||
            "Your plate valuation request has been submitted successfully."}
        </p>
        {/* <p className="text-sm text-gray-400 mb-8">
          {t("valuation.reference_id") || "Reference ID"}:{" "}
          <span className="font-mono text-[#0A3B9E]">
            MZL-{id?.slice(0, 8).toUpperCase()}
          </span>
        </p> */}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href={`/${locale}/listings/create`}
            className="block w-full bg-[#0A3B9E] text-white py-3 rounded-full font-semibold text-sm hover:bg-blue-800 transition"
          >
            {t("valuation.back_to_listings") || "Back to Listings"}
          </Link>
          <Link
            href={`/${locale}/marketplace`}
            className="block w-full border border-gray-200 text-gray-700 py-3 rounded-full font-semibold text-sm hover:bg-gray-50 transition"
          >
            {t("valuation.browse_marketplace") || "Browse Marketplace"}
          </Link>
        </div>
      </div>
    </div>
  );
}
