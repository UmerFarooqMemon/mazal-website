"use client";

import { SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

export type FilterKey = "emirate" | "digit_count" | "price_range" | "sort";

export type MarketplaceFilterState = Record<FilterKey, string>;

interface MarketplaceFiltersProps {
  selected: MarketplaceFilterState;
  onChange: (key: FilterKey, value: string) => void;
}

export default function MarketplaceFilters({
  selected,
  onChange,
}: MarketplaceFiltersProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  const filterSections: {
    key: FilterKey;
    title: string;
    options: { value: string; label: string }[];
  }[] = [
    {
      key: "emirate",
      title: t("marketplace.emirate"),
      options: [{ value: "Dubai", label: "Dubai" }],
    },
    {
      key: "digit_count",
      title: t("marketplace.digit_count"),
      options: [
        { value: "Any", label: t("marketplace.any") },
        { value: "1", label: t("marketplace.digit_1") },
        { value: "2", label: t("marketplace.digit_2") },
        { value: "3", label: t("marketplace.digit_3") },
        { value: "4", label: t("marketplace.digit_4") },
      ],
    },
    {
      key: "price_range",
      title: t("marketplace.price_range"),
      options: [
        { value: "under_100k", label: t("marketplace.under_100k") },
        { value: "100k_1m", label: t("marketplace.range_100k_1m") },
        { value: "1m_5m", label: t("marketplace.range_1m_5m") },
        { value: "5m_plus", label: t("marketplace.range_5m_plus") },
      ],
    },
    {
      key: "sort",
      title: t("marketplace.sort"),
      options: [
        { value: "az", label: t("marketplace.sort_az") },
        { value: "za", label: t("marketplace.sort_za") },
      ],
    },
  ];

  const handleSelect = (key: FilterKey, value: string) => {
    if (selected[key] === value) {
      onChange(key, key === "digit_count" ? "Any" : "");
      return;
    }
    onChange(key, value);
  };

  return (
    <div className="flex flex-col gap-7 items-start w-full">
      <div
        className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase"
        style={{ color: getColor("mutedText") }}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2.25} />
        {t("marketplace.filters")}
      </div>

      {filterSections.map((section) => (
        <div key={section.key} className="w-full">
          <h4
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: getColor("secondaryText") }}
          >
            {section.title}
          </h4>
          <div className="flex flex-wrap gap-2">
            {section.options.map((option) => {
              const isActive = selected[section.key] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(section.key, option.value)}
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors"
                  style={
                    isActive
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
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
