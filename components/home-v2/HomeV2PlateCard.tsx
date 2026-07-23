"use client";

import Link from "next/link";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";
import HomeV2Icon from "@/components/home-v2/HomeV2Icon";
import { useLocale } from "@/context/LocaleContext";

export type PlateTier = "diamond" | "gold" | "silver" | "verified";

export type HomeV2Plate = {
  id: string;
  code: string;
  digits: string;
  emirate?: string;
  price: number;
  views: number;
  rating: number;
  tier: PlateTier;
  showHeart?: boolean;
};

const TIER_STYLES: Record<
  PlateTier,
  { label: string; className: string; icon: string }
> = {
  diamond: {
    label: "DIAMOND",
    className: "bg-linear-to-r from-[#152e2b] to-[#00664e]",
    icon: "/home-v2/icon-diamond.svg",
  },
  gold: {
    label: "GOLD",
    className: "bg-linear-to-br from-[#e0ae57] to-[#a77927]",
    icon: "/home-v2/icon-crown.svg",
  },
  silver: {
    label: "SILVER",
    className: "bg-linear-to-br from-[#cdcdcd] to-[#969696]",
    icon: "/home-v2/icon-stars.svg",
  },
  verified: {
    label: "VERIFIED",
    className: "bg-linear-to-r from-[#152e2b] to-[#00664e]",
    icon: "/home-v2/icon-verified.svg",
  },
};

export default function HomeV2PlateCard({ plate }: { plate: HomeV2Plate }) {
  const { locale } = useLocale();
  const tier = TIER_STYLES[plate.tier];

  return (
    <Link
      href={`/${locale}/home-v2/plates/${plate.id}`}
      className="flex flex-col gap-4 rounded-xl border border-[#d9dee6] bg-white p-5 shadow-[0_1px_2px_rgba(1,15,81,0.08),0_8px_24px_-12px_rgba(1,15,81,0.15)] transition-shadow hover:shadow-[0_8px_28px_-10px_rgba(21,46,43,0.2)]"
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-[0.3px] text-white uppercase ${tier.className}`}
        >
          <HomeV2Icon src={tier.icon} size={12} />
          {tier.label}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-xs text-[#545e6f]">
            <HomeV2Icon src="/home-v2/icon-eye.svg" size={14} />
            {plate.views.toLocaleString("en-US")}
          </span>
          {plate.showHeart ? (
            <HomeV2Icon src="/home-v2/icon-heart.svg" size={19} />
          ) : null}
        </div>
      </div>

      <NumberPlateDisplay
        plate_code={plate.code}
        plate_digits={plate.digits}
        emirate={plate.emirate ?? "DUBAI"}
        plateVariant="private_new_colorful"
        crop="card"
      />

      <div className="flex flex-col gap-1">
        <div className="font-serif text-2xl font-semibold tracking-tight text-[#081123]">
          <DirhamAmount amount={plate.price} weight="bold" />
        </div>
        <div className="flex items-center gap-2 text-xs text-[#545e6f]">
          <span>Seller Rating</span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <HomeV2Icon src="/home-v2/icon-star.svg" size={12} />
            {plate.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
