"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import type { MarketplaceAuctionBrowseFilters } from "@/services/marketplace";

export type AuctionStatusChip = "all" | "live" | "ending_soon" | "upcoming";

export type AuctionBrowseFilterState = {
  status: AuctionStatusChip;
  hasBids: boolean;
  endingSoonHours: number;
  emirate: string;
  digit_count: string;
  price_range: string;
  sort: string;
  minBid: string;
  maxBid: string;
};

const EMIRATE_OPTIONS: { value: string; label?: string; labelKey?: string }[] = [
  { value: "All", labelKey: "marketplace.all" },
  { value: "Dubai", label: "Dubai" },
  { value: "Abu Dhabi", label: "Abu Dhabi" },
  { value: "Sharjah", label: "Sharjah" },
  { value: "Ajman", label: "Ajman" },
  { value: "Ras Al Khaimah", label: "Ras Al Khaimah" },
];

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
            {EMIRATE_OPTIONS.map((option) => {
              const label = option.labelKey ? t(option.labelKey) : option.label;
              return (
                <Chip
                  key={option.value}
                  active={selected.emirate === option.value}
                  onClick={() =>
                    onChange({
                      emirate:
                        selected.emirate === option.value ? "All" : option.value,
                    })
                  }
                >
                  {label}
                </Chip>
              );
            })}
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
          <div className="flex flex-wrap gap-2">
            {[
              { value: "under_100k", label: t("marketplace.under_100k") },
              { value: "100k_1m", label: t("marketplace.range_100k_1m") },
              { value: "1m_5m", label: t("marketplace.range_1m_5m") },
              { value: "5m_plus", label: t("marketplace.range_5m_plus") },
            ].map((option) => (
              <Chip
                key={option.value}
                active={selected.price_range === option.value}
                onClick={() =>
                  onChange({
                    price_range:
                      selected.price_range === option.value ? "" : option.value,
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
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={selected.minBid}
              onChange={(e) => onChange({ minBid: e.target.value })}
              placeholder={t("auctions.min_bid")}
              className="h-[38px] w-full rounded-full border px-4 text-sm outline-none"
              style={{
                borderColor: getColor("border"),
                backgroundColor: getColor("surface"),
                color: getColor("primaryText"),
              }}
            />
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={selected.maxBid}
              onChange={(e) => onChange({ maxBid: e.target.value })}
              placeholder={t("auctions.max_bid")}
              className="h-[38px] w-full rounded-full border px-4 text-sm outline-none"
              style={{
                borderColor: getColor("border"),
                backgroundColor: getColor("surface"),
                color: getColor("primaryText"),
              }}
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
