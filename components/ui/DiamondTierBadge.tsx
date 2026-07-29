"use client";

import { useLocale } from "@/context/LocaleContext";

export default function DiamondTierBadge({
  className = "",
}: {
  className?: string;
}) {
  const { t } = useLocale();

  return (
    <img
      src="/Diamond.png"
      alt={t("listings.tier_diamond")}
      width={60}
      height={9}
      className={`h-3.5 w-auto object-contain ${className}`}
    />
  );
}
