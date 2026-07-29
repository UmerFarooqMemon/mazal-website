"use client";

import { useLocale } from "@/context/LocaleContext";

/**
 * icon-diamond.svg is exported with preserveAspectRatio="none" and a
 * 10.8355 x 9.26629 viewBox, so both dimensions must be set or the glyph
 * stretches to whatever box it lands in.
 */
const ICON_WIDTH = 12;
const ICON_HEIGHT = 10.26;

export default function DiamondTierBadge({
  className = "",
}: {
  className?: string;
}) {
  const { t } = useLocale();

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-linear-to-r from-[#152E2B] to-[#00664E] px-2 py-0.5 text-[10px] leading-4 font-medium tracking-[0.3px] whitespace-nowrap text-white uppercase ${className}`}
    >
      <img
        src="/home-v2/icon-diamond.svg"
        alt=""
        width={ICON_WIDTH}
        height={ICON_HEIGHT}
        className="block max-w-none shrink-0"
        style={{ width: ICON_WIDTH, height: ICON_HEIGHT }}
      />
      {t("listings.tier_diamond")}
    </span>
  );
}
