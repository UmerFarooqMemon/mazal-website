"use client";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import Header from "@/components/layout/Header";
import FooterBottom from "@/components/layout/FooterBottom";
import LayoutSkeleton from "@/components/skeletons/layout/LayoutSkeleton";

export function ConditionalHeader() {
  const pathname = usePathname();
  const { loading: themeLoading } = useTheme();
  const { loading: localeLoading } = useLocale();

  if (themeLoading || localeLoading) {
    return <LayoutSkeleton showHeaderOnly />;
  }

  return <Header />;
}

export function ConditionalFooter() {
  const pathname = usePathname();
  const { loading: themeLoading } = useTheme();
  const { loading: localeLoading } = useLocale();

  if (themeLoading || localeLoading) {
    return <LayoutSkeleton showFooterBottomOnly />;
  }

  return <FooterBottom />;
}
