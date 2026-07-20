"use client";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LayoutSkeleton from "@/components/skeletons/layout/LayoutSkeleton";

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

  if (themeLoading || localeLoading) {
    return <LayoutSkeleton showFooterOnly />;
  }

  return <Footer />;
}
