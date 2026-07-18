"use client";
import Link from "next/link";
import { Heart, Share2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";

interface ListingSidebarProps {
  listingId: string | number;
  emirate: string;
  type: string;
}

export default function ListingSidebar({
  listingId,
  emirate,
  type,
}: ListingSidebarProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const getEmirateTranslation = (emirateName: string) => {
    const emirateMap: Record<string, string> = {
      Dubai: "listings.emirate_dubai",
      "Abu Dhabi": "listings.emirate_abu_dhabi",
      Sharjah: "listings.emirate_sharjah",
      Ajman: "listings.emirate_ajman",
      "Ras Al Khaimah": "listings.emirate_rak",
    };
    return t(emirateMap[emirateName] || emirateName);
  };

  const getTypeTranslation = (typeName: string) => {
    const typeMap: Record<string, string> = {
      Direct: "listings.type_direct",
      Auction: "listings.type_auction",
      Spot: "listings.type_spot",
    };
    return t(typeMap[typeName] || typeName);
  };

  const rows = [
    { label: t("listings.emirate"), value: getEmirateTranslation(emirate) },
    { label: t("listings.code"), value: "AA" },
    { label: t("listings.digits"), value: "7777 (4-digit)" },
    // { label: t("listings.seller"), value: "Al Marwan" },
    { label: t("listings.type"), value: getTypeTranslation(type) },
  ];

  return (
    <div
      className="rounded-2xl border shadow-sm p-6 sticky top-24"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
        <div
          className="text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ color: getColor("mutedText") }}
        >
          {t("listings.asking_price")}
        </div>
        <div
          className="text-4xl md:text-5xl font-serif font-bold mb-2"
          style={{ color: getColor("primaryText") }}
        >
          AED 12,500,000
        </div>
        <div className="text-xs" style={{ color: getColor("mutedText") }}>
          {t("listings.fees_breakdown")}
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <Link
          href={`/${locale}/listings/${listingId}/checkout?role=buyer&price=12500000`}
          className="block"
        >
          <Button variant="primary" size="lg" fullWidth className="shadow-md">
            {t("listings.buy_escrow")}
          </Button>
        </Link>

        <Link
          href={`/${locale}/listings/${listingId}/offer`}
          className="block"
        >
          <Button
            variant="outline"
            size="lg"
            fullWidth
            style={{
              borderColor: getColor("border"),
              color: getColor("primaryText"),
            }}
          >
            {t("listings.make_offer")}
          </Button>
        </Link>
      </div>

      <div
        className={`grid grid-cols-2 gap-3 mb-8 ${isRTL ? "direction-rtl" : ""}`}
      >
        <Button
          variant="outline"
          size="md"
          className={`flex items-center justify-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          style={{
            borderColor: getColor("border"),
            color: getColor("secondaryText"),
          }}
        >
          <Heart className="w-4 h-4 fill-[#E11D48] text-[#E11D48]" />
          {t("listings.watchlist")}
        </Button>

        <Button
          variant="outline"
          size="md"
          className={`flex items-center justify-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          style={{
            borderColor: getColor("border"),
            color: getColor("secondaryText"),
          }}
        >
          <Share2 className="w-4 h-4" />
          {t("listings.share")}
        </Button>
      </div>

      <div
        className={`border-t pt-6 space-y-3 ${isRTL ? "text-right" : "text-left"}`}
        style={{ borderColor: getColor("border") }}
      >
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <span style={{ color: getColor("mutedText") }}>{row.label}</span>
            <span
              className="font-medium"
              style={{ color: getColor("primaryText") }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
