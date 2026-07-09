"use client";

import { useState } from "react";
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
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

export default function Header() {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const isRTL = locale === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/trader") return pathname.includes("/trader");
    return pathname.includes(path);
  };

  const linkClass = (path: string) =>
    `transition-colors ${
      isActive(path)
        ? "text-[#0A3B9E] font-semibold"
        : "text-gray-600 hover:text-[#0A3B9E]"
    }`;

  const navLinks = [
    { href: `/${locale}/marketplace`, label: t("common.marketplace") },
    { href: `/${locale}/auctions`, label: t("common.auctions") },
    { href: `/${locale}/listings/create`, label: t("common.sell_plate") },
    { href: `/${locale}/private-deal`, label: t("common.private_deal") },
    { href: `/${locale}/trader/overview`, label: t("common.dashboard") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex h-16 items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {/* Logo - Responsive with Arabic support */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A3B9E] text-white font-bold text-lg transition-all group-hover:bg-blue-700 group-hover:shadow-lg">
                M
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-serif font-bold tracking-tight text-[#041443] leading-tight">
                  Mazal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            className={`hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div
            className={`hidden lg:flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#0A3B9E] transition-colors">
              <Icons.Search />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#0A3B9E] transition-colors">
              <Icons.Bell />
            </button>

            <LanguageSwitcher />

            <Link href={`/${locale}/kyc`}>
              <Button
                variant="outline"
                size="sm"
                className="border-[#0A3B9E]/20 bg-[#0A3B9E]/5 text-[#0A3B9E] hover:bg-[#0A3B9E]/10 whitespace-nowrap"
              >
                <Icons.Shield />
                <span>{t("common.kyc")}</span>
              </Button>
            </Link>

            <Link href={`/${locale}/login`}>
              <Button
                variant="primary"
                size="sm"
                className="whitespace-nowrap shadow-sm"
              >
                <Icons.User />
                <span>{t("common.sign_in")}</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Actions + Hamburger */}
          <div
            className={`flex items-center gap-2 lg:hidden ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <LanguageSwitcher />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <nav
              className={`flex flex-col gap-2 ${isRTL ? "text-right" : "text-left"}`}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-[#0A3B9E]/5 text-[#0A3B9E]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div
              className={`flex flex-col gap-3 pt-3 border-t ${isRTL ? "text-right" : "text-left"}`}
            >
              {/* ✅ Mobile KYC Link */}
              <Link
                href={`/${locale}/kyc`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium text-[#0A3B9E] hover:bg-[#0A3B9E]/5 transition-colors"
              >
                <Icons.Shield />
                <span>{t("common.kyc")}</span>
              </Link>

              {/* ✅ Mobile Sign In Button */}
              <Link
                href={`/${locale}/login`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                >
                  <Icons.User />
                  <span>{t("common.sign_in")}</span>
                </Button>
              </Link>

              {/* Mobile Search & Notifications */}
              <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1 justify-center border-gray-200 text-gray-600"
                >
                  <Icons.Search />
                  <span>{t("common.search")}</span>
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1 justify-center border-gray-200 text-gray-600"
                >
                  <Icons.Bell />
                  <span>{t("common.notifications")}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
