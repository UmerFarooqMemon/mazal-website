"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  Bell,
  User,
  Menu,
  X,
  LogOut,
  Home,
  LayoutDashboard,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t } = useLocale();
  const isRTL = locale === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Auth state is immediately available from localStorage (no flicker)
  const { user, isAuthenticated, loading, logout } = useAuth();

  // Set mounted to true after first render (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when mobile menu is open
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

  const handleLogout = async () => {
    await logout();
    closeMenu();
    router.push(`/${locale}`);
  };

  const isActive = (path: string) => pathname.includes(path);

  // COMMENTED OUT - Hidden but not deleted for future use
  // { href: `/${locale}/marketplace`, label: t("common.marketplace") },
  // { href: `/${locale}/auctions`, label: t("common.auctions") },
  // { href: `/${locale}/listings/create`, label: t("common.sell_plate") },
  // { href: `/${locale}/private-deal`, label: t("common.private_deal") },

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex h-16 items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {/* Logo - M color changed to #041443, Mazal always visible */}
            <Link
              // href={`/${locale}`}
              href=""
              className="flex items-center gap-2 shrink-0"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A3B9E] text-white font-bold text-base">
                M
              </div>
              <span className="text-lg font-semibold text-[#0A3B9E]">
                Mazal
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className={`hidden lg:flex items-center gap-8 text-sm ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {/* Home Link - Always visible */}
              <Link
                // href={`/${locale}`}
                href=""
                className={`flex items-center gap-1.5 ${
                  pathname === `/${locale}` || pathname === `/${locale}/`
                    ? "text-[#0A3B9E] font-medium"
                    : "text-gray-500 hover:text-[#041443] transition-colors"
                }`}
              >
                <Home className="w-4 h-4" strokeWidth={2} />
                <span>{t("common.home")}</span>
              </Link>

              {/* Dashboard - Only visible when authenticated AND mounted (client-side) */}
              {mounted && isAuthenticated && (
                <Link
                  href={`/${locale}/dashboard-certificates`}
                  className={`flex items-center gap-1.5 ${
                    isActive("/trader")
                      ? "text-[#0A3B9E] font-medium"
                      : "text-gray-500 hover:text-[#041443] transition-colors"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" strokeWidth={2} />
                  <span>{t("common.dashboard")}</span>
                </Link>
              )}
            </nav>

            {/* Desktop Actions */}
            <div
              className={`hidden lg:flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {/* COMMENTED OUT - Search & Notifications hidden */}
              <div className="mx-1">
                <LanguageSwitcher />
              </div>

              {/* Auth Actions - Only show after mounted */}
              {mounted ? (
                isAuthenticated ? (
                  <div
                    className={`flex items-center gap-3 ml-2 ${isRTL ? "flex-row-reverse mr-2" : ""}`}
                  >
                    {/* User Profile */}
                    <Link
                      // href={`/${locale}/trader/overview`}
                      href=""
                      className={`flex items-center gap-3 group ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <div className="relative shrink-0">
                        <div className="h-9 w-9 rounded-full bg-linear-to-br from-[#0A3B9E] to-[#1e40af] flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-gray-100 group-hover:ring-[#0A3B9E]/30 transition-all">
                          {user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "U"}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>

                      <div className="hidden lg:block">
                        <p className="text-sm font-medium text-[#041443] leading-none group-hover:text-[#0A3B9E] transition-colors">
                          {user?.name || "User"}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {user?.role === "trader"
                            ? t("common.trader")
                            : t("common.individual")}
                        </p>
                      </div>
                    </Link>

                    {/* Separator */}
                    <span className="h-5 w-px bg-gray-200"></span>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      title={t("common.sign_out")}
                    >
                      <LogOut className="w-4.5 h-4.5" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <Link href={`/${locale}/login`}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="h-9 px-4 text-xs rounded-full"
                    >
                      <User className="w-4 h-4" strokeWidth={2} />
                      <span className="ml-1.5">{t("common.sign_in")}</span>
                    </Button>
                  </Link>
                )
              ) : (
                /* Placeholder while mounting - prevents hydration mismatch */
                <div className="h-9 w-20" />
              )}
            </div>

            {/* Mobile Actions */}
            <div
              className={`flex items-center gap-2 lg:hidden ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <LanguageSwitcher />
              {mounted && isAuthenticated && (
                <Link
                  // href={`/${locale}/trader/overview`}
                  href=""
                  className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-[#0A3B9E] text-white flex items-center justify-center text-xs font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Menu className="w-5.5 h-5.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Only show when mounted */}
      {mounted && mobileMenuOpen && (
        <div className="fixed inset-0 z-60 lg:hidden">
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}
            onClick={closeMenu}
          />

          <div
            className={`absolute top-0 h-full w-72 bg-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-out
              ${isRTL ? "right-0 rounded-l-2xl" : "left-0 rounded-r-2xl"}
              ${isAnimating ? (isRTL ? "translate-x-full" : "-translate-x-full") : "translate-x-0"}`}
          >
            <div
              className={`flex ${isRTL ? "justify-start" : "justify-end"} p-4`}
            >
              <button
                onClick={closeMenu}
                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5.5 h-5.5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-6 pb-6">
              {/* User Info if authenticated */}
              {isAuthenticated && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#0A3B9E] text-white flex items-center justify-center text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-[#041443]">
                        {user?.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.login}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="space-y-1">
                {/* Home Link */}
                <Link
                  // href={`/${locale}`}
                  href=""
                  onClick={closeMenu}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                    pathname === `/${locale}` || pathname === `/${locale}/`
                      ? "bg-[#0A3B9E]/10 text-[#0A3B9E] font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  } ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span className="flex items-center gap-3">
                    <Home className="w-5 h-5" strokeWidth={2} />
                    {t("common.home")}
                  </span>
                  {(pathname === `/${locale}` ||
                    pathname === `/${locale}/`) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A3B9E]" />
                  )}
                </Link>

                {/* Dashboard - Only when authenticated */}
                {isAuthenticated && (
                  <Link
                    // href={`/${locale}/trader/overview`}
                    href=""
                    onClick={closeMenu}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                      isActive("/trader")
                        ? "bg-[#0A3B9E]/10 text-[#0A3B9E] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    } ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5" strokeWidth={2} />
                      {t("common.dashboard")}
                    </span>
                    {isActive("/trader") && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0A3B9E]" />
                    )}
                  </Link>
                )}
              </nav>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[10px] text-gray-400 uppercase tracking-wider">
                    {t("common.quick_actions")}
                  </span>
                </div>
              </div>

              {/* Auth Actions */}
              <div className="mt-6 space-y-3">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t("common.sign_out")}</span>
                  </button>
                ) : (
                  <Link href={`/${locale}/login`} onClick={closeMenu}>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="rounded-xl"
                    >
                      <User className="w-5 h-5" strokeWidth={2} />
                      <span className="ml-1.5">{t("common.sign_in")}</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
