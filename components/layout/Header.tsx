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
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Store,
  Handshake,
  Gavel,
  FileBadge,
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

  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (isLoggingOut) return;
    await logout();
    closeMenu();
    router.push(`/${locale}`);
  };

  const isActive = (path: string) => pathname.includes(path);

  const navLinks = [
    {
      href: `/${locale}/marketplace`,
      label: t("common.marketplace"),
      match: "/marketplace",
      icon: Store,
    },
    {
      href: `/${locale}/private-deal`,
      label: t("common.private_deal"),
      match: "/private-deal",
      icon: Handshake,
    },
    {
      href: `/${locale}/auctions`,
      label: t("common.auctions"),
      match: "/auctions",
      icon: Gavel,
    },
    {
      href: `/${locale}/certificates/request`,
      label: t("common.valuation_certificate"),
      match: "/certificates",
      icon: FileBadge,
    },
    {
      href: `/${locale}/dashboard-certificates`,
      label: t("common.dashboard"),
      match: "/dashboard-certificates",
      icon: LayoutDashboard,
    },
  ];

  const linkStyle = (active: boolean) => ({
    color: active ? getColor("primary") : getColor("secondaryText"),
  });

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
            className={`flex h-16 items-center justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="flex items-center shrink-0 min-w-0"
            >
              {branding.logoUrl ? (
                <Image
                  src={branding.logoUrl}
                  alt="Mazal"
                  width={100}
                  height={36}
                  className="h-8 sm:h-9 w-auto max-w-[100px] object-contain"
                  unoptimized
                />
              ) : (
                <span
                  className="text-lg font-bold tracking-[0.18em]"
                  style={{ color: getColor("primaryText") }}
                >
                  MAZAL
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav
              className={`hidden lg:flex items-center gap-7 text-sm ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors whitespace-nowrap ${
                    isActive(link.match) ? "font-medium" : "hover:opacity-80"
                  }`}
                  style={linkStyle(isActive(link.match))}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div
              className={`hidden lg:flex items-center gap-2 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
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
                {t("common.kyc_short")}
              </Link>

              {mounted && isAuthenticated ? (
                <div
                  className={`flex items-center gap-3 ml-1 ${isRTL ? "flex-row-reverse mr-1 ml-0" : ""}`}
                >
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
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="hidden xl:block">
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
                  <span
                    className="h-5 w-px"
                    style={{ backgroundColor: getColor("border") }}
                  />
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
              )}
            </div>

            {/* Mobile Actions */}
            <div
              className={`flex items-center gap-1 sm:gap-1.5 shrink-0 lg:hidden ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <LanguageSwitcher />
              <Link
                href={`/${locale}/kyc`}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full border transition-colors"
                style={{
                  backgroundColor: getColor("surface"),
                  borderColor: getColor("border"),
                  color: getColor("primary"),
                }}
                aria-label={t("common.kyc_short")}
                title={t("common.kyc_short")}
              >
                <ShieldCheck className="w-4 h-4" strokeWidth={2} />
              </Link>
              {mounted && isAuthenticated ? (
                <Link
                  href={`/${locale}/dashboard-certificates`}
                  className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
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
                    className="h-8 w-8 !px-0 text-xs rounded-full"
                  >
                    <User className="w-4 h-4" strokeWidth={2} />
                  </Button>
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors shrink-0"
                style={{ color: getColor("primaryText") }}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
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

              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.match);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                        active ? "font-medium" : ""
                      } ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                      style={{
                        backgroundColor: active
                          ? `${getColor("primary")}10`
                          : "transparent",
                        color: active
                          ? getColor("primary")
                          : getColor("primaryText"),
                      }}
                    >
                      <span
                        className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                      >
                        <Icon className="w-5 h-5" strokeWidth={2} />
                        {link.label}
                      </span>
                      {active && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getColor("primary") }}
                        />
                      )}
                    </Link>
                  );
                })}

                <Link
                  href={`/${locale}/kyc`}
                  onClick={closeMenu}
                  className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                    isActive("/kyc") ? "font-medium" : ""
                  } ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                  style={{
                    backgroundColor: isActive("/kyc")
                      ? `${getColor("primary")}10`
                      : "transparent",
                    color: isActive("/kyc")
                      ? getColor("primary")
                      : getColor("primaryText"),
                  }}
                >
                  <span
                    className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <ShieldCheck className="w-5 h-5" strokeWidth={2} />
                    {t("common.kyc_short")}
                  </span>
                  {isActive("/kyc") && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: getColor("primary") }}
                    />
                  )}
                </Link>
              </nav>

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
