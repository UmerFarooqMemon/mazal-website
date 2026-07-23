"use client";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LayoutSkeleton from "@/components/skeletons/layout/LayoutSkeleton";
import { featureFlags } from "@/config/featureFlags";

export function ConditionalHeader() {
  const { loading: themeLoading } = useTheme();
  const { loading: localeLoading } = useLocale();

  if (themeLoading || localeLoading) {
    return <LayoutSkeleton showHeaderOnly />;
  }

  return <Header />;
}

export function ConditionalFooter() {
  const { loading: themeLoading } = useTheme();
  const { loading: localeLoading } = useLocale();

  if (!featureFlags.footer) {
    return null;
  }

  if (themeLoading || localeLoading) {
    return <LayoutSkeleton showFooterOnly />;
  }

  return <Footer />;
}
