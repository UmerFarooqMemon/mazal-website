"use client";
import { useEffect, useState } from "react";

interface LayoutSkeletonProps {
  locale?: string;
  showHeaderOnly?: boolean;
  showFooterBottomOnly?: boolean;
}

export default function LayoutSkeleton({
  locale = "en",
  showHeaderOnly = false,
  showFooterBottomOnly = false,
}: LayoutSkeletonProps) {
  const [currentLocale, setCurrentLocale] = useState(locale);

  useEffect(() => {
    const pathSegments = window.location.pathname.split("/");
    const urlLocale = pathSegments[1];
    if (urlLocale === "ar" || urlLocale === "en") {
      setCurrentLocale(urlLocale);
    }
  }, []);

  const isRTL = currentLocale === "ar";

  // Header Skeleton
  const HeaderSkeleton = () => (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex h-16 items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <div className="flex items-center shrink-0">
            <div className="w-24 h-9 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div
            className={`hidden lg:flex items-center gap-8 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div
            className={`hidden lg:flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-20 h-9 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div
            className={`flex items-center gap-2 lg:hidden ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );

  // Footer Bottom Skeleton
  const FooterBottomSkeleton = () => (
    <div className="border-t bg-gray-100 border-gray-200">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
      >
        <div className="w-40 h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-48 h-3 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );

  // Show header only
  if (showHeaderOnly) return <HeaderSkeleton />;

  // Show footer bottom only
  if (showFooterBottomOnly) return <FooterBottomSkeleton />;

  // Show full layout skeleton
  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <HeaderSkeleton />
      <main className="grow" />
      <FooterBottomSkeleton />
    </div>
  );
}
