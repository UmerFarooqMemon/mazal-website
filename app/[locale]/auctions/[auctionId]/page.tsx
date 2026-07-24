"use client";

import { use } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import AuctionPageHero from "@/components/auction/AuctionPageHero";
import AuctionDetailCard from "@/components/auction/AuctionDetailCard";
import { getAuctionById } from "@/components/auction/mockData";

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ auctionId: string }>;
}) {
  const { auctionId } = use(params);
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const auction = getAuctionById(auctionId);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: getColor("background") }}
    >
      <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="max-w-5xl mx-auto">
          <AuctionPageHero />
        </div>
      </section>

      <section
        className="px-4 sm:px-6 lg:px-8 pb-16"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, #F2F8F3 40px, #F2F8F3 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto space-y-8">
          {auction && <AuctionDetailCard auction={auction} />}

          <div>
            <h2
              className={`text-[18px] sm:text-[20px] font-semibold mb-4 ${isRTL ? "text-right" : "text-left"}`}
              style={{ color: getColor("primaryText") }}
            >
              {t("auctions.plate_details_title")}
            </h2>
            <div
              className="rounded-2xl border bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
              style={{ borderColor: getColor("border") }}
            >
              <ul
                className={`space-y-3 text-sm ${isRTL ? "text-right" : "text-left"}`}
                style={{ color: getColor("secondaryText") }}
              >
                {[1, 2, 3].map((n) => (
                  <li
                    key={n}
                    className={`flex items-start gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span
                      className="mt-2 size-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: getColor("primaryText") }}
                    />
                    <span>{t(`auctions.plate_details_${n}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
