"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useOptionalAuctionCapacity } from "@/context/AuctionCapacityContext";
import { DirhamAmount } from "@/components/ui";
import { featureFlags } from "@/config/featureFlags";
import {
  toAuctionCapacityNumber,
} from "@/services/marketplace";

export default function AuctionCapacityBadge() {
  const { locale, t } = useLocale();
  const { getColor } = useTheme();
  const { isAuthenticated } = useAuth();
  const capacityState = useOptionalAuctionCapacity();
  const capacity = capacityState?.capacity;

  if (!featureFlags.auctions || !isAuthenticated || !capacity) {
    return null;
  }

  const remaining = toAuctionCapacityNumber(capacity.remaining_bidding_limit);
  const held = toAuctionCapacityNumber(capacity.held_deposit);
  if (held <= 0 && remaining <= 0) {
    return null;
  }

  return (
    <Link
      href={`/${locale}/wallet`}
      className="inline-flex items-center gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 rounded-full border text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition-colors hover:opacity-90 max-w-[120px] sm:max-w-none"
      style={{
        backgroundColor: getColor("primaryLight"),
        borderColor: `${getColor("primary")}33`,
        color: getColor("primary"),
      }}
      title={t("auctions.capacity_header_tooltip")}
    >
      <TrendingUp className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
      <span className="uppercase tracking-wide text-[10px] opacity-80 hidden sm:inline">
        {t("auctions.capacity_header_label")}
      </span>
      <DirhamAmount amount={remaining} decimals={0} weight="semibold" />
    </Link>
  );
}
