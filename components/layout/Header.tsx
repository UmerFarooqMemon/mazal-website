"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
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
  ShieldCheck,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t } = useLocale();
  const isRTL = locale === "ar";
  const { getColor, getGradient, branding } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Auth state is immediately available from localStorage (no flicker)
  const { user, isAuthenticated, loading, logout, isLoggingOut } = useAuth();

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
    if (isLoggingOut) return; // منع الضغط المتكرر
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
      <header
        className="sticky top-0 z-50 w-full border-b backdrop-blur-xl"
        style={{
          backgroundColor: `${getColor("surface")}CC`,
          borderColor: getColor("border"),
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex h-16 items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center shrink-0">
              {branding.logoUrl ? (
                <Image
                  src={branding.logoUrl}
                  alt="Mazal"
                  width={100}
                  height={36}
                  className="h-9 w-auto object-contain"
                  unoptimized
                />
              ) : null}
            </Link>

            {/* Desktop Navigation - NO ICONS */}
            <nav
              className={`hidden lg:flex items-center gap-8 text-sm ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {/* Home Link - Always visible, NO ICON */}
              {/* <Link
                href=""
                className={`transition-colors ${
                  pathname === `/${locale}` || pathname === `/${locale}/`
                    ? "font-medium"
                    : "hover:transition-colors"
                }`}
                style={{
                  color:
                    pathname === `/${locale}` || pathname === `/${locale}/`
                      ? getColor("primary")
                      : getColor("secondaryText"),
                }}
              >
                {t("common.home")}
              </Link> */}

              {/* Dashboard - Only visible when authenticated AND mounted (client-side), NO ICON */}
              {mounted && isAuthenticated && (
                <Link
                  href={`/${locale}/dashboard-certificates`}
                  className={`transition-colors ${
                    isActive("/dashboard-certificates")
                      ? "font-medium"
                      : "hover:transition-colors"
                  }`}
                  style={{
                    color: isActive("/dashboard-certificates")
                      ? getColor("primary")
                      : getColor("secondaryText"),
                  }}
                >
                  {t("common.dashboard")}
                </Link>
              )}
            </nav>

            {/* Desktop Actions */}
            <div
              className={`hidden lg:flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {/* COMMENTED OUT - Search & Notifications hidden */}
              <div
                className={`mx-1 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <LanguageSwitcher />
                <Link
                  href={`/${locale}/kyc`}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11px] font-semibold tracking-wide transition-colors"
                  style={{
                    backgroundColor: getColor("surface"),
                    borderColor: getColor("border"),
                    color: getColor("primary"),
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                  KYC
                </Link>
              </div>

              {/* Auth Actions - Only show after mounted */}
              {mounted ? (
                isAuthenticated ? (
                  <div
                    className={`flex items-center gap-3 ml-2 ${isRTL ? "flex-row-reverse mr-2" : ""}`}
                  >
                    {/* User Profile */}
                    <Link
                      href={`/${locale}/dashboard-certificates`}
                      className={`flex items-center gap-3 group ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <div className="relative shrink-0">
                        <div
                          className="h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm transition-all"
                          style={{
                            background: getGradient("primaryButton"),
                            boxShadow: `0 0 0 2px ${getColor("surface")}, 0 0 0 4px ${getColor("primary")}30`,
                          }}
                        >
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
                        <p
                          className="text-sm font-medium leading-none transition-colors"
                          style={{ color: getColor("primaryText") }}
                        >
                          {user?.name || "User"}
                        </p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: getColor("secondaryText") }}
                        >
                          {user?.role === "trader"
                            ? t("common.trader")
                            : t("common.individual")}
                        </p>
                      </div>
                    </Link>

                    {/* Separator */}
                    <span
                      className="h-5 w-px"
                      style={{ backgroundColor: getColor("border") }}
                    ></span>

                    {/* Logout - Red color with press effect */}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="h-9 w-9 flex items-center justify-center rounded-lg transition-all duration-150 hover:bg-red-50 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: "#EF4444" }}
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
              )}
            </div>

            {/* Mobile Actions */}
            <div
              className={`flex items-center gap-2 lg:hidden ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <LanguageSwitcher />
              <Link
                href={`/${locale}/kyc`}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border text-[11px] font-semibold tracking-wide transition-colors"
                style={{
                  backgroundColor: getColor("surface"),
                  borderColor: getColor("border"),
                  color: getColor("primary"),
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                KYC
              </Link>
              {mounted && isAuthenticated ? (
                <Link
                  href={`/${locale}/dashboard-certificates`}
                  className="h-9 w-9 flex items-center justify-center rounded-lg transition-colors"
                >
                  <div
                    className="h-7 w-7 rounded-full text-white flex items-center justify-center text-xs font-medium"
                    style={{ background: getGradient("primaryButton") }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                </Link>
              ) : (
                <Link href={`/${locale}/login`}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="h-9 px-3 text-xs rounded-full"
                  >
                    <User className="w-4 h-4" strokeWidth={2} />
                  </Button>
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="h-9 w-9 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: getColor("primaryText") }}
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
            className={`absolute top-0 h-full w-72 shadow-2xl overflow-y-auto transition-transform duration-300 ease-out
              ${isRTL ? "right-0 rounded-l-2xl" : "left-0 rounded-r-2xl"}
              ${isAnimating ? (isRTL ? "translate-x-full" : "-translate-x-full") : "translate-x-0"}`}
            style={{ backgroundColor: getColor("surface") }}
          >
            <div
              className={`flex ${isRTL ? "justify-start" : "justify-end"} p-4`}
            >
              <button
                onClick={closeMenu}
                className="h-9 w-9 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: getColor("primaryText") }}
              >
                <X className="w-5.5 h-5.5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-6 pb-6">
              {/* User Info if authenticated */}
              {isAuthenticated && (
                <div
                  className="mb-4 p-4 rounded-xl"
                  style={{ backgroundColor: getColor("primaryLight") }}
                >
                  <div
                    className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                  >
                    <div
                      className="h-10 w-10 rounded-full text-white flex items-center justify-center text-sm font-medium"
                      style={{ background: getGradient("primaryButton") }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div
                        className="font-medium text-sm"
                        style={{ color: getColor("primaryText") }}
                      >
                        {user?.name}
                      </div>
                      <div
                        className="text-xs truncate"
                        style={{ color: getColor("secondaryText") }}
                      >
                        {user?.login}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation - WITH ICONS in burger menu */}
              <nav className="space-y-1">
                {/* <Link
                  href=""
                  onClick={closeMenu}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                    pathname === `/${locale}` || pathname === `/${locale}/`
                      ? "font-medium"
                      : ""
                  } ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                  style={{
                    backgroundColor:
                      pathname === `/${locale}` || pathname === `/${locale}/`
                        ? `${getColor("primary")}10`
                        : "transparent",
                    color:
                      pathname === `/${locale}` || pathname === `/${locale}/`
                        ? getColor("primary")
                        : getColor("primaryText"),
                  }}
                >
                  <span
                    className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <Home className="w-5 h-5" strokeWidth={2} />
                    {t("common.home")}
                  </span>
                  {(pathname === `/${locale}` ||
                    pathname === `/${locale}/`) && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: getColor("primary") }}
                    />
                  )}
                </Link> */}

                {isAuthenticated && (
                  <Link
                    href={`/${locale}/dashboard-certificates`}
                    onClick={closeMenu}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                      isActive("/dashboard-certificates") ? "font-medium" : ""
                    } ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                    style={{
                      backgroundColor: isActive("/dashboard-certificates")
                        ? `${getColor("primary")}10`
                        : "transparent",
                      color: isActive("/dashboard-certificates")
                        ? getColor("primary")
                        : getColor("primaryText"),
                    }}
                  >
                    <span
                      className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <LayoutDashboard className="w-5 h-5" strokeWidth={2} />
                      {t("common.dashboard")}
                    </span>
                    {isActive("/dashboard-certificates") && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: getColor("primary") }}
                      />
                    )}
                  </Link>
                )}
              </nav>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full border-t"
                    style={{ borderColor: getColor("border") }}
                  />
                </div>
                <div className="relative flex justify-center">
                  <span
                    className="px-3 text-[10px] uppercase tracking-wider"
                    style={{
                      backgroundColor: getColor("surface"),
                      color: getColor("mutedText"),
                    }}
                  >
                    {t("common.quick_actions")}
                  </span>
                </div>
              </div>

              {/* Auth Actions */}
              <div className="mt-6 space-y-3">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-150 hover:bg-red-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                    style={{ color: "#EF4444" }}
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
