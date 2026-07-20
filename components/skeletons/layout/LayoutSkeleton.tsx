"use client";
import { useEffect, useState } from "react";

interface LayoutSkeletonProps {
  locale?: string;
  showHeaderOnly?: boolean;
  showFooterOnly?: boolean;
}

export default function LayoutSkeleton({
  locale = "en",
  showHeaderOnly = false,
  showFooterOnly = false,
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

  // Footer Skeleton
  const FooterSkeleton = () => (
    <footer className="bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-16">
        <div
          className={`grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,340px)_1fr] ${isRTL ? "text-right" : "text-left"}`}
        >
          <div className="space-y-5">
            <div className="w-32 h-10 bg-neutral-800 rounded animate-pulse" />
            <div className="w-full max-w-[320px] h-14 bg-neutral-800 rounded animate-pulse" />
            <div className={`flex gap-3 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
              <div className="size-9 bg-neutral-800 rounded-full animate-pulse" />
              <div className="size-9 bg-neutral-800 rounded-full animate-pulse" />
              <div className="size-9 bg-neutral-800 rounded-full animate-pulse" />
            </div>
            <div className="w-40 h-3 bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="w-24 h-4 bg-neutral-800 rounded animate-pulse" />
                <div className="w-20 h-3 bg-neutral-800 rounded animate-pulse" />
                <div className="w-28 h-3 bg-neutral-800 rounded animate-pulse" />
                <div className="w-24 h-3 bg-neutral-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );

  // Show header only
  if (showHeaderOnly) return <HeaderSkeleton />;

  // Show footer only
  if (showFooterOnly) return <FooterSkeleton />;

  // Show full layout skeleton
  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <HeaderSkeleton />
      <main className="grow" />
      <FooterSkeleton />
    </div>
  );
}
