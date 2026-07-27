"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { formatCountdown } from "./mappers";

interface AuctionTimerProps {
  endsAt: string;
}

export default function AuctionTimer({ endsAt }: AuctionTimerProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();
  const [timeLeft, setTimeLeft] = useState(formatCountdown(endsAt));

  useEffect(() => {
    setTimeLeft(formatCountdown(endsAt));
    const interval = setInterval(() => {
      setTimeLeft(formatCountdown(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="text-end">
      <div
        className="text-[10px] font-semibold uppercase tracking-wider mb-1"
        style={{ color: getColor("mutedText") }}
      >
        {t("auctions.time_left")}
      </div>
      <div
        className="text-[16px] font-bold tabular-nums"
        style={{ color: getColor("primaryText") }}
      >
        {timeLeft}
      </div>
    </div>
  );
}
