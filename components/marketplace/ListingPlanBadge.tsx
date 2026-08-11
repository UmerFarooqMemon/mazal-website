"use client";

import HomeV2Icon from "@/components/home-v2/HomeV2Icon";
import type { MarketplaceListingPlanSummary } from "@/services/marketplace";

export type ListingPlanBadgeTier = "diamond" | "gold" | "silver";

const TIER_STYLES: Record<
  ListingPlanBadgeTier,
  { className: string; icon: string; iconWidth?: number; iconHeight?: number }
> = {
  diamond: {
    className: "bg-linear-to-r from-[#152E2B] to-[#00664E]",
    icon: "/home-v2/icon-diamond.svg",
    iconWidth: 12,
    iconHeight: 10.26,
  },
  gold: {
    className: "bg-linear-to-br from-[#e0ae57] to-[#a77927]",
    icon: "/home-v2/icon-crown.svg",
  },
  silver: {
    className: "bg-linear-to-br from-[#cdcdcd] to-[#969696]",
    icon: "/home-v2/icon-stars.svg",
  },
};

/** Maps API `listing_plan` to a styled badge tier. Free plans return null. */
export function resolveListingPlanBadgeTier(
  plan?: MarketplaceListingPlanSummary | null,
): ListingPlanBadgeTier | null {
  if (!plan?.name) return null;
  if (plan.is_free) return null;

  const slug = (plan.slug || "").trim().toLowerCase();
  if (slug === "free") return null;

  const name = plan.name.trim().toLowerCase();
  if (name === "free") return null;

  const key = slug || name;
  if (key.includes("diamond")) return "diamond";
  if (key.includes("gold")) return "gold";
  if (key.includes("silver")) return "silver";

  return null;
}

interface ListingPlanBadgeProps {
  plan?: MarketplaceListingPlanSummary | null;
  className?: string;
}

/**
 * Renders Silver / Gold / Diamond pill badges from API `listing_plan`.
 * Free listings and unknown plans show nothing.
 */
export default function ListingPlanBadge({
  plan,
  className = "",
}: ListingPlanBadgeProps) {
  const tier = resolveListingPlanBadgeTier(plan);
  if (!tier || !plan?.name) return null;

  const style = TIER_STYLES[tier];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] leading-4 font-medium tracking-[0.3px] whitespace-nowrap text-white uppercase ${style.className} ${className}`}
    >
      <HomeV2Icon
        src={style.icon}
        size={12}
        width={style.iconWidth}
        height={style.iconHeight}
      />
      {plan.name}
    </span>
  );
}
