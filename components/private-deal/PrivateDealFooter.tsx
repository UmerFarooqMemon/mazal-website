"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

export default function PrivateDealFooter() {
  const { t, locale } = useLocale();
  const { getColor, branding } = useTheme();
  const isRTL = locale === "ar";

  const platformLinks = [
    { href: `/${locale}/marketplace`, label: t("common.marketplace") },
    { href: `/${locale}/auctions`, label: t("common.auctions") },
    { href: `/${locale}/spot-cash`, label: t("common.spot_cash") },
    { href: `/${locale}/trader/overview`, label: t("common.trader_dashboard") },
  ];

  const trustLinks = [
    { href: `/${locale}/about`, label: t("common.escrow_custody") },
    { href: `/${locale}/kyc`, label: t("common.emirates_id_kyc") },
    { href: `/${locale}/about`, label: t("common.ratings") },
    { href: `/${locale}/about`, label: t("common.compliance") },
  ];

  return (
    <footer
      className="border-t text-white"
      style={{
        backgroundColor: getColor("secondary"),
        borderColor: `${getColor("border")}99`,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div
          className={`grid grid-cols-1 md:grid-cols-4 gap-10 ${isRTL ? "text-right" : "text-left"}`}
        >
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href={`/${locale}`}
              className={`inline-flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {branding.logoUrl ? (
                <Image
                  src={branding.logoUrl}
                  alt="Mazal"
                  width={100}
                  height={36}
                  className="h-9 w-auto object-contain brightness-0 invert"
                  unoptimized
                />
              ) : (
                <>
                  <div
                    className="flex size-9 items-center justify-center rounded-md font-serif font-bold text-xl"
                    style={{
                      backgroundColor: getColor("accent"),
                      color: getColor("primaryText"),
                    }}
                  >
                    M
                  </div>
                  <span
                    className="font-serif text-2xl tracking-tight"
                    style={{ color: `${getColor("background")}E6` }}
                  >
                    Mazal
                  </span>
                </>
              )}
            </Link>
            <p
              className="text-sm leading-relaxed max-w-sm"
              style={{ color: getColor("mutedText") }}
            >
              {t("private-deal.footer_desc")}
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4
              className="font-serif font-semibold text-sm tracking-[0.08em] uppercase mb-4"
              style={{ color: getColor("accent") }}
            >
              {t("common.platform")}
            </h4>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-opacity hover:opacity-100"
                    style={{ color: getColor("mutedText") }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4
              className="font-serif font-semibold text-sm tracking-[0.08em] uppercase mb-4"
              style={{ color: getColor("accent") }}
            >
              {t("common.trust")}
            </h4>
            <ul className="space-y-2">
              {trustLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-opacity hover:opacity-100"
                    style={{ color: getColor("mutedText") }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div
          className={`max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${isRTL ? "sm:flex-row-reverse" : ""}`}
          style={{ color: getColor("mutedText") }}
        >
          <span>{t("common.copyright")}</span>
          <span>{t("common.licensed_escrow")}</span>
        </div>
      </div>
    </footer>
  );
}
