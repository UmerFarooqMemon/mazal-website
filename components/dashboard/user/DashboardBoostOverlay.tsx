"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { Button, DirhamAmount } from "@/components/ui";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import ListingPlanBadge from "@/components/marketplace/ListingPlanBadge";
import {
  getListingPlans,
  type MarketplaceListingPlan,
} from "@/services/marketplace";
import type { DashboardListingRow } from "./DashboardListingsPanel";
import { useDashTheme } from "./theme";

export default function DashboardBoostOverlay({
  listing,
  onClose,
}: {
  listing: DashboardListingRow;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const {
    DASH_BORDER,
    DASH_BTN,
    DASH_GREEN,
    DASH_MUTED,
    DASH_SURFACE,
    DASH_TEXT,
    DASH_BG,
  } = useDashTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const [plans, setPlans] = useState<MarketplaceListingPlan[]>([]);
  const [selected, setSelected] = useState<MarketplaceListingPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getListingPlans(locale)
      .then((response) => {
        if (!active) return;
        const next = response.data.listing_plans || [];
        setPlans(next);
        setSelected(next.find((plan) => !plan.is_free) || next[0] || null);
      })
      .catch(() => {
        if (active) setPlans([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locale, listing.id]);

  const continueBoost = () => {
    toast.success(
      t("dashboard.boost_selected") || "Boost tier selected.",
    );
    onClose();
  };

  return (
    <div
      className="border-t px-6 pb-8 pt-6"
      style={{ borderColor: DASH_BORDER, backgroundColor: DASH_BG }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
        {t("dashboard.featured_listing") || "FEATURED LISTING"}
      </p>
      <h2 className="mt-2 max-w-xl whitespace-pre-line font-serif text-[28px] font-normal leading-9" style={{ color: DASH_TEXT }}>
        {t("dashboard.boost_title")}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: DASH_MUTED }}>
        {t("dashboard.boost_body")}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div
          className="rounded-2xl border bg-[var(--color-surface)] p-6 md:p-8"
          style={{ borderColor: DASH_BORDER }}
        >
          <h3 className="font-serif text-[22px]" style={{ color: DASH_TEXT }}>
            {t("listings.choose_tier")}
          </h3>
          <p className="mt-1 mb-8 text-sm" style={{ color: DASH_MUTED }}>
            {t("listings.tier_subtitle")}
          </p>

          {loading ? (
            <p className="py-8 text-sm" style={{ color: DASH_MUTED }}>
              {t("common.loading") || "Loading..."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {plans.map((plan) => {
                const active =
                  selected?.id === plan.id && selected?.slug === plan.slug;
                return (
                  <button
                    key={`${plan.slug}-${plan.id ?? "free"}`}
                    type="button"
                    onClick={() => setSelected(plan)}
                    className="rounded-2xl border p-5 text-start transition-shadow"
                    style={{
                      borderColor: active ? DASH_GREEN : DASH_BORDER,
                      backgroundColor: DASH_SURFACE,
                      boxShadow: active
                        ? "0 8px 24px -12px rgba(0,102,78,0.28)"
                        : undefined,
                    }}
                  >
                    <div className="font-serif text-[22px] text-[var(--color-primary)]">
                      {plan.name}
                    </div>
                    <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted-text)]">
                      {plan.duration_days
                        ? `${plan.duration_days} DAYS`
                        : "30 DAYS"}
                    </div>
                    <div className="mt-3 font-serif text-[22px] text-[var(--color-primary)]">
                      {(Number(plan.price) || 0) > 0 ? (
                        <DirhamAmount
                          amount={Number(plan.price) || 0}
                          weight="bold"
                        />
                      ) : (
                        t("listings.plan_free") || "Free"
                      )}
                    </div>
                    <ul className="mt-4 space-y-2 text-[12px] text-[var(--color-muted-text)]">
                      {(plan.features || []).slice(0, 5).map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div
                      className="mt-5 inline-flex h-8 items-center rounded-full px-4 text-xs font-medium"
                      style={{
                        background: active ? DASH_BTN : DASH_SURFACE,
                        color: active ? "#fbfaf6" : DASH_TEXT,
                        border: active ? undefined : `1px solid ${DASH_BORDER}`,
                      }}
                    >
                      {active ? t("listings.selected") : t("listings.choose")}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div
            className="mt-8 flex items-center justify-between border-t pt-5"
            style={{ borderColor: DASH_BORDER }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              leftIcon={<BackIcon className="h-4 w-4" />}
            >
              {t("common.back")}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={continueBoost}
              disabled={!selected || loading}
              style={{ background: DASH_BTN }}
            >
              {t("listings.continue")}
            </Button>
          </div>
        </div>

        <div
          className="rounded-2xl border bg-[var(--color-surface)] p-5"
          style={{ borderColor: DASH_BORDER }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-text)]">
            {t("listings.preview")}
          </p>
          <NumberPlateDisplay
            plate_code={listing.plate_code}
            plate_digits={listing.plate_digits}
            emirate={listing.emirate}
            preview={listing.preview}
            plateType={listing.plateType}
            plateDesign={listing.plateDesign}
            crop="card"
          />
          <div className="mt-4 flex items-center gap-2">
            <ListingPlanBadge
              plan={
                selected
                  ? {
                      id: selected.id,
                      name: selected.name,
                      slug: selected.slug,
                      price: selected.price,
                      is_free: selected.is_free,
                    }
                  : listing.listingPlan
              }
            />
          </div>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt style={{ color: DASH_MUTED }}>{t("listings.tier")}</dt>
              <dd className="font-medium" style={{ color: DASH_TEXT }}>
                {selected?.name || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt style={{ color: DASH_MUTED }}>
                {t("dashboard.duration") || "Duration"}
              </dt>
              <dd className="font-medium" style={{ color: DASH_TEXT }}>
                {selected?.duration_days
                  ? `${selected.duration_days} DAYS`
                  : "30 DAYS"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium" style={{ color: DASH_TEXT }}>
                {t("dashboard.total") || "Total"}
              </dt>
              <dd className="font-medium" style={{ color: DASH_TEXT }}>
                {(Number(selected?.price) || 0) > 0 ? (
                  <DirhamAmount
                    amount={Number(selected?.price) || 0}
                    weight="bold"
                  />
                ) : (
                  t("listings.plan_free") || "Free"
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
