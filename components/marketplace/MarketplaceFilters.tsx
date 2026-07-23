"use client";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

export type FilterKey = "emirate" | "digit_count" | "price_range" | "type";

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
      options: [
        { value: "All", label: t("marketplace.all") },
        { value: "Dubai", label: "Dubai" },
        { value: "Abu Dhabi", label: "Abu Dhabi" },
        { value: "Sharjah", label: "Sharjah" },
        { value: "Ajman", label: "Ajman" },
        { value: "RAK", label: "RAK" },
      ],
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
      key: "type",
      title: t("marketplace.type"),
      options: [
        { value: "Direct", label: t("marketplace.direct") },
        { value: "Auction", label: t("marketplace.auction") },
        { value: "Spot", label: t("marketplace.spot") },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-8 items-start">
      {filterSections.map((section) => (
        <div key={section.key} className="w-full">
          <h4
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ color: getColor("mutedText") }}
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
                  onClick={() =>
                    onChange(
                      section.key,
                      selected[section.key] === option.value ? "" : option.value,
                    )
                  }
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-opacity"
                  style={
                    isActive
                      ? {
                          backgroundColor: getColor("primary"),
                          color: "#fff",
                          borderColor: getColor("primary"),
                        }
                      : {
                          backgroundColor: getColor("surface"),
                          borderColor: getColor("border"),
                          color: getColor("secondaryText"),
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = getColor("primary");
                      e.currentTarget.style.color = getColor("primary");
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = getColor("border");
                      e.currentTarget.style.color = getColor("secondaryText");
                    }
                  }}
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
