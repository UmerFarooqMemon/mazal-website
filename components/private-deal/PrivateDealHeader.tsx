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
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur-[7px]"
      style={{
        backgroundColor: `${getColor("background")}D9`,
        borderColor: `${getColor("border")}99`,
      }}
    >
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
                  className="flex size-9 items-center justify-center rounded-md font-serif font-bold text-xl text-white"
                  style={{
                    background:
                      getGradient("primaryButton") || getColor("primary"),
                  }}
                >
                  M
                </div>
                <span
                  className="font-serif font-semibold text-[22px] tracking-tight"
                  style={{ color: getColor("primaryText") }}
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
