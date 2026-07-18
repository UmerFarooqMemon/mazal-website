"use client";
import Image from "next/image";
import { Shield, Clock, Star, Eye } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

export default function PlateHero() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";

  const cards = [
    {
      icon: Shield,
      title: t("listings.escrow_protected_title"),
      desc: t("listings.escrow_protected_desc"),
    },
    {
      icon: Clock,
      title: t("listings.window_title"),
      desc: t("listings.window_desc"),
    },
    {
      icon: Star,
      title: t("listings.seller_rating_title"),
      desc: t("listings.seller_rating_desc"),
    },
    {
      icon: Eye,
      title: t("listings.views_title"),
      desc: t("listings.views_desc"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-2xl border p-8 md:p-12 flex items-center justify-center shadow-sm"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <div className="relative w-full max-w-xl aspect-[250/60]">
          <Image
            src="/home-new.png"
            alt="Dubai plate AA 7777"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 560px"
            priority
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`rounded-xl border p-4 shadow-sm ${isRTL ? "text-right" : "text-left"}`}
              style={{
                backgroundColor: getColor("surface"),
                borderColor: getColor("border"),
              }}
            >
              <div
                className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}
                style={{ color: getColor("primary") }}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
              </div>
              <h4
                className="font-semibold text-sm"
                style={{ color: getColor("primaryText") }}
              >
                {card.title}
              </h4>
              <p
                className="text-xs mt-1 leading-relaxed"
                style={{ color: getColor("mutedText") }}
              >
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
