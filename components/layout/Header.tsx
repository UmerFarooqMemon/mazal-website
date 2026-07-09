"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { Button } from "@/components/ui";

const Icons = {
  Search: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Bell: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  Shield: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  User: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Menu: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
    </svg>
  ),
  Close: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

export default function Header() {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const isRTL = locale === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsAnimating(false);
    }, 200);
  };

  const isActive = (path: string) => pathname.includes(path);

  const navLinks = [
    { href: `/${locale}/marketplace`, label: t("common.marketplace") },
    { href: `/${locale}/auctions`, label: t("common.auctions") },
    { href: `/${locale}/listings/create`, label: t("common.sell_plate") },
    { href: `/${locale}/private-deal`, label: t("common.private_deal") },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex h-16 items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 shrink-0"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A3B9E] text-white font-bold text-base">
                M
              </div>
              <span className="text-lg font-semibold text-[#041443] hidden sm:block">
                Mazal
              </span>
            </Link>

            <nav
              className={`hidden lg:flex items-center gap-8 text-sm ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive(link.href)
                      ? "text-[#0A3B9E] font-medium"
                      : "text-gray-500 hover:text-[#041443] transition-colors"
                  }
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div
              className={`hidden lg:flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <button className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#041443] hover:bg-gray-50 transition-colors">
                <Icons.Search />
              </button>
              <button className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#041443] hover:bg-gray-50 transition-colors">
                <Icons.Bell />
              </button>
              <div className="mx-1">
                <LanguageSwitcher />
              </div>
              <Link href={`/${locale}/login`}>
                <Button
                  variant="primary"
                  size="sm"
                  className="h-9 px-4 text-xs rounded-full"
                >
                  {t("common.sign_in")}
                </Button>
              </Link>
            </div>

            <div
              className={`flex items-center gap-2 lg:hidden ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <LanguageSwitcher />
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Icons.Menu />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-60 lg:hidden">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}
            onClick={closeMenu}
          />

          {/* Panel - RTL Slide Direction Fixed */}
          <div
            className={`absolute top-0 h-full w-72 bg-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-out
              ${isRTL ? "right-0 rounded-l-2xl" : "left-0 rounded-r-2xl"}
              ${
                isAnimating
                  ? isRTL
                    ? "translate-x-full"
                    : "-translate-x-full"
                  : "translate-x-0"
              }`}
          >
            {/* Close Button */}
            <div
              className={`flex ${isRTL ? "justify-start" : "justify-end"} p-4`}
            >
              <button
                onClick={closeMenu}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icons.Close />
              </button>
            </div>

            <div className="px-6 pb-6">
              {/* Navigation */}
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                      isActive(link.href)
                        ? "bg-[#0A3B9E]/10 text-[#0A3B9E] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    } ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span>{link.label}</span>
                    {isActive(link.href) && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full bg-[#0A3B9E] ${isRTL ? "mr-0" : "ml-0"}`}
                      />
                    )}
                  </Link>
                ))}
              </nav>

              {/* Divider - centered line */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[10px] text-gray-400 uppercase tracking-wider">
                    {t("common.quick_actions") || "Quick Actions"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Icons.Search />
                  <span>{t("common.search")}</span>
                </button>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Icons.Bell />
                  <span>{t("common.notifications")}</span>
                </button>
                {/* <Link
                  href={`/${locale}/kyc`}
                  onClick={closeMenu}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-[#0A3B9E] hover:bg-[#0A3B9E]/5 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Icons.Shield />
                  <span>{t("common.kyc")}</span>
                </Link> */}
              </div>

              {/* CTA */}
              <div className="mt-6">
                <Link href={`/${locale}/login`} onClick={closeMenu}>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="rounded-xl"
                  >
                    {t("common.sign_in")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
