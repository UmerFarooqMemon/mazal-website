"use client";

import Link from "next/link";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { FileBadge2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { BackButton } from "@/components/ui";
import type { PortfolioPlate } from "./data";

interface PortfolioPlateHeroProps {
  plate: PortfolioPlate;
  backHref: string;
}

export default function PortfolioPlateHero({
  plate,
  backHref,
}: PortfolioPlateHeroProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  return (
    <div className="space-y-5">
      <BackButton href={backHref} size="sm">
        {t("portfolio.back_to_collection")}
      </BackButton>

      <div
        className="rounded-[20px] border py-6"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <div className="mx-auto w-full max-w-3xl px-4">
          <NumberPlateDisplay
            plate_code={plate.code}
            plate_digits={plate.digits}
            emirate={plate.emirate}
            plateVariant="private_new_colorful"
            crop="hero"
          />
        </div>
      </div>
    </div>
  );
}

interface PortfolioValuationCardProps {
  certificateHref: string;
}

export function PortfolioValuationCard({
  certificateHref,
}: PortfolioValuationCardProps) {
  const { t } = useLocale();
  const { getColor, getGradient } = useTheme();

  return (
    <div
      className="rounded-[20px] border px-8 py-6 space-y-3"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: "rgba(217,222,230,0.6)",
      }}
    >
      <p
        className="text-sm uppercase tracking-wide"
        style={{ color: getColor("secondaryText") }}
      >
        {t("portfolio.valuation")}
      </p>
      <Link
        href={certificateHref}
        className="flex w-full items-center justify-center gap-3 rounded-full px-6 py-3 text-sm text-white transition-opacity hover:opacity-95"
        style={{ background: getGradient("primaryButton") }}
      >
        <FileBadge2 className="size-6 shrink-0" />
        {t("portfolio.get_valuation_certificate")}
      </Link>
    </div>
  );
}

interface PortfolioDetailsCardProps {
  addedDate: string;
}

export function PortfolioDetailsCard({ addedDate }: PortfolioDetailsCardProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const formattedDate = new Date(addedDate).toLocaleDateString(
    locale === "ar" ? "ar-AE" : "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );

  return (
    <div
      className="rounded-[20px] border px-8 py-6 space-y-3"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: "rgba(217,222,230,0.6)",
      }}
    >
      <p
        className="text-sm uppercase tracking-wide"
        style={{ color: getColor("secondaryText") }}
      >
        {t("portfolio.details")}
      </p>
      <div
        className={`flex flex-wrap items-center justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`flex items-center gap-3 text-sm ${isRTL ? "flex-row-reverse" : ""}`}
          style={{ color: getColor("secondaryText") }}
        >
          <CalendarIcon />
          {t("portfolio.added_to_collection")}
        </div>
        <p className="text-sm" style={{ color: "#9e9e9e" }}>
          {formattedDate}
        </p>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
