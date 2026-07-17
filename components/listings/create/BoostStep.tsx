"use client";

import { ArrowLeft, ArrowRight, Check, Crown, Gem, Stars } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";
import LivePreview from "./LivePreview";
import type { BoostTier, CreateListingData } from "./CreateListingWizard";

interface BoostStepProps {
  data: CreateListingData;
  onChange: (patch: Partial<CreateListingData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

const TIERS: {
  key: BoostTier;
  icon: typeof Stars;
  price: number;
  badge?: string;
  features: string[];
}[] = [
  {
    key: "silver",
    icon: Stars,
    price: 250,
    badge: "DEFAULT",
    features: [
      "Priority above standard listings",
      "Silver badge on card",
      "3× search visibility",
    ],
  },
  {
    key: "gold",
    icon: Crown,
    price: 750,
    badge: "PREFERRED",
    features: [
      "Featured strip placement",
      "Boosted in search results",
      "Gold badge on card",
      "Weekly newsletter mention",
    ],
  },
  {
    key: "diamond",
    icon: Gem,
    price: 1000,
    badge: "Most impact",
    features: [
      "Top of marketplace",
      "Homepage hero rotation",
      "Dedicated concierge",
      "Priority auction placement",
      "Social media feature",
    ],
  },
];

export default function BoostStep({
  data,
  onChange,
  onBack,
  onContinue,
}: BoostStepProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const selected = TIERS.find((tier) => tier.key === data.boostTier) || TIERS[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8 items-start">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_12px_40px_-20px_rgba(4,20,67,0.15)] p-6 md:p-9">
        <h2
          className={`text-2xl font-serif font-bold text-[#041443] ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("listings.choose_tier")}
        </h2>
        <p
          className={`text-sm text-[#6B7280] mt-1 mb-8 ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("listings.tier_subtitle")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isSelected = data.boostTier === tier.key;
            return (
              <button
                key={tier.key}
                type="button"
                onClick={() => onChange({ boostTier: tier.key })}
                className={`relative text-left rounded-2xl border p-5 transition-all ${
                  isSelected
                    ? "border-[#0A3B9E] bg-[#F5F8FF] shadow-[0_8px_24px_-12px_rgba(10,59,158,0.35)]"
                    : "border-[#E5E7EB] bg-white hover:border-[#0A3B9E]/40"
                } ${isRTL ? "text-right" : ""}`}
              >
                {tier.badge && (
                  <span className="absolute top-4 end-3 text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    {tier.badge}
                  </span>
                )}
                <div className="size-9 rounded-xl bg-[#EEF2F8] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#0A3B9E]" />
                </div>
                <div className="text-lg font-serif font-bold text-[#041443]">
                  {t(`listings.tier_${tier.key}`)}
                </div>
                <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#9CA3AF] mt-1">
                  {t("listings.days_30")}
                </div>
                <div className="text-lg font-bold text-[#041443] mt-3 mb-4">
                  AED {tier.price.toLocaleString()}
                </div>
                <ul className="space-y-2.5 mb-5 min-h-[120px]">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-2 text-[11px] text-[#6B7280] border-t border-[#F3F4F6] pt-2 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <Check className="w-3 h-3 text-[#0A3B9E] mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className={`w-full h-7 rounded-lg text-[11px] font-semibold flex items-center justify-center ${
                    isSelected
                      ? "bg-[#0A3B9E] text-white"
                      : "bg-[#EEF2F8] text-[#0A3B9E]"
                  }`}
                >
                  {isSelected ? t("listings.selected") : t("listings.choose")}
                </div>
              </button>
            );
          })}
        </div>

        <div
          className={`flex items-center justify-between border-t border-[#E5E7EB] mt-8 pt-5 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            leftIcon={<BackIcon className="w-4 h-4" />}
            className="!rounded-lg text-[#6B7280]"
          >
            {t("listings.back")}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onContinue}
            rightIcon={<NextIcon className="w-4 h-4" />}
            className="!rounded-lg px-5"
          >
            {t("listings.continue")}
          </Button>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 space-y-4">
        <LivePreview
          code={data.code}
          digits={data.digits}
          emirate={data.emirate}
          price={data.price}
          hideCode={data.hideCode}
          label={t("listings.preview")}
        />
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-center gap-3 rounded-xl bg-[#041443] text-white py-4 px-4 mb-5">
            <Gem className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-[11px] font-bold tracking-[0.1em] uppercase">
              {t(`listings.tier_${selected.key}`)} {t("listings.featured")} —{" "}
              {t("listings.days_30")}
            </span>
          </div>
          <div className="space-y-0">
            {[
              [t("listings.tier"), t(`listings.tier_${selected.key}`)],
              [t("listings.duration"), t("listings.days_30")],
              [
                t("listings.total"),
                `AED ${selected.price.toLocaleString()}`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className={`flex items-center justify-between py-3.5 border-b border-[#F3F4F6] last:border-0 text-xs ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <span className="text-[#6B7280]">{label}</span>
                <span className="font-semibold text-[#041443] uppercase">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#0A3B9E] mt-4 font-medium">
            {t("listings.see_featured")} →
          </p>
        </div>
      </div>
    </div>
  );
}
