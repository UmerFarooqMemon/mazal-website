"use client";

import { useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import type { MarketplaceAuctionBrowseFilters } from "@/services/marketplace";

export type AuctionStatusChip = "all" | "live" | "ending_soon" | "upcoming";

export type AuctionBrowseFilterState = {
  status: AuctionStatusChip;
  hasBids: boolean;
  endingSoonHours: number;
  emirate: string;
  digit_count: string;
  sort: string;
  minPrice: string;
  maxPrice: string;
  minBid: string;
  maxBid: string;
};

const FALLBACK_SORT = [
  { key: "ending_soon", labelKey: "auctions.sort_ending_soon" },
  { key: "current_bid_asc", labelKey: "auctions.sort_current_bid_asc" },
  { key: "current_bid_desc", labelKey: "auctions.sort_current_bid_desc" },
  { key: "newest", labelKey: "marketplace.sort_newest" },
  { key: "oldest", labelKey: "marketplace.sort_oldest" },
  { key: "price_asc", labelKey: "marketplace.sort_price_asc" },
  { key: "price_desc", labelKey: "marketplace.sort_price_desc" },
  { key: "trending", labelKey: "marketplace.sort_trending" },
  { key: "relevance", labelKey: "marketplace.sort_relevance" },
];

const HOUR_OPTIONS = [6, 12, 24, 48, 72, 168];
const PRICE_SLIDER_MIN = 0;
const PRICE_SLIDER_MAX = 5_000_000;
const PRICE_SLIDER_STEP = 10_000;

function parseSliderValue(value: string, fallback: number) {
  const parsed = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function PriceRangeSlider({
  minValue,
  maxValue,
  onChange,
}: {
  minValue: string;
  maxValue: string;
  onChange: (min: string, max: string) => void;
}) {
  const { getColor } = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<"min" | "max" | null>(null);
  const min = Math.min(
    PRICE_SLIDER_MAX,
    Math.max(PRICE_SLIDER_MIN, parseSliderValue(minValue, PRICE_SLIDER_MIN)),
  );
  const max = Math.max(
    min,
    Math.min(PRICE_SLIDER_MAX, parseSliderValue(maxValue, PRICE_SLIDER_MAX)),
  );
  const span = PRICE_SLIDER_MAX - PRICE_SLIDER_MIN;
  const minPct = ((min - PRICE_SLIDER_MIN) / span) * 100;
  const maxPct = ((max - PRICE_SLIDER_MIN) / span) * 100;
  const minRef = useRef(min);
  const maxRef = useRef(max);
  minRef.current = min;
  maxRef.current = max;

  const emit = (nextMin: number, nextMax: number) => {
    const lo = Math.max(PRICE_SLIDER_MIN, Math.min(nextMin, nextMax));
    const hi = Math.min(PRICE_SLIDER_MAX, Math.max(nextMin, nextMax));
    onChange(
      lo <= PRICE_SLIDER_MIN ? "" : String(lo),
      hi >= PRICE_SLIDER_MAX ? "" : String(hi),
    );
  };

  const valueFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return min;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const raw = PRICE_SLIDER_MIN + ratio * span;
    return Math.round(raw / PRICE_SLIDER_STEP) * PRICE_SLIDER_STEP;
  };

  const applyPointer = (clientX: number, handle: "min" | "max") => {
    const next = valueFromClientX(clientX);
    const currentMin = minRef.current;
    const currentMax = maxRef.current;
    if (handle === "min") {
      emit(Math.min(next, currentMax - PRICE_SLIDER_STEP), currentMax);
    } else {
      emit(currentMin, Math.max(next, currentMin + PRICE_SLIDER_STEP));
    }
  };

  const onPointerDown = (
    event: React.PointerEvent<HTMLElement>,
    handle?: "min" | "max",
  ) => {
    event.preventDefault();
    event.stopPropagation();
    trackRef.current?.setPointerCapture(event.pointerId);
    const nextHandle =
      handle ??
      (Math.abs(valueFromClientX(event.clientX) - min) <=
      Math.abs(valueFromClientX(event.clientX) - max)
        ? "min"
        : "max");
    dragRef.current = nextHandle;
    applyPointer(event.clientX, nextHandle);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    applyPointer(event.clientX, dragRef.current);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    if (trackRef.current?.hasPointerCapture(event.pointerId)) {
      trackRef.current.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="w-full" dir="ltr">
      <div className="flex items-center justify-between mb-3 text-[12px] font-medium">
        <span style={{ color: getColor("primaryText") }}>
          <DirhamAmount amount={min} />
        </span>
        <span style={{ color: getColor("primaryText") }}>
          <DirhamAmount amount={max} />
          {max >= PRICE_SLIDER_MAX ? "+" : ""}
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative h-7 cursor-pointer touch-none select-none"
        onPointerDown={(event) => onPointerDown(event)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full"
          style={{ backgroundColor: getColor("border") }}
        />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full"
          style={{
            left: `${minPct}%`,
            width: `${Math.max(0, maxPct - minPct)}%`,
            backgroundColor: getColor("primary"),
          }}
        />
        <button
          type="button"
          aria-label="Minimum starting price"
          className="absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow cursor-grab"
          style={{
            left: `${minPct}%`,
            backgroundColor: getColor("primary"),
          }}
          onPointerDown={(event) => onPointerDown(event, "min")}
        />
        <button
          type="button"
          aria-label="Maximum starting price"
          className="absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow cursor-grab"
          style={{
            left: `${maxPct}%`,
            backgroundColor: getColor("primary"),
          }}
          onPointerDown={(event) => onPointerDown(event, "max")}
        />
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { getColor } = useTheme();
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center h-[30px] px-[13px] rounded-full text-[12px] font-medium transition-colors"
      style={
        active
          ? {
              backgroundColor: getColor("primaryText"),
              color: "#fff",
            }
          : {
              backgroundColor: "#EEF1F0",
              color: getColor("secondaryText"),
            }
      }
    >
      {children}
    </button>
  );
}

export default function AuctionBrowseFilters({
  selected,
  onChange,
  catalog,
}: {
  selected: AuctionBrowseFilterState;
  onChange: (patch: Partial<AuctionBrowseFilterState>) => void;
  catalog?: MarketplaceAuctionBrowseFilters | null;
}) {
  const { t } = useLocale();
  const { getColor } = useTheme();
  const [open, setOpen] = useState(false);

  const hoursDefault = catalog?.ending_soon_hours_default ?? 24;
  const hoursMin = catalog?.ending_soon_hours_min ?? 1;
  const hoursMax = catalog?.ending_soon_hours_max ?? 168;

  const sortOptions = (() => {
    const fromApi = [...(catalog?.sort_options || [])];
    const seen = new Set(fromApi.map((item) => item.key));
    const merged = [...fromApi];
    for (const item of FALLBACK_SORT) {
      if (!seen.has(item.key)) {
        merged.push({ key: item.key, label: t(item.labelKey) });
      }
    }
    return merged.map((item) => ({
      key: item.key,
      label:
        item.label ||
        t(
          FALLBACK_SORT.find((row) => row.key === item.key)?.labelKey ||
            item.key,
        ),
    }));
  })();

  const hourChoices = Array.from(
    new Set([
      hoursDefault,
      ...HOUR_OPTIONS.filter((h) => h >= hoursMin && h <= hoursMax),
    ]),
  ).sort((a, b) => a - b);

  const statusChips: { key: AuctionStatusChip; label: string }[] = [
    { key: "all", label: t("marketplace.all") },
    { key: "live", label: t("auctions.live_now") },
    { key: "ending_soon", label: t("auctions.ending_soon") },
    { key: "upcoming", label: t("auctions.upcoming") },
  ];

  const headerLabel = (
    <div
      className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase"
      style={{ color: getColor("mutedText") }}
    >
      <SlidersHorizontal className="w-4 h-4" strokeWidth={2.25} />
      {t("marketplace.filters")}
    </div>
  );

  return (
    <div className="flex flex-col gap-8 items-start w-full">
      <button
        type="button"
        className="flex items-center justify-between w-full lg:hidden"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        {headerLabel}
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          style={{ color: getColor("mutedText") }}
          strokeWidth={2.25}
        />
      </button>

      <div className="hidden lg:flex">{headerLabel}</div>

      <div
        className={`${
          open ? "flex" : "hidden"
        } lg:flex flex-col gap-8 items-start w-full`}
      >
        <div className="w-full">
          <h4
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: getColor("secondaryText") }}
          >
            {t("auctions.filter_status") || t("marketplace.filters")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {statusChips.map((chip) => (
              <Chip
                key={chip.key}
                active={selected.status === chip.key}
                onClick={() => onChange({ status: chip.key })}
              >
                {chip.label}
              </Chip>
            ))}
            <Chip
              active={selected.hasBids}
              onClick={() => onChange({ hasBids: !selected.hasBids })}
            >
              {t("auctions.has_bids")}
            </Chip>
          </div>
        </div>

        {selected.status === "ending_soon" ? (
          <div className="w-full">
            <h4
              className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
              style={{ color: getColor("secondaryText") }}
            >
              {t("auctions.ending_soon_hours")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {hourChoices.map((hours) => (
                <Chip
                  key={hours}
                  active={selected.endingSoonHours === hours}
                  onClick={() => onChange({ endingSoonHours: hours })}
                >
                  {hours === 168
                    ? t("auctions.hours_week")
                    : t("auctions.hours_count").replace(
                        "{count}",
                        String(hours),
                      )}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}

        <div className="w-full">
          <h4
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: getColor("secondaryText") }}
          >
            {t("marketplace.emirate")}
          </h4>
          <div className="flex flex-wrap gap-2">
            <Chip active onClick={() => onChange({ emirate: "Dubai" })}>
              Dubai
            </Chip>
          </div>
        </div>

        <div className="w-full">
          <h4
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: getColor("secondaryText") }}
          >
            {t("marketplace.digit_count")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {["Any", "1", "2", "3", "4", "5"].map((value) => (
              <Chip
                key={value}
                active={selected.digit_count === value}
                onClick={() =>
                  onChange({
                    digit_count:
                      selected.digit_count === value && value !== "Any"
                        ? "Any"
                        : value,
                  })
                }
              >
                {value === "Any"
                  ? t("marketplace.any")
                  : t(`marketplace.digit_${value}`)}
              </Chip>
            ))}
          </div>
        </div>

        <div className="w-full">
          <h4
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: getColor("secondaryText") }}
          >
            {t("auctions.starting_price")}
          </h4>
          <div className="flex flex-col gap-2">
            <PriceRangeSlider
              minValue={selected.minPrice}
              maxValue={selected.maxPrice}
              onChange={(minPrice, maxPrice) => onChange({ minPrice, maxPrice })}
            />
          </div>
        </div>

        <div className="w-full">
          <h4
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: getColor("secondaryText") }}
          >
            {t("marketplace.sort")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <Chip
                key={option.key}
                active={selected.sort === option.key}
                onClick={() =>
                  onChange({
                    sort: selected.sort === option.key ? "" : option.key,
                  })
                }
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="w-full">
          <h4
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: getColor("secondaryText") }}
          >
            {t("auctions.current_bid_range")}
          </h4>
          <div className="flex flex-col gap-2">
            <PriceRangeSlider
              minValue={selected.minBid}
              maxValue={selected.maxBid}
              onChange={(minBid, maxBid) => onChange({ minBid, maxBid })}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: getColor("mutedText") }}>
            {t("auctions.current_bid_range_hint")}
          </p>
        </div>
      </div>
    </div>
  );
}
