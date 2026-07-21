"use client";

import Link from "next/link";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { MoreVertical, Store } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import type { PortfolioPlate } from "./data";

interface PortfolioPlateCardProps {
  plate: PortfolioPlate;
}

export default function PortfolioPlateCard({ plate }: PortfolioPlateCardProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const href = `/${locale}/portfolio/${plate.id}`;

  const formattedValue = new Intl.NumberFormat(
    locale === "ar" ? "ar-AE" : "en-US",
    {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    },
  ).format(plate.estValue);

  const formattedReturn = `+${plate.returnPct.toFixed(1)}%`;

  return (
    <Link
      href={href}
      className="group block rounded-xl border p-5 transition-all duration-300 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div
        className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {plate.isListed && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${isRTL ? "flex-row-reverse" : ""}`}
              style={{
                borderColor: getColor("border"),
                color: getColor("secondaryText"),
              }}
            >
              <Store className="size-3.5" strokeWidth={1.75} />
              {t("portfolio.listed")}
            </span>
          )}
          {plate.isAuction && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${isRTL ? "flex-row-reverse" : ""}`}
              style={{
                backgroundColor: "#fffaf9",
                borderColor: "#d40c1a",
                color: "#d40c1a",
                boxShadow: "0 0 5px rgba(213,41,22,0.3)",
              }}
            >
              <span className="size-1.5 rounded-full bg-[#d40c1a]" />
              {t("portfolio.auction_badge")}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(event) => event.preventDefault()}
          className="rounded-lg border p-2.5 transition-colors"
          style={{
            borderColor: "#e8ebf0",
            color: getColor("secondaryText"),
          }}
          aria-label="More options"
        >
          <MoreVertical className="size-3.5" />
        </button>
      </div>

      <div className="mx-auto mb-4 w-full max-w-[356px]">
        <NumberPlateDisplay
          plate_code={plate.code}
          plate_digits={plate.digits}
          emirate={plate.emirate}
          plateVariant="private_new_colorful"
          crop="card"
        />
      </div>

      <div
        className={`mx-auto flex max-w-[323px] justify-between text-xs font-medium ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div className={`space-y-2.5 ${isRTL ? "text-right" : "text-left"}`}>
          <p style={{ color: getColor("secondaryText") }}>
            {t("portfolio.est_value")}
          </p>
          <p style={{ color: getColor("secondaryText") }}>
            {t("portfolio.return")}
          </p>
        </div>
        <div className={`space-y-2.5 ${isRTL ? "text-left" : "text-right"}`}>
          <p style={{ color: getColor("secondaryText") }}>{formattedValue}</p>
          <p className="text-[#3e9c0c]">{formattedReturn}</p>
        </div>
      </div>
    </Link>
  );
}
