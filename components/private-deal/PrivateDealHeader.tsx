"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

export default function PrivateDealHeader() {
  const { locale } = useLocale();
  const { getColor, getGradient, branding } = useTheme();
  const isRTL = locale === "ar";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(217,222,230,0.6)] backdrop-blur-[7px] bg-[rgba(251,250,247,0.85)]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div
          className={`flex h-[69px] items-center ${isRTL ? "justify-end" : "justify-start"}`}
        >
          <Link
            href={`/${locale}`}
            className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {branding.logoUrl ? (
              <Image
                src={branding.logoUrl}
                alt="Mazal"
                width={100}
                height={36}
                className="h-9 w-auto object-contain"
                unoptimized
              />
            ) : (
              <>
                <div
                  className="flex size-9 items-center justify-center rounded-md font-serif font-bold text-xl text-[#fbfaf6]"
                  style={{ background: getGradient("primaryButton") || "linear-gradient(135deg, #010f51 0%, #0a2f94 55%, #2456d3 100%)" }}
                >
                  M
                </div>
                <span
                  className="font-serif font-semibold text-[22px] tracking-tight"
                  style={{ color: getColor("primaryText") || "#081123" }}
                >
                  Mazal
                </span>
              </>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
