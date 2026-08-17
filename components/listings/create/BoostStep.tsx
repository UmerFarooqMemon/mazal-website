"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Gift } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount } from "@/components/ui";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import {
  getListingPlans,
  getMarketWatchingListings,
  HOMEPAGE_WATCHING_SLOT_CAP,
  type MarketplaceListingPlan,
} from "@/services/marketplace";
import type { CreateListingData } from "./CreateListingWizard";

interface BoostStepProps {
  data: CreateListingData;
  onSelectPlan: (plan: MarketplaceListingPlan) => void;
  onChange: (patch: Partial<CreateListingData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

type PlanTone = "diamond" | "gold" | "silver" | "free";

function planTone(slug: string): PlanTone {
  const key = slug.toLowerCase();
  if (key.includes("premium") || key.includes("diamond")) return "diamond";
  if (key.includes("featured") || key.includes("gold")) return "gold";
  if (key.includes("free")) return "free";
  return "silver";
}

function planBadgeKey(plan: MarketplaceListingPlan) {
  if (plan.is_free) return "badge_default";
  if (plan.is_featured) return "badge_most_impact";
  return "badge_preferred";
}

function PlanIcon({ slug }: { slug: string }) {
  const tone = planTone(slug);

  if (tone === "diamond") {
    return (
      <div className="size-[35px] overflow-clip shrink-0">
        <img
          src="/listings/boost/icon-diamond.svg"
          alt=""
          width={35}
          height={35}
          className="block max-w-none size-full"
        />
      </div>
    );
  }

  if (tone === "free") {
    return (
      <div
        className="size-[35px] rounded-[17px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: "rgba(15, 118, 110, 0.12)" }}
      >
        <Gift className="w-5 h-5" style={{ color: "#0f766e" }} />
      </div>
    );
  }

  const src =
    tone === "gold"
      ? "/listings/boost/icon-crown.svg"
      : "/listings/boost/icon-stars.svg";
  const backgroundImage =
    tone === "gold"
      ? "linear-gradient(108deg, rgb(224, 174, 87) 0%, rgb(167, 121, 39) 100%)"
      : "linear-gradient(108deg, rgb(205, 205, 205) 0%, rgb(150, 150, 150) 100%)";

  return (
    <div
      className="size-[35px] rounded-[17px] overflow-clip flex items-center justify-center shrink-0"
      style={{ backgroundImage }}
    >
      <img
        src={src}
        alt=""
        width={20}
        height={20}
        className="block max-w-none"
        style={{ width: 20, height: 20 }}
      />
    </div>
  );
}

function PreviewBannerIcon({ slug }: { slug: string }) {
  const tone = planTone(slug);
  const src =
    tone === "diamond"
      ? "/home-v2/icon-diamond.svg"
      : tone === "gold"
        ? "/listings/boost/icon-crown.svg"
        : "/listings/boost/icon-stars.svg";
  const width = tone === "diamond" ? 12 : 16;
  const height = tone === "diamond" ? 10 : 16;

  return (
    <div className="overflow-clip shrink-0" style={{ width, height }}>
      <img
        src={src}
        alt=""
        width={width}
        height={height}
        className="block max-w-none size-full"
      />
    </div>
  );
}

export default function BoostStep({
  data,
  onSelectPlan,
  onChange,
  onBack,
  onContinue,
}: BoostStepProps) {
  const { t, locale } = useLocale();
  const { getColor, getGradient } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const [plans, setPlans] = useState<MarketplaceListingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchingCount, setWatchingCount] = useState(0);

  useEffect(() => {
    let active = true;
    getMarketWatchingListings(locale)
      .then((response) => {
        if (!active) return;
        const listings = response.data.listings || [];
        setWatchingCount(listings.length);
      })
      .catch(() => {
        if (active) setWatchingCount(0);
      });
    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getListingPlans(locale)
      .then((response) => {
        if (!active) return;
        const nextPlans = response.data.listing_plans || [];
        setPlans(nextPlans);
        setError(null);

        const selected =
          nextPlans.find(
            (plan) =>
              (plan.id == null && data.listingPlanId == null) ||
              (plan.id != null && plan.id === data.listingPlanId),
          ) || nextPlans[0];

        if (selected) onSelectPlan(selected);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : t("listings.plans_load_error") || "Failed to load listing plans.",
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
        (plan.id == null && data.listingPlanId == null) ||
        (plan.id != null && plan.id === data.listingPlanId),
    ) || plans[0];

  const durationLabel = selected?.duration_days
    ? t("listings.days_n").replace("{days}", String(selected.duration_days)) ||
      `${selected.duration_days} DAYS`
    : t("listings.days_30");

  const slotsAvailable = Math.max(
    0,
    HOMEPAGE_WATCHING_SLOT_CAP - watchingCount,
  );
  const homepageFull = watchingCount >= HOMEPAGE_WATCHING_SLOT_CAP;
  const showOnMarketplace = data.showOnMarketplace !== false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,504px)] gap-6 items-start">
      <div
        className="rounded-[18px] border p-6 md:p-9 flex flex-col gap-7"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <div className="flex flex-col gap-1">
          <h2
            className="text-[22px] font-serif font-normal tracking-[-0.02em] leading-7"
            style={{ color: getColor("primaryText") }}
          >
            {t("listings.choose_tier")}
          </h2>
          <p
            className="text-base leading-6"
            style={{ color: getColor("secondaryText") }}
          >
            {t("listings.tier_subtitle")}
          </p>
        </div>

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
            className={`grid grid-cols-1 gap-[22px] ${
              plans.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
            }`}
          >
            {plans.map((plan, index) => {
              const isLastPlan = index === plans.length - 1;
              const isSelected =
                (plan.id == null && data.listingPlanId == null) ||
                (plan.id != null && plan.id === data.listingPlanId);
              const price = Number(plan.price) || 0;
              const planDays = plan.duration_days
                ? t("listings.days_n").replace(
                    "{days}",
                    String(plan.duration_days),
                  ) || `${plan.duration_days} DAYS`
                : t("listings.days_30");
              const features = plan.features?.length
                ? plan.features
                : [plan.description || plan.name];

              return (
                <button
                  key={`${plan.slug}-${plan.id ?? "free"}`}
                  type="button"
                  onClick={() => onSelectPlan(plan)}
                  className="relative text-start rounded-[19px] border bg-white pt-5 px-[21px] pb-[22px] min-h-[354px] flex flex-col gap-[17px] transition-shadow"
                  style={{
                    borderColor: isSelected
                      ? getColor("primary") || "#0f6646"
                      : getColor("border") || "#d9dee6",
                    backgroundColor: getColor("surface") || "#ffffff",
                    boxShadow: isSelected
                      ? "0px 1px 1px rgba(1,15,81,0.08), 0px 7px 11px rgba(1,15,81,0.15)"
                      : "0px 1px 1px rgba(1,15,81,0.08)",
                  }}
                >
                  <span
                    className="absolute top-5 end-4 rounded-full px-2.5 py-0.5 text-[8px] font-medium uppercase tracking-[0.2px] text-white"
                    style={{ background: getGradient("primaryButton") }}
                  >
                    {t(`listings.${planBadgeKey(plan)}`)}
                  </span>
                  <PlanIcon slug={plan.slug} />
                  <div className="flex flex-col gap-3.5">
                    <div>
                      <div
                        className="text-[22px] font-serif font-normal tracking-[-0.02em] leading-6"
                        style={{ color: getColor("primaryText") }}
                      >
                        {plan.name}
                      </div>
                      <div
                        className="text-[10px] uppercase mt-0.5 leading-[14px]"
                        style={{ color: getColor("secondaryText") }}
                      >
                        {planDays}
                      </div>
                    </div>
                    <div
                      className="text-[22px] font-serif font-normal tracking-[-0.02em] leading-6"
                      style={{ color: getColor("primary") }}
                    >
                      {price > 0 ? (
                        <DirhamAmount amount={price} weight="bold" />
                      ) : (
                        t("listings.plan_free") || "Free"
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 justify-between gap-2 min-h-0">
                    <ul className="w-full">
                      {features.map((feature) => (
                        <li
                          key={feature}
                          className="text-[12px] leading-[18px] border-b py-[5px]"
                          style={{
                            color: getColor("secondaryText"),
                            borderColor: getColor("border"),
                          }}
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-[7px] items-center w-full">
                      <div
                        className="w-full h-[26px] rounded-full text-[11px] font-medium flex items-center justify-center border"
                        style={{
                          background: isSelected
                            ? getGradient("primaryButton")
                            : getColor("surface"),
                          borderColor: isSelected
                            ? "transparent"
                            : getColor("border"),
                          color: isSelected
                            ? "#fbfaf6"
                            : getColor("primaryText"),
                        }}
                      >
                        {isSelected
                          ? t("listings.selected")
                          : t("listings.choose")}
                      </div>
                      {isLastPlan ? (
                        <p
                          className="w-[155px] font-bold text-center tracking-normal"
                          style={{
                            color: "#545E6F",
                            fontSize: 8,
                            lineHeight: "10.9px",
                            letterSpacing: 0,
                          }}
                        >
                          {t("listings.slots_available")
                            .replace("{available}", String(slotsAvailable))
                            .replace(
                              "{total}",
                              String(HOMEPAGE_WATCHING_SLOT_CAP),
                            )}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div
          className="flex items-center justify-between border-t pt-[22px]"
          style={{ borderColor: getColor("border") }}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            leftIcon={<BackIcon className="w-3.5 h-3.5" />}
          >
            {t("listings.back")}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onContinue}
            disabled={!selected || loading}
            rightIcon={<NextIcon className="w-3.5 h-3.5" />}
          >
            {t("listings.continue")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-[29px] lg:sticky lg:top-24">
        <div
          className="rounded-xl border p-[18px] flex flex-col gap-6 shadow-[0_0_17px_rgba(74,168,45,0.2)]"
          style={{
            backgroundColor: getColor("surface"),
            borderColor: getColor("border"),
          }}
        >
          <div
            className="text-[11px] font-medium tracking-[0.14em] uppercase"
            style={{ color: getColor("mutedText") }}
          >
            {t("listings.preview")}
          </div>

          <NumberPlateDisplay
            plate_code={data.code}
            plate_digits={data.digits}
            emirate={data.emirate || "dubai"}
            plateVariant={data.plateVariant}
            crop="live-preview"
            hideCode={Boolean(data.code) && data.hideCode}
            showCode={Boolean(data.code.trim())}
          />

          <div
            className="flex items-center justify-center gap-2.5 rounded-full text-white py-3 px-4"
            style={{ background: getGradient("primaryButton") }}
          >
            <PreviewBannerIcon slug={data.listingPlanSlug} />
            <span className="text-[11px] font-bold tracking-[0.1em] uppercase">
              {data.listingPlanName}{" "}
              {data.listingPlanRequiresPayment
                ? t("listings.featured")
                : t("listings.plan_free") || "Free"}{" "}
              — {durationLabel}
            </span>
          </div>

          <div className="space-y-0">
            {[
              [t("listings.tier"), data.listingPlanName],
              [t("listings.duration"), durationLabel],
              [t("listings.total"), data.listingPlanPrice] as const,
            ].map(([label, value], index, rows) => (
              <div
                key={String(label)}
                className="flex items-center justify-between py-3.5 px-1 text-base border-b"
                style={{
                  borderColor: getColor("border"),
                  color:
                    index === rows.length - 1
                      ? getColor("primaryText")
                      : getColor("secondaryText"),
                  fontWeight: index === rows.length - 1 ? 500 : 400,
                }}
              >
                <span>{label}</span>
                <span className="uppercase text-end">
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
            href={`/${locale}/marketplace`}
            className="text-base text-center underline underline-offset-2"
            style={{ color: getColor("primary") }}
          >
            {t("listings.see_featured")} {isRTL ? "←" : "→"}
          </Link>
        </div>

        {homepageFull ? (
        <div
          className="rounded-[14px] border p-[22px] flex flex-col gap-[11px]"
          style={{
            backgroundColor: "rgba(224, 174, 87, 0.05)",
            borderColor: "rgba(224, 174, 87, 0.4)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="size-[14px] overflow-clip shrink-0">
              <img
                src="/listings/boost/icon-sparkle.svg"
                alt=""
                width={14}
                height={14}
                className="block max-w-none size-full"
              />
            </div>
            <p
              className="text-sm font-bold leading-[18px]"
              style={{ color: getColor("primaryText") }}
            >
              {t("listings.prebooking_title")}
            </p>
          </div>
          <div
            className="text-xs leading-[18px] whitespace-pre-wrap"
            style={{ color: getColor("secondaryText") }}
          >
            <p>{t("listings.prebooking_body")}</p>
            <p className="mt-3">{t("listings.prebooking_note")}</p>
          </div>
          <div
            className="flex items-center gap-1 border-t pt-[22px]"
            style={{ borderColor: getColor("border") }}
          >
            <button
              type="button"
              onClick={() => onChange({ showOnMarketplace: false })}
              className="min-w-[56px] rounded-full px-[15px] py-2 text-[13px] leading-[18px] border"
              style={{
                background: showOnMarketplace
                  ? "transparent"
                  : getGradient("primaryButton"),
                borderColor: showOnMarketplace
                  ? getColor("secondaryText")
                  : "transparent",
                color: showOnMarketplace ? getColor("primaryText") : "#fbfaf6",
              }}
            >
              {t("listings.prebooking_no")}
            </button>
            <button
              type="button"
              onClick={() => onChange({ showOnMarketplace: true })}
              className="rounded-full px-[18px] py-2 text-[13px] leading-[18px] font-medium"
              style={{
                background: showOnMarketplace
                  ? getGradient("primaryButton")
                  : "transparent",
                border: showOnMarketplace
                  ? "none"
                  : `1px solid ${getColor("secondaryText")}`,
                color: showOnMarketplace ? "#fbfaf6" : getColor("primaryText"),
                boxShadow: showOnMarketplace
                  ? "0px 1px 2px rgba(1,15,81,0.08), 0px 7px 22px -11px rgba(1,15,81,0.15)"
                  : undefined,
              }}
            >
              {t("listings.prebooking_yes")}
            </button>
          </div>
        </div>
        ) : null}
      </div>
    </div>
  );
}
