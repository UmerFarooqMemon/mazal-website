"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Gem,
  Gift,
  Stars,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount } from "@/components/ui";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import {
  getAuctionPlans,
  type MarketplaceAuctionPlan,
} from "@/services/marketplace";
import type { AuctionPlateDraft } from "./AddPlateForm";

interface AuctionPlanStepProps {
  draft: AuctionPlateDraft;
  selectedPlanId: number | null;
  selectedPlanSlug: string;
  selectedPlanName: string;
  selectedPlanPrice: number;
  selectedPlanRequiresPayment: boolean;
  onSelectPlan: (plan: MarketplaceAuctionPlan) => void;
  onBack: () => void;
  onContinue: () => void;
  submitting?: boolean;
}

function planIcon(slug: string) {
  const key = slug.toLowerCase();
  if (key.includes("premium") || key.includes("diamond")) return Gem;
  if (key.includes("featured") || key.includes("gold")) return Crown;
  if (key.includes("free")) return Gift;
  return Stars;
}

function planIconColor(slug: string) {
  const key = slug.toLowerCase();
  if (key.includes("premium") || key.includes("diamond")) return "#00664e";
  if (key.includes("featured") || key.includes("gold")) return "#c47a1a";
  if (key.includes("free")) return "#0f766e";
  return "#6b7280";
}

function planBadgeKey(plan: MarketplaceAuctionPlan) {
  if (plan.is_free) return "badge_default";
  if (plan.is_featured) return "badge_most_impact";
  return "badge_preferred";
}

export default function AuctionPlanStep({
  draft,
  selectedPlanId,
  selectedPlanSlug,
  selectedPlanName,
  selectedPlanPrice,
  selectedPlanRequiresPayment,
  onSelectPlan,
  onBack,
  onContinue,
  submitting = false,
}: AuctionPlanStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const [plans, setPlans] = useState<MarketplaceAuctionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAuctionPlans(locale)
      .then((response) => {
        if (!active) return;
        const nextPlans =
          response.data.auction_plans ||
          (response.data as { plans?: MarketplaceAuctionPlan[] }).plans ||
          [];
        setPlans(nextPlans);
        setError(null);

        const selected =
          nextPlans.find(
            (plan) =>
              (plan.id == null && selectedPlanId == null) ||
              (plan.id != null && plan.id === selectedPlanId),
          ) || nextPlans[0];

        if (selected) onSelectPlan(selected);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : t("auctions.plans_load_error") || "Failed to load auction plans.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const selected =
    plans.find(
      (plan) =>
        (plan.id == null && selectedPlanId == null) ||
        (plan.id != null && plan.id === selectedPlanId),
    ) || plans[0];
  const SelectedIcon = selected
    ? planIcon(selected.slug)
    : planIcon(selectedPlanSlug);

  const durationLabel = selected?.duration_days
    ? t("listings.days_n").replace("{days}", String(selected.duration_days)) ||
      `${selected.duration_days} DAYS`
    : t("listings.days_30");

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
          className="text-2xl font-serif font-bold"
          style={{ color: getColor("primaryText") }}
        >
          {t("auctions.choose_plan") || t("listings.choose_tier")}
        </h2>
        <p
          className="text-sm mt-1 mb-8"
          style={{ color: getColor("secondaryText") }}
        >
          {t("auctions.plan_subtitle") || t("listings.tier_subtitle")}
        </p>

        {loading ? (
          <p className="text-sm py-8" style={{ color: getColor("mutedText") }}>
            {t("common.loading") || "Loading..."}
          </p>
        ) : error ? (
          <p className="text-sm py-8" style={{ color: "#DC2626" }}>
            {error}
          </p>
        ) : (
          <div
            className={`grid grid-cols-1 gap-4 ${
              plans.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
            }`}
          >
            {plans.map((plan) => {
              const Icon = planIcon(plan.slug);
              const iconColor = planIconColor(plan.slug);
              const isSelected =
                (plan.id == null && selectedPlanId == null) ||
                (plan.id != null && plan.id === selectedPlanId);
              const price = Number(plan.price) || 0;
              const planDays = plan.duration_days
                ? t("listings.days_n").replace(
                    "{days}",
                    String(plan.duration_days),
                  ) || `${plan.duration_days} DAYS`
                : t("listings.days_30");

              return (
                <button
                  key={`${plan.slug}-${plan.id ?? "free"}`}
                  type="button"
                  onClick={() => onSelectPlan(plan)}
                  className={`relative text-start rounded-2xl border p-5 min-h-[320px] transition-all ${
                    isSelected
                      ? "shadow-[0_8px_24px_-12px_rgba(0,102,78,0.28)]"
                      : ""
                  }`}
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
                    {t(`listings.${planBadgeKey(plan)}`)}
                  </span>
                  <div
                    className="size-9 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${iconColor}14` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: iconColor }} />
                  </div>
                  <div
                    className="text-lg font-serif font-bold"
                    style={{ color: getColor("primaryText") }}
                  >
                    {plan.name}
                  </div>
                  <div
                    className="text-[10px] font-bold tracking-[0.12em] uppercase mt-1"
                    style={{ color: getColor("mutedText") }}
                  >
                    {planDays}
                  </div>
                  <div
                    className="text-lg font-bold mt-3 mb-4"
                    style={{ color: getColor("primaryText") }}
                  >
                    {price > 0 ? (
                      <DirhamAmount amount={price} weight="bold" />
                    ) : (
                      t("listings.plan_free") || "Free"
                    )}
                  </div>
                  <ul className="space-y-2.5 mb-5 min-h-[100px]">
                    {(plan.features?.length
                      ? plan.features
                      : [plan.description || plan.name]
                    ).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-[11px] border-t pt-2"
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
        )}

        <div
          className="flex items-center justify-between border-t mt-8 pt-5"
          style={{ borderColor: getColor("border") }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            leftIcon={<BackIcon className="w-4 h-4" />}
            disabled={submitting}
          >
            {t("auctions.back")}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onContinue}
            disabled={!selected || loading || submitting}
            rightIcon={<NextIcon className="w-4 h-4" />}
            className="!rounded-lg px-5"
          >
            {submitting
              ? t("common.loading") || "Loading..."
              : t("auctions.continue")}
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
            className="text-[11px] font-bold tracking-[0.14em] uppercase mb-4"
            style={{ color: getColor("mutedText") }}
          >
            {t("listings.preview")}
          </div>

          <div className="mb-4">
            <NumberPlateDisplay
              plate_code={draft.plate_code}
              plate_digits={draft.plate_digits}
              emirate={draft.emirate || "dubai"}
              plateVariant={draft.plate_variant}
              crop="live-preview"
              showCode={Boolean(draft.plate_code)}
            />
          </div>

          <div
            className="flex items-center justify-center gap-2.5 rounded-xl text-white py-3.5 px-4 mb-5"
            style={{ backgroundColor: getColor("primary") }}
          >
            <SelectedIcon className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-bold tracking-[0.1em] uppercase">
              {selectedPlanName}{" "}
              {selectedPlanRequiresPayment
                ? t("listings.featured")
                : t("listings.plan_free") || "Free"}{" "}
              — {durationLabel}
            </span>
          </div>

          <div className="space-y-0">
            {[
              [t("listings.tier"), selectedPlanName],
              [t("listings.duration"), durationLabel],
              [t("listings.total"), selectedPlanPrice] as const,
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between py-3.5 border-b last:border-0 text-xs"
                style={{ borderColor: getColor("border") }}
              >
                <span style={{ color: getColor("secondaryText") }}>{label}</span>
                <span
                  className="font-semibold uppercase"
                  style={{ color: getColor("primaryText") }}
                >
                  {typeof value === "number" ? (
                    value > 0 ? (
                      <DirhamAmount amount={value} weight="semibold" />
                    ) : (
                      t("listings.plan_free") || "Free"
                    )
                  ) : (
                    value
                  )}
                </span>
              </div>
            ))}
          </div>

          <Link
            href={`/${locale}/auctions`}
            className="inline-flex items-center gap-1 text-xs mt-4 font-medium underline underline-offset-2"
            style={{ color: getColor("primary") }}
          >
            {t("auctions.browse_auctions") || t("listings.see_featured")}
            <span aria-hidden>{isRTL ? "←" : "→"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
