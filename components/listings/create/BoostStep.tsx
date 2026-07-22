"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Crown, Gem, Stars } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount } from "@/components/ui";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
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
  badgeKey: string;
  iconColor: string;
  features: string[];
}[] = [
  {
    key: "silver",
    icon: Stars,
    price: 250,
    badgeKey: "badge_default",
    iconColor: "#6b7280",
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
    badgeKey: "badge_preferred",
    iconColor: "#c47a1a",
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
    badgeKey: "badge_most_impact",
    iconColor: "#00664e",
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
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const selected = TIERS.find((tier) => tier.key === data.boostTier) || TIERS[0];
  const SelectedIcon = selected.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8 items-start">
      <div
        className="rounded-2xl border shadow-[0_12px_40px_-20px_rgba(4,20,67,0.15)] p-6 md:p-9"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <h2
          className={`text-2xl font-serif font-bold ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("primaryText") }}
        >
          {t("listings.choose_tier")}
        </h2>
        <p
          className={`text-sm mt-1 mb-8 ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("secondaryText") }}
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
                    ? "shadow-[0_8px_24px_-12px_rgba(0,102,78,0.28)]"
                    : ""
                } ${isRTL ? "text-right" : ""}`}
                style={{
                  borderColor: isSelected
                    ? getColor("primary")
                    : getColor("border"),
                  backgroundColor: isSelected
                    ? getColor("primaryLight")
                    : getColor("surface"),
                }}
              >
                <span
                  className="absolute top-4 end-3 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${getColor("primary")}18`,
                    color: getColor("primary"),
                  }}
                >
                  {t(`listings.${tier.badgeKey}`)}
                </span>
                <div
                  className="size-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${tier.iconColor}14` }}
                >
                  <Icon className="w-5 h-5" style={{ color: tier.iconColor }} />
                </div>
                <div
                  className="text-lg font-serif font-bold"
                  style={{ color: getColor("primaryText") }}
                >
                  {t(`listings.tier_${tier.key}`)}
                </div>
                <div
                  className="text-[10px] font-bold tracking-[0.12em] uppercase mt-1"
                  style={{ color: getColor("mutedText") }}
                >
                  {t("listings.days_30")}
                </div>
                <div
                  className="text-lg font-bold mt-3 mb-4"
                  style={{ color: getColor("primaryText") }}
                >
                  <DirhamAmount amount={tier.price} weight="bold" />
                </div>
                <ul className="space-y-2.5 mb-5 min-h-[120px]">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-2 text-[11px] border-t pt-2 ${isRTL ? "flex-row-reverse" : ""}`}
                      style={{
                        color: getColor("secondaryText"),
                        borderColor: getColor("border"),
                      }}
                    >
                      <Check
                        className="w-3 h-3 mt-0.5 shrink-0"
                        style={{ color: getColor("primary") }}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className="w-full h-8 rounded-lg text-[11px] font-semibold flex items-center justify-center border"
                  style={{
                    backgroundColor: isSelected
                      ? getColor("primary")
                      : getColor("surface"),
                    borderColor: isSelected
                      ? getColor("primary")
                      : getColor("border"),
                    color: isSelected ? "#fff" : getColor("primary"),
                  }}
                >
                  {isSelected ? t("listings.selected") : t("listings.choose")}
                </div>
              </button>
            );
          })}
        </div>

        <div
          className={`flex items-center justify-between border-t mt-8 pt-5 ${isRTL ? "flex-row-reverse" : ""}`}
          style={{ borderColor: getColor("border") }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            leftIcon={<BackIcon className="w-4 h-4" />}
            className="!rounded-lg"
            style={{ color: getColor("secondaryText") }}
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

      <div className="lg:sticky lg:top-24">
        <div
          className="rounded-2xl border shadow-[0_12px_40px_-20px_rgba(4,20,67,0.15)] p-5"
          style={{
            backgroundColor: getColor("surface"),
            borderColor: getColor("border"),
          }}
        >
          <div
            className={`text-[11px] font-bold tracking-[0.14em] uppercase mb-4 ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("mutedText") }}
          >
            {t("listings.preview")}
          </div>

          <div className="mb-4">
            <NumberPlateDisplay
              plate_code={data.code || "AA"}
              plate_digits={data.digits || "777"}
              emirate={data.emirate || "dubai"}
              plateVariant={data.plateVariant}
              crop="live-preview"
              hideCode={Boolean(data.code) && data.hideCode}
              showCode
            />
          </div>

          <div
            className="flex items-center justify-center gap-2.5 rounded-xl text-white py-3.5 px-4 mb-5"
            style={{ backgroundColor: getColor("primary") }}
          >
            <SelectedIcon className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-bold tracking-[0.1em] uppercase">
              {t(`listings.tier_${selected.key}`)} {t("listings.featured")} —{" "}
              {t("listings.days_30")}
            </span>
          </div>

          <div className="space-y-0">
            {[
              [t("listings.tier"), t(`listings.tier_${selected.key}`)],
              [t("listings.duration"), t("listings.days_30")],
              [t("listings.total"), selected.price] as const,
            ].map(([label, value]) => (
              <div
                key={label}
                className={`flex items-center justify-between py-3.5 border-b last:border-0 text-xs ${isRTL ? "flex-row-reverse" : ""}`}
                style={{ borderColor: getColor("border") }}
              >
                <span style={{ color: getColor("secondaryText") }}>{label}</span>
                <span
                  className="font-semibold uppercase"
                  style={{ color: getColor("primaryText") }}
                >
                  {typeof value === "number" ? (
                    <DirhamAmount amount={value} weight="semibold" />
                  ) : (
                    value
                  )}
                </span>
              </div>
            ))}
          </div>

          <Link
            href={`/${locale}/marketplace`}
            className={`inline-flex items-center gap-1 text-xs mt-4 font-medium underline underline-offset-2 ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ color: getColor("primary") }}
          >
            {t("listings.see_featured")}
            <span aria-hidden>{isRTL ? "←" : "→"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
