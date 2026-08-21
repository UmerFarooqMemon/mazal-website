"use client";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LayoutSkeleton from "@/components/skeletons/layout/LayoutSkeleton";
import { featureFlags } from "@/config/featureFlags";

function useIsComingSoonPage() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const comingSoonPath = `/${locale}/comingsoon`;
  if (
    pathname === comingSoonPath ||
    pathname === `${comingSoonPath}/`
  ) {
    return true;
  }
  // Home also shows coming-soon when the feature flag is on.
  if (!featureFlags.comingSoon) return false;
  return pathname === `/${locale}` || pathname === `/${locale}/`;
}

export function ConditionalHeader() {
  const { loading: themeLoading } = useTheme();
  const { loading: localeLoading } = useLocale();
  const hideChrome = useIsComingSoonPage();

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
  const hideChrome = useIsComingSoonPage();

  if (hideChrome || !featureFlags.footer) {
    return null;
  }

  if (themeLoading || localeLoading) {
    return <LayoutSkeleton showFooterOnly />;
  }

  return <Footer />;
}
