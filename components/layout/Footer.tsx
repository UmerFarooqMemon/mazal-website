"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

export default function Footer() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <footer className="bg-[#041443] text-white">
      {/* Main Upper Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-12 ${isRTL ? "dir-rtl" : "dir-ltr"}`}
        >
          {/* Column 1: Logo and Description */}
          <div className={`space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
            <Link
              href={`/${locale}`}
              className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4AF37] text-[#041443] font-bold text-xl">
                M
              </div>
              <span className="text-2xl font-serif font-bold text-white tracking-tight">
                Mazal
              </span>
            </Link>

            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              {t("common.escrow_custody")} - {t("common.private_deal")} -{" "}
              {t("common.auctions")}
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div className={`${isRTL ? "text-right" : "text-left"}`}>
            <h3 className="text-[#D4AF37] text-sm font-bold uppercase tracking-wider mb-6">
              {t("common.platform")}
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link
                  href={`/${locale}/marketplace`}
                  className="hover:text-white transition-colors"
                >
                  {t("common.marketplace")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/auctions`}
                  className="hover:text-white transition-colors"
                >
                  {t("common.auctions")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/spot-cash`}
                  className="hover:text-white transition-colors"
                >
                  {t("common.spot_cash")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/trader/overview`}
                  className="hover:text-white transition-colors"
                >
                  {t("common.trader_dashboard")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust Bonds */}
          <div className={`${isRTL ? "text-right" : "text-left"}`}>
            <h3 className="text-[#D4AF37] text-sm font-bold uppercase tracking-wider mb-6">
              {t("common.trust")}
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="hover:text-white transition-colors"
                >
                  {t("common.escrow_custody")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/kyc`}
                  className="hover:text-white transition-colors"
                >
                  {t("common.emirates_id_kyc")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="hover:text-white transition-colors"
                >
                  {t("common.ratings")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="hover:text-white transition-colors"
                >
                  {t("common.compliance")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
