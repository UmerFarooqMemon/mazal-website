"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { formatCountdown } from "./mappers";

interface AuctionTimerProps {
  /** Null for open auctions that run without an end date. */
  endsAt: string | null;
  onExpired?: () => void;
}

export default function AuctionTimer({ endsAt, onExpired }: AuctionTimerProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();
  const [timeLeft, setTimeLeft] = useState(() =>
    endsAt ? formatCountdown(endsAt) : "—",
  );
  const expiredRef = useRef(false);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    expiredRef.current = false;
    if (!endsAt) {
      setTimeLeft("—");
      return;
    }

    const target = new Date(endsAt).getTime();
    if (Number.isNaN(target)) {
      setTimeLeft("—");
      return;
    }

    const tick = () => {
      setTimeLeft(formatCountdown(endsAt));
      if (!expiredRef.current && Date.now() >= target) {
        expiredRef.current = true;
        onExpiredRef.current?.();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
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
