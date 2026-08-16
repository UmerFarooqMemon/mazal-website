"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { Button, DirhamAmount } from "@/components/ui";
import DirhamSymbolIcon from "@/components/ui/DirhamSymbolIcon";
import { formatCountdown } from "./mappers";
import type { AuctionListing } from "./types";
import AuctionStatusBadges from "./AuctionStatusBadges";

interface AuctionDetailCardProps {
  auction: AuctionListing;
  payHref?: string | null;
  onPayClick?: () => void;
}

export default function AuctionDetailCard({
  auction,
  payHref,
  onPayClick,
}: AuctionDetailCardProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const [timeLeft, setTimeLeft] = useState(() =>
    auction.endsAt ? formatCountdown(auction.endsAt) : "—",
  );

  useEffect(() => {
    if (!auction.endsAt) {
      setTimeLeft("—");
      return;
    }

    const update = () => setTimeLeft(formatCountdown(auction.endsAt!));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [auction.endsAt]);

  return (
    <div
      className="rounded-[24px] p-5 sm:p-7 md:p-8"
      style={{
        background:
          "linear-gradient(160deg, #F7F1E4 0%, #F3EADA 45%, #EFE4D2 100%)",
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <AuctionStatusBadges auction={auction} />
        <span
          className="text-[13px] font-medium"
          style={{ color: getColor("primaryText") }}
        >
          {t("auctions.current_bids")}: {auction.currentBids ?? 0}
        </span>
      </div>

      <div className="relative bg-white rounded-[20px] p-4 sm:p-8 mb-5 shadow-[0_8px_28px_rgba(0,0,0,0.06)]">
        <NumberPlateDisplay
          plate_code={auction.code}
          plate_digits={auction.digits}
          emirate={auction.emirate}
          preview={auction.preview}
          plateVariant={auction.plateVariant}
          plateType={auction.plateType}
          plateDesign={auction.plateDesign}
          crop="card"
          hideCode={Boolean(auction.hideCode)}
          scaleFontToWidth
          fontScaleMultiplier={2.3}
        />
      </div>

      <div className="bg-white rounded-[18px] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-8">
          <div className="flex items-start gap-2.5">
            <span
              className="mt-0.5 shrink-0 inline-flex"
              style={{ color: getColor("primary") }}
            >
              <DirhamSymbolIcon className="w-5 h-5" />
            </span>
            <div>
              <div
                className="text-[12px] mb-0.5"
                style={{ color: getColor("mutedText") }}
              >
                {t("auctions.current_price")}
              </div>
              <div
                className="text-[20px] sm:text-[22px] font-bold"
                style={{ color: getColor("success") }}
              >
                <DirhamAmount amount={auction.currentBid} weight="bold" />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span
              className="mt-0.5 shrink-0 inline-flex"
              style={{ color: getColor("primary") }}
            >
              <DirhamSymbolIcon className="w-5 h-5" />
            </span>
            <div>
              <div
                className="text-[12px] mb-0.5"
                style={{ color: getColor("mutedText") }}
              >
                {t("auctions.min_bid_increment")}
              </div>
              <div
                className="text-[20px] sm:text-[22px] font-bold"
                style={{ color: getColor("success") }}
              >
                <DirhamAmount
                  amount={auction.minBidIncrement}
                  weight="bold"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock
              className="w-5 h-5 mt-0.5 shrink-0"
              style={{ color: getColor("primary") }}
            />
            <div>
              <div
                className="text-[12px] mb-0.5"
                style={{ color: getColor("mutedText") }}
              >
                {t("auctions.time_left")}
              </div>
              <div
                className="text-[20px] sm:text-[22px] font-bold tabular-nums"
                style={{ color: getColor("success") }}
              >
                {timeLeft}
              </div>
            </div>
          </div>
        </div>

        {payHref ? (
          <Link href={payHref} className="shrink-0" onClick={onPayClick}>
            <Button
              variant="primary"
              size="sm"
              className="h-9 px-4 text-xs rounded-full"
            >
              <span>{t("dashboard.pay_now") || t("private-deal.pay_now") || "Pay Now"}</span>
            </Button>
          </Link>
        ) : auction.status !== "closed" ? (
          <Link href={`/${locale}/auctions/${auction.id}/register`} className="shrink-0">
            <Button
              variant="primary"
              size="sm"
              className="h-9 px-4 text-xs rounded-full"
            >
              <span>
                {locale === "en"
                  ? "Deposit for Bidding"
                  : t("auctions.add_deposit_cta")}
              </span>
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
