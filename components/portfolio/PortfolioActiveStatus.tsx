"use client";

import { Eye, Gavel, Store, Timer } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import type { PortfolioPlate } from "./data";

export default function PortfolioActiveStatus({
  plate,
}: {
  plate: PortfolioPlate;
}) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const formattedViews = new Intl.NumberFormat(
    locale === "ar" ? "ar-AE" : "en-US",
  ).format(plate.views ?? 0);

  return (
    <div className="space-y-3">
      {plate.isAuction && (
        <div
          className={`flex items-center justify-between gap-4 rounded-[20px] border px-8 py-5 ${isRTL ? "flex-row-reverse" : ""}`}
          style={{
            backgroundColor: "#fffafa",
            borderColor: "rgba(212,12,26,0.6)",
          }}
        >
          <div
            className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-[10px] border"
              style={{
                backgroundColor: "#f8f9fc",
                borderColor: getColor("border"),
                color: getColor("secondaryText"),
              }}
            >
              <Gavel className="size-5" strokeWidth={1.75} />
            </div>
            <p
              className="text-sm uppercase tracking-wide"
              style={{ color: getColor("secondaryText") }}
            >
              {t("portfolio.live_auction")}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 text-xs ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ color: getColor("secondaryText") }}
          >
            <Timer className="size-4" strokeWidth={1.75} />
            <span>
              {plate.auctionRemaining} {t("portfolio.remaining")}
            </span>
          </div>
        </div>
      )}

      {plate.isListed && (
        <div
          className={`flex items-center justify-between gap-4 rounded-[20px] border px-8 py-5 ${isRTL ? "flex-row-reverse" : ""}`}
          style={{
            backgroundColor: getColor("surface"),
            borderColor: getColor("border"),
          }}
        >
          <div
            className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-[10px] border"
              style={{
                backgroundColor: "#f8f9fc",
                borderColor: getColor("border"),
                color: getColor("secondaryText"),
              }}
            >
              <Store className="size-5" strokeWidth={1.75} />
            </div>
            <p
              className="text-sm uppercase tracking-wide"
              style={{ color: getColor("secondaryText") }}
            >
              {t("portfolio.marketplace")}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 text-xs ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ color: getColor("secondaryText") }}
          >
            <Eye className="size-3.5" strokeWidth={1.75} />
            <span>{formattedViews}</span>
          </div>
        </div>
      )}
    </div>
  );
}
