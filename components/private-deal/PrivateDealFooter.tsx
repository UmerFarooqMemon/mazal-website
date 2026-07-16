"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

export default function PrivateDealFooter() {
  const { t, locale } = useLocale();
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
    <footer className="bg-[#010f51] border-t border-[rgba(217,222,230,0.6)] text-white">
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
              <div className="flex size-9 items-center justify-center rounded-md bg-[#e0ae57] text-[#2b1500] font-serif font-bold text-xl">
                M
              </div>
              <span className="font-serif text-2xl tracking-tight text-[rgba(251,250,246,0.9)]">
                Mazal
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[rgba(251,250,246,0.7)] max-w-sm">
              {t("private-deal.footer_desc")}
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-serif font-semibold text-[#e0ae57] text-sm tracking-[0.08em] uppercase mb-4">
              {t("common.platform")}
            </h4>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[rgba(251,250,246,0.7)] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="font-serif font-semibold text-[#e0ae57] text-sm tracking-[0.08em] uppercase mb-4">
              {t("common.trust")}
            </h4>
            <ul className="space-y-2">
              {trustLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[rgba(251,250,246,0.7)] hover:text-white transition-colors"
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
          className={`max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[rgba(251,250,246,0.6)] ${isRTL ? "sm:flex-row-reverse" : ""}`}
        >
          <span>{t("common.copyright")}</span>
          <span>{t("common.licensed_escrow")}</span>
        </div>
      </div>
    </footer>
  );
}
