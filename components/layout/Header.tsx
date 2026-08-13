"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { Button, UserAvatar } from "@/components/ui";
import SiteLogo from "@/components/layout/SiteLogo";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { featureFlags } from "@/config/featureFlags";
import { getCurrentKyc } from "@/services/kyc";
import { getLoginHref } from "@/lib/auth-redirect";
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
  CheckCircle2,
  Clock,
  XCircle,
  Bell,
  UserRound,
  Lock,
  Pencil,
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale, t } = useLocale();
  const isRTL = locale === "ar";
  const { getColor } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { user, isAuthenticated, logout, isLoggingOut, updateUser } = useAuth();
  const search = searchParams.toString();
  const loginHref = getLoginHref(
    locale,
    `${pathname}${search ? `?${search}` : ""}`,
  );
  const isKycVerified = Boolean(user?.kyc_verified);
  const isKycRejected =
    !isKycVerified &&
    (user?.kyc_status === "rejected" ||
      user?.kyc_status_label?.toLowerCase() === "rejected" ||
      Boolean(user?.kyc_rejection_reason));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep header KYC badge in sync (e.g. after admin rejection without re-login).
  useEffect(() => {
    if (!featureFlags.kyc || !isAuthenticated) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await getCurrentKyc(locale);
        if (cancelled || !res?.data) return;

        const kyc = res.data.kyc;
        const verified = Boolean(
          res.data.verified || res.data.kyc_verified || kyc?.status === "approved",
        );
        const status = verified ? "approved" : kyc?.status || null;

        updateUser({
          kyc_verified: verified,
          kyc_status: status,
          kyc_status_label: verified
            ? "Approved"
            : kyc?.status_label || null,
          kyc_rejection_reason:
            status === "rejected" ? kyc?.rejection_reason || null : null,
          kyc_profile_type:
            kyc?.profile_type || res.data.kyc_profile_type || null,
        });
      } catch {
        // Badge falls back to cached auth user fields.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, locale, updateUser]);

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
    featureFlags.marketplace && {
      href: `/${locale}/marketplace`,
      label: t("common.marketplace"),
      match: "/marketplace",
      icon: Store,
    },
    featureFlags.privateDeal && {
      href: `/${locale}/private-deal`,
      label: t("common.private_deal"),
      match: "/private-deal",
      icon: Handshake,
    },
    featureFlags.auctions && {
      href: `/${locale}/auctions`,
      label: t("common.auctions"),
      match: "/auctions",
      icon: Gavel,
    },
    featureFlags.valuationCertificate && {
      href: `/${locale}/certificates/request`,
      label: t("common.nav_valuation"),
      match: "/certificates/request",
      icon: FileBadge,
    },
    {
      href: `/${locale}/user-dashboard`,
      label: t("common.dashboard"),
      match: "/user-dashboard",
      icon: LayoutDashboard,
    },
  ].filter(Boolean) as {
    href: string;
    label: string;
    match: string;
    icon: typeof Store;
  }[];

  const linkStyle = (active: boolean) => ({
    color: active ? getColor("primary") : getColor("secondaryText"),
  });

  const kycBadgeConfig = isKycVerified
    ? {
        label: t("common.kyc_verified"),
        shortLabel: t("common.kyc_short"),
        icon: CheckCircle2,
        backgroundColor: "#E8F7EF",
        borderColor: "#A7E1BF",
        color: "#138A52",
      }
    : isKycRejected
      ? {
          label: t("common.kyc_rejected"),
          shortLabel: t("common.kyc_short"),
          icon: XCircle,
          backgroundColor: "#FEF2F2",
          borderColor: "#FECACA",
          color: "#DC2626",
        }
      : {
          label: t("common.kyc_pending"),
          shortLabel: t("common.kyc_short"),
          icon: Clock,
          backgroundColor: "#FFF4E3",
          borderColor: "#F4C98A",
          color: "#B7791F",
        };

  const KycIcon = kycBadgeConfig.icon;

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
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo from site-settings API */}
            <SiteLogo variant="header" />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors whitespace-nowrap ${ isActive(link.match) ? "font-medium" : "hover:opacity-80" }`}
                  style={linkStyle(isActive(link.match))}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <LanguageSwitcher />
              {mounted && isAuthenticated && <NotificationBell />}
              {featureFlags.kyc && (
                isAuthenticated ? (
                  <Link
                    href={`/${locale}/kyc`}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11px] font-semibold tracking-wide whitespace-nowrap transition-colors"
                    style={{
                      backgroundColor: kycBadgeConfig.backgroundColor,
                      borderColor: kycBadgeConfig.borderColor,
                      color: kycBadgeConfig.color,
                    }}
                    aria-label={kycBadgeConfig.label}
                    title={kycBadgeConfig.label}
                  >
                    <span>{kycBadgeConfig.shortLabel}</span>
                    <KycIcon className="w-3.5 h-3.5" strokeWidth={2.2} />
                  </Link>
                ) : (
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
                )
              )}

              {mounted && isAuthenticated ? (
                <div className="flex items-center gap-3 ms-1">
                  <Link
                    href={`/${locale}/profile`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="relative shrink-0">
                      <UserAvatar
                        name={user?.name}
                        imageUrl={user?.image_url}
                        className="h-9 w-9"
                        textClassName="text-sm"
                        showOnlineDot
                        ring
                      />
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
                <Link href={loginHref}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="h-9 px-4 text-xs rounded-full"
                  >
                    <User className="w-4 h-4" strokeWidth={2} />
                    <span className="ms-1.5">{t("common.sign_in")}</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0 lg:hidden">
              <LanguageSwitcher />
              {mounted && isAuthenticated && <NotificationBell />}
              {featureFlags.kyc && (
                isAuthenticated ? (
                  <Link
                    href={`/${locale}/kyc`}
                    className="inline-flex h-8 max-w-[4.75rem] sm:max-w-[9.5rem] items-center gap-1 rounded-full border px-2 sm:px-2.5 text-[10px] font-semibold tracking-wide transition-colors"
                    style={{
                      backgroundColor: kycBadgeConfig.backgroundColor,
                      borderColor: kycBadgeConfig.borderColor,
                      color: kycBadgeConfig.color,
                    }}
                    aria-label={kycBadgeConfig.label}
                    title={kycBadgeConfig.label}
                  >
                    <span className="truncate">{kycBadgeConfig.shortLabel}</span>
                    <KycIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
                  </Link>
                ) : (
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
                )
              )}
              {mounted && isAuthenticated ? (
                <Link
                  href={`/${locale}/profile`}
                  className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
                >
                  <UserAvatar
                    name={user?.name}
                    imageUrl={user?.image_url}
                    className="h-7 w-7"
                    textClassName="text-xs"
                  />
                </Link>
              ) : (
                <Link href={loginHref}>
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
            className={`absolute top-0 start-0 h-full w-72 shadow-2xl overflow-y-auto transition-transform duration-300 ease-out rounded-e-2xl ${isAnimating ? (isRTL ? "translate-x-full" : "-translate-x-full") : "translate-x-0"}`}
            style={{ backgroundColor: getColor("surface") }}
          >
            <div
              className="flex justify-end p-4"
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
                <Link
                  href={`/${locale}/profile`}
                  onClick={closeMenu}
                  className="mb-4 p-4 rounded-xl block"
                  style={{ backgroundColor: getColor("primaryLight") }}
                >
                  <div className="flex items-center gap-3 text-start">
                    <UserAvatar
                      name={user?.name}
                      imageUrl={user?.image_url}
                      className="h-10 w-10"
                      textClassName="text-sm"
                    />
                    <div className="min-w-0">
                      <div
                        className="font-medium text-sm truncate"
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
                </Link>
              )}

              <nav className="space-y-1">
                {isAuthenticated && (
                  <>
                    {(
                      [
                        {
                          href: `/${locale}/user-dashboard`,
                          match: "/user-dashboard",
                          label: t("common.dashboard"),
                          icon: LayoutDashboard,
                        },
                        {
                          href: `/${locale}/profile`,
                          match: "/profile",
                          label: t("common.profile"),
                          icon: UserRound,
                        },
                        {
                          href: `/${locale}/profile/edit`,
                          match: "/profile/edit",
                          label: t("profile.edit_profile"),
                          icon: Pencil,
                        },
                        {
                          href: `/${locale}/profile/change-password`,
                          match: "/profile/change-password",
                          label: t("profile.change_password"),
                          icon: Lock,
                        },
                      ] as const
                    ).map((item) => {
                      const Icon = item.icon;
                      const active =
                        item.match === "/profile"
                          ? pathname === `/${locale}/profile` ||
                            pathname === `/${locale}/profile/`
                          : isActive(item.match);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${active ? "font-medium" : ""} text-start`}
                          style={{
                            backgroundColor: active
                              ? `${getColor("primary")}10`
                              : "transparent",
                            color: active
                              ? getColor("primary")
                              : getColor("primaryText"),
                          }}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="w-5 h-5" strokeWidth={2} />
                            {item.label}
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
                  </>
                )}

                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.match);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${ active ? "font-medium" : "" } text-start`}
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
                        className={`flex items-center gap-3`}
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

                {featureFlags.kyc && (
                  <Link
                    href={`/${locale}/kyc`}
                    onClick={closeMenu}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${ isActive("/kyc") ? "font-medium" : "" } text-start`}
                    style={{
                      backgroundColor: isAuthenticated
                        ? kycBadgeConfig.backgroundColor
                        : isActive("/kyc")
                          ? `${getColor("primary")}10`
                          : "transparent",
                      color: isAuthenticated
                        ? kycBadgeConfig.color
                        : isActive("/kyc")
                          ? getColor("primary")
                          : getColor("primaryText"),
                      border: isAuthenticated
                        ? `1px solid ${kycBadgeConfig.borderColor}`
                        : undefined,
                    }}
                  >
                    <span
                      className={`flex items-center gap-3`}
                    >
                      {isAuthenticated ? (
                        <>
                          <KycIcon className="w-5 h-5" strokeWidth={2.2} />
                          {kycBadgeConfig.label}
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" strokeWidth={2} />
                          {t("common.kyc_short")}
                        </>
                      )}
                    </span>
                    {isActive("/kyc") && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: isAuthenticated
                            ? kycBadgeConfig.color
                            : getColor("primary"),
                        }}
                      />
                    )}
                  </Link>
                )}

                {isAuthenticated && (
                  <Link
                    href={`/${locale}/notifications`}
                    onClick={closeMenu}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 ${ isActive("/notifications") ? "font-medium" : "" } text-start`}
                    style={{
                      backgroundColor: isActive("/notifications")
                        ? `${getColor("primary")}10`
                        : "transparent",
                      color: isActive("/notifications")
                        ? getColor("primary")
                        : getColor("primaryText"),
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <Bell className="w-5 h-5" strokeWidth={2} />
                      {t("common.notifications")}
                    </span>
                    {isActive("/notifications") && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: getColor("primary") }}
                      />
                    )}
                  </Link>
                )}
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-150 hover:bg-red-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-start`}
                    style={{ color: "#EF4444" }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t("common.sign_out")}</span>
                  </button>
                ) : (
                  <Link href={loginHref} onClick={closeMenu}>
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
