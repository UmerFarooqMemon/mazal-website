"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";
import { MoreVertical, Store } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import type { PortfolioPlate } from "./data";

interface PortfolioPlateCardProps {
  plate: PortfolioPlate;
}

export default function PortfolioPlateCard({ plate }: PortfolioPlateCardProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const detailsHref = `/${locale}/portfolio/${plate.id}`;
  const auctionHref = `/${locale}/portfolio/plate/active`;
  const saleHref = `/${locale}/portfolio/list-for-sale`;

  const formattedReturn = `+${plate.returnPct.toFixed(1)}%`;

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const menuItems = [
    { key: "details", label: t("portfolio.view_details"), href: detailsHref },
    ...(plate.isAuction
      ? [
          {
            key: "auction",
            label: t("portfolio.list_for_auction"),
            href: auctionHref,
          },
        ]
      : []),
    { key: "sale", label: t("portfolio.list_for_sale"), href: saleHref },
  ];

  return (
    <Link
      href={detailsHref}
      className="group relative block rounded-xl border p-5 transition-all duration-300 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div
        className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {plate.isListed && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${isRTL ? "flex-row-reverse" : ""}`}
              style={{
                borderColor: getColor("border"),
                color: getColor("secondaryText"),
              }}
            >
              <Store className="size-3.5" strokeWidth={1.75} />
              {t("portfolio.listed")}
            </span>
          )}
          {plate.isAuction && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${isRTL ? "flex-row-reverse" : ""}`}
              style={{
                backgroundColor: "#fffaf9",
                borderColor: "#d40c1a",
                color: "#d40c1a",
                boxShadow: "0 0 5px rgba(213,41,22,0.3)",
              }}
            >
              <span className="size-1.5 rounded-full bg-[#d40c1a]" />
              {t("portfolio.auction_badge")}
            </span>
          )}
        </div>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            className="rounded-lg border p-2.5 transition-colors"
            style={{
              borderColor: "#e8ebf0",
              color: getColor("secondaryText"),
              backgroundColor: menuOpen
                ? getColor("primaryLight")
                : getColor("surface"),
            }}
            aria-label={t("portfolio.more_options")}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <MoreVertical className="size-3.5" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className={`absolute top-full mt-1.5 z-50 min-w-[168px] rounded-xl border py-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.2)] ${
                isRTL ? "left-0" : "right-0"
              }`}
              style={{
                backgroundColor: getColor("surface"),
                borderColor: getColor("border"),
              }}
            >
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setMenuOpen(false);
                    router.push(item.href);
                  }}
                  className={`block w-full px-3.5 py-2.5 text-sm transition-colors hover:bg-black/[0.03] ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  style={{ color: getColor("primaryText") }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto mb-4 w-full max-w-[356px]">
        <NumberPlateDisplay
          plate_code={plate.code}
          plate_digits={plate.digits}
          emirate={plate.emirate}
          plateVariant="private_new_colorful"
          crop="card"
        />
      </div>

      <div
        className={`mx-auto flex max-w-[323px] justify-between text-xs font-medium ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div className={`space-y-2.5 ${isRTL ? "text-right" : "text-left"}`}>
          <p style={{ color: getColor("secondaryText") }}>
            {t("portfolio.est_value")}
          </p>
          <p style={{ color: getColor("secondaryText") }}>
            {t("portfolio.return")}
          </p>
        </div>
        <div className={`space-y-2.5 ${isRTL ? "text-left" : "text-right"}`}>
          <p style={{ color: getColor("secondaryText") }}>
            <DirhamAmount amount={plate.estValue} />
          </p>
          <p className="text-[#3e9c0c]">{formattedReturn}</p>
        </div>
      </div>
    </Link>
  );
}
