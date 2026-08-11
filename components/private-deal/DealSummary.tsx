"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import NumberPlateDisplay, {
  type PlateCropVariant,
} from "@/components/ui/NumberPlateDisplay";
import { DirhamAmount } from "@/components/ui";
import type { PlatePreviewConfig } from "@/lib/plate-preview";

export interface DealData {
  role: "seller" | "buyer" | null;
  emirate: string;
  plateType: string;
  plateVariant: string;
  /** Design key (e.g. new_colorful) — used when plateVariant is missing or not a full variant key. */
  plateDesign?: string;
  code: string;
  digit: string;
  price: number;
  /** When true, blur the plate code letter (hide_code / code_hidden). */
  hideCode?: boolean;
  /** Seller step: number plate vs other item. */
  sellingType?: "plate" | "other";
  itemTitle?: string;
  itemDescription?: string;
  /** Object URL or remote URL for Other-item preview in deal summary. */
  itemImageUrl?: string;
  itemSerial?: string;
}

export interface DealSummaryPricing {
  feeBreakdown?: Array<{
    slug: string;
    label: string;
    amount: string;
  }> | null;
  totalFees?: string | number | null;
  totalDue?: string | number | null;
  sellerNet?: string | number | null;
  /** Gift deals: buyer pays 0 / seller net 0 per API guide. */
  isGift?: boolean;
  buyerPaymentRequired?: boolean;
  /** Optional gift packaging line shown under fee rows. */
  giftPackageLabel?: string | null;
  giftPackageAmount?: number | null;
}

interface Variant {
  key: string;
  plate_type?: string;
  has_code?: boolean;
  fields?: string[];
  preview?: PlatePreviewConfig;
}

interface DealSummaryProps {
  data: DealData;
  allocatedAmount?: number;
  showAllocation?: boolean;
  plateCrop?: PlateCropVariant;
  pricing?: DealSummaryPricing;
}

function toAmount(value: string | number | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function DealSummary({
  data,
  allocatedAmount = 0,
  showAllocation = false,
  plateCrop = "form",
  pricing,
}: DealSummaryProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const price = data.price || 0;
  const isGift =
    Boolean(pricing?.isGift) || pricing?.buyerPaymentRequired === false;

  const apiFees = toAmount(pricing?.totalFees);
  const apiDue = toAmount(pricing?.totalDue);
  const apiNet = toAmount(pricing?.sellerNet);
  const breakdown = pricing?.feeBreakdown?.filter(
    (row) => row?.label && row.amount != null,
  );

  const fallbackFees = Math.round(price * 0.08);
  const fallbackNet = price - fallbackFees;
  const fallbackFeeLine = Math.round(price * 0.01);

  const totalFees = isGift
    ? (apiFees ?? fallbackFees)
    : (apiFees ?? fallbackFees);
  const totalDue = isGift ? (apiDue ?? 0) : (apiDue ?? price + fallbackFees);
  const sellerNet = isGift ? (apiNet ?? 0) : (apiNet ?? fallbackNet);

  const allocated = Math.min(Math.max(0, allocatedAmount), price);
  const remaining = Math.max(0, price - allocated);
  const pct = price > 0 ? Math.min(100, Math.round((allocated / price) * 100)) : 0;

  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    fetch(`/api/number-plates/options?locale=${locale}`)
      .then((r) => r.json())
      .then((res) => {
        const emirates = res?.data?.emirates || [];
        const allVariants = emirates.flatMap(
          (e: { variants?: Variant[] }) => e.variants || [],
        );
        setVariants(allVariants);
      })
      .catch(console.error);
  }, [locale]);

  // Exact match only — never fall back to variants[0] (wrong plate style).
  const selectedVariant = variants.find((v) => v.key === data.plateVariant);
  const variantFields = selectedVariant?.fields || [
    "plate_code",
    "plate_digits",
  ];
  const showCodeField =
    variantFields.includes("plate_code") &&
    (selectedVariant?.has_code ?? (Boolean(data.code) || Boolean(data.hideCode)));

  const hideCode = Boolean(data.hideCode);

  const emirateLabel =
    data.emirate?.toLowerCase() === "dubai"
      ? t("listings.emirate_dubai")
      : data.emirate?.toUpperCase() || t("listings.emirate_dubai");

  return (
    <div
      className="rounded-2xl border shadow-[0_8px_30px_rgba(1,15,81,0.06)] p-6"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div
        className={`relative z-10 text-[10px] font-bold uppercase tracking-wider ${plateCrop === "deal-summary" ? "mb-3" : "mb-4"} text-start`}
        style={{ color: getColor("mutedText") }}
      >
        {t("private-deal.summary_title")}
      </div>

      <div
        className={
          plateCrop === "deal-summary"
            ? "deal-summary-plate-frame mb-1"
            : "mb-5"
        }
      >
        {data.sellingType === "other" ? (
          <div
            className={
              plateCrop === "deal-summary"
                ? "deal-summary-plate w-full overflow-hidden rounded-xl"
                : "w-full overflow-hidden rounded-xl"
            }
            style={{
              backgroundColor: getColor("primaryLight"),
              aspectRatio: "16 / 10",
            }}
          >
            {data.itemImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.itemImageUrl}
                alt={data.itemTitle || t("private-deal.item_preview")}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center px-4 text-center">
                <span
                  className="text-sm font-medium"
                  style={{ color: getColor("mutedText") }}
                >
                  {data.itemTitle?.trim() || t("private-deal.item_preview")}
                </span>
              </div>
            )}
          </div>
        ) : (
          <NumberPlateDisplay
            plate_code={showCodeField ? data.code : ""}
            plate_digits={data.digit}
            emirate={emirateLabel}
            preview={selectedVariant?.preview}
            plateVariant={data.plateVariant}
            plateType={data.plateType}
            plateDesign={data.plateDesign}
            crop={plateCrop}
            showCode={showCodeField}
            hideCode={hideCode}
            wrapperClassName={
              plateCrop === "deal-summary"
                ? "deal-summary-plate w-full"
                : "w-full overflow-hidden"
            }
          />
        )}
      </div>

      <div className="space-y-3 text-sm">
        <Row
          label={t("private-deal.role_label")}
          value={
            data.role
              ? data.role === "seller"
                ? t("private-deal.seller_label")
                : t("private-deal.buyer_label")
              : "—"
          }
          isRTL={isRTL}
          getColor={getColor}
        />
        <Row
          label={t("private-deal.agreed_price")}
          value={<DirhamAmount amount={price} />}
          isRTL={isRTL}
          getColor={getColor}
        />

        {breakdown && breakdown.length > 0 ? (
          breakdown.map((row) => (
            <Row
              key={row.slug || row.label}
              label={row.label}
              value={<DirhamAmount amount={Number(row.amount) || 0} />}
              isRTL={isRTL}
              muted
              getColor={getColor}
            />
          ))
        ) : (
          <>
            <Row
              label={t("private-deal.escrow_custody")}
              value={<DirhamAmount amount={fallbackFeeLine} />}
              isRTL={isRTL}
              muted
              getColor={getColor}
            />
            <Row
              label={t("private-deal.platform_fee")}
              value={<DirhamAmount amount={Math.round(price * 0.04)} />}
              isRTL={isRTL}
              muted
              getColor={getColor}
            />
            <Row
              label={t("private-deal.service_transfer")}
              value={<DirhamAmount amount={Math.round(price * 0.03)} />}
              isRTL={isRTL}
              muted
              getColor={getColor}
            />
          </>
        )}

        {pricing?.giftPackageLabel &&
          pricing.giftPackageAmount != null &&
          pricing.giftPackageAmount > 0 && (
            <Row
              label={pricing.giftPackageLabel}
              value={<DirhamAmount amount={pricing.giftPackageAmount} />}
              isRTL={isRTL}
              muted
              getColor={getColor}
            />
          )}

        <div
          className="border-t pt-3"
          style={{ borderColor: getColor("border") }}
        >
          <Row
            label={t("private-deal.total_fees")}
            value={
              <DirhamAmount
                amount={
                  totalFees +
                  (pricing?.giftPackageAmount && pricing.giftPackageAmount > 0
                    ? pricing.giftPackageAmount
                    : 0)
                }
              />
            }
            isRTL={isRTL}
            getColor={getColor}
          />
        </div>

        <div
          className={`flex justify-between items-center pt-1 text-base font-bold`}
        >
          <span style={{ color: getColor("primaryText") }}>
            {data.role === "buyer"
              ? t("private-deal.you_pay_total")
              : t("private-deal.you_receive_net")}
          </span>
          <span style={{ color: getColor("primary") }}>
            <DirhamAmount
              amount={
                data.role === "buyer"
                  ? totalDue +
                    (pricing?.giftPackageAmount && pricing.giftPackageAmount > 0
                      ? pricing.giftPackageAmount
                      : 0)
                  : sellerNet
              }
              weight="bold"
            />
          </span>
        </div>

        {isGift && (
          <p
            className="text-xs text-start pt-1"
            style={{ color: getColor("mutedText") }}
          >
            {data.role === "seller"
              ? t("private-deal.gift_no_payout_note")
              : t("private-deal.gift_no_payment_note")}
          </p>
        )}
      </div>

      {showAllocation && !isGift && (
        <div
          className="mt-5 rounded-2xl border p-4"
          style={{
            borderColor: getColor("border"),
            backgroundColor: getColor("primaryLight"),
          }}
        >
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-start">
              <div
                className="text-[11px] mb-1"
                style={{ color: getColor("mutedText") }}
              >
                {t("private-deal.alloc_total")}
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: getColor("primaryText") }}
              >
                <DirhamAmount amount={price} />
              </div>
            </div>
            <div className="text-start">
              <div
                className="text-[11px] mb-1"
                style={{ color: getColor("mutedText") }}
              >
                {t("private-deal.alloc_allocated")}
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: getColor("primaryText") }}
              >
                <DirhamAmount amount={allocated} />
              </div>
            </div>
            <div className="text-start">
              <div
                className="text-[11px] mb-1"
                style={{ color: getColor("mutedText") }}
              >
                {t("private-deal.alloc_remaining")}
              </div>
              <div
                className="text-sm font-semibold"
                style={{ color: getColor("primaryText") }}
              >
                <DirhamAmount amount={remaining} />
              </div>
            </div>
          </div>

          <div className="relative pt-5">
            <div
              className="absolute top-0 text-[11px] font-medium -translate-x-1/2"
              style={{ left: `${pct}%`, color: getColor("primary") }}
            >
              {pct}%
            </div>
            <div className={`flex items-center gap-2`}>
              <div
                className="relative flex-1 h-2 rounded-full"
                style={{ backgroundColor: getColor("border") }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: getColor("primary"),
                  }}
                />
                <div
                  className="absolute top-1/2 size-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white shadow-sm"
                  style={{
                    left: `${pct}%`,
                    backgroundColor: getColor("primary"),
                  }}
                />
              </div>
              {pct >= 100 && (
                <CheckCircle2
                  className="w-4 h-4 shrink-0"
                  style={{ color: getColor("primary") }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  isRTL,
  muted,
  getColor,
}: {
  label: string;
  value: ReactNode;
  isRTL: boolean;
  muted?: boolean;
  getColor: (key: "mutedText" | "secondaryText" | "primaryText") => string;
}) {
  return (
    <div className={`flex justify-between gap-3`}>
      <span
        style={{
          color: muted ? getColor("mutedText") : getColor("secondaryText"),
        }}
      >
        {label}
      </span>
      <span
        className="font-medium shrink-0"
        style={{ color: getColor("primaryText") }}
      >
        {value}
      </span>
    </div>
  );
}
