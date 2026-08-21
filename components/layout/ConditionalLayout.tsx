"use client";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LayoutSkeleton from "@/components/skeletons/layout/LayoutSkeleton";
import { featureFlags } from "@/config/featureFlags";

function useIsComingSoonHome() {
  const pathname = usePathname();
  const { locale } = useLocale();
  if (!featureFlags.comingSoon) return false;
  return pathname === `/${locale}` || pathname === `/${locale}/`;
}

export function ConditionalHeader() {
  const { loading: themeLoading } = useTheme();
  const { loading: localeLoading } = useLocale();
  const hideChrome = useIsComingSoonHome();

  if (hideChrome) {
    return null;
  }

  if (themeLoading || localeLoading) {
    return <LayoutSkeleton showHeaderOnly />;
  }

  return <Header />;
}

export function ConditionalFooter() {
  const { loading: themeLoading } = useTheme();
  const { loading: localeLoading } = useLocale();
  const hideChrome = useIsComingSoonHome();

  if (hideChrome || !featureFlags.footer) {
    return null;
  }

  if (themeLoading || localeLoading) {
    return <LayoutSkeleton showFooterOnly />;
  }

  return <Footer />;
}
