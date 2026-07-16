"use client";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import Header from "@/components/layout/Header";
import FooterBottom from "@/components/layout/FooterBottom";
import PrivateDealHeader from "@/components/private-deal/PrivateDealHeader";
import PrivateDealFooter from "@/components/private-deal/PrivateDealFooter";
import LayoutSkeleton from "@/components/skeletons/layout/LayoutSkeleton";

function isPrivateDealPath(pathname: string | null) {
  if (!pathname) return false;
  return /\/(en|ar)\/private-deal(\/|$)/.test(pathname);
}

export function ConditionalHeader() {
  const pathname = usePathname();
  const { loading: themeLoading } = useTheme();
  const { loading: localeLoading } = useLocale();

  if (themeLoading || localeLoading) {
    return <LayoutSkeleton showHeaderOnly />;
  }

  if (isPrivateDealPath(pathname)) {
    return <PrivateDealHeader />;
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

  if (isPrivateDealPath(pathname)) {
    return <PrivateDealFooter />;
  }

  return <FooterBottom />;
}
