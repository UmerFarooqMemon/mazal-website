"use client";

import Link from "next/link";
import { Gavel, Percent } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

export default function PortfolioListingOptions() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const options = [
    {
      key: "auction",
      title: t("portfolio.auction_option"),
      description: t("portfolio.auction_option_desc"),
      icon: Gavel,
      href: `/${locale}/portfolio/plate/active`,
      highlighted: true,
    },
    {
      key: "marketplace",
      title: t("portfolio.marketplace_option"),
      description: t("portfolio.marketplace_option_desc"),
      icon: Percent,
      href: `/${locale}/portfolio/plate/active`,
      highlighted: false,
    },
  ];

  return (
    <div
      className="rounded-[20px] border px-8 py-6 space-y-4 h-full"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: "rgba(217,222,230,0.6)",
      }}
    >
      <p
        className="text-sm uppercase tracking-wide"
        style={{ color: getColor("secondaryText") }}
      >
        {t("portfolio.list_this_plate")}
      </p>

      <div className="space-y-3">
        {options.map((option) => (
          <Link
            key={option.key}
            href={option.href}
            className={`flex items-center gap-4 rounded-[20px] border px-5 py-4 transition-colors hover:bg-black/[0.02] ${isRTL ? "flex-row-reverse text-right" : ""}`}
            style={{
              backgroundColor: getColor("surface"),
              borderColor: option.highlighted ? "#00664e" : getColor("border"),
            }}
          >
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-[10px] border"
              style={{
                backgroundColor: "#f8f9fc",
                borderColor: getColor("border"),
                color: getColor("secondaryText"),
              }}
            >
              <option.icon className="size-5" strokeWidth={1.75} />
            </div>
            <div>
              <p
                className="text-base font-medium"
                style={{ color: getColor("primaryText") }}
              >
                {option.title}
              </p>
              <p
                className="text-sm mt-0.5"
                style={{ color: getColor("mutedText") }}
              >
                {option.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
