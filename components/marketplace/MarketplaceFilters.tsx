"use client";
import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";

export default function MarketplaceFilters() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  // Toggle state for each filter section
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    emirate: true, // Open by default
    digit_count: true, // Open by default
    price_range: false, // Closed by default
    type: false, // Closed by default
  });

  // Toggle function
  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter options data
  const filterSections = [
    {
      key: "emirate",
      title: t("marketplace.emirate"),
      options: [
        { value: "All", label: t("marketplace.all"), active: true },
        { value: "Dubai", label: "Dubai", active: false },
        { value: "Abu Dhabi", label: "Abu Dhabi", active: false },
        { value: "Sharjah", label: "Sharjah", active: false },
        { value: "Ajman", label: "Ajman", active: false },
        { value: "RAK", label: "RAK", active: false },
      ],
    },
    {
      key: "digit_count",
      title: t("marketplace.digit_count"),
      options: [
        { value: "Any", label: t("marketplace.any"), active: true },
        { value: "1", label: t("marketplace.digit_1"), active: false },
        { value: "2", label: t("marketplace.digit_2"), active: false },
        { value: "3", label: t("marketplace.digit_3"), active: false },
        { value: "4", label: t("marketplace.digit_4"), active: false },
      ],
    },
    {
      key: "price_range",
      title: t("marketplace.price_range"),
      options: [
        {
          value: "under_100k",
          label: t("marketplace.under_100k"),
          active: false,
        },
        {
          value: "100k_1m",
          label: t("marketplace.range_100k_1m"),
          active: false,
        },
        { value: "1m_5m", label: t("marketplace.range_1m_5m"), active: false },
        {
          value: "5m_plus",
          label: t("marketplace.range_5m_plus"),
          active: false,
        },
      ],
    },
    {
      key: "type",
      title: t("marketplace.type"),
      options: [
        { value: "Direct", label: t("marketplace.direct"), active: false },
        { value: "Auction", label: t("marketplace.auction"), active: false },
        { value: "Spot", label: t("marketplace.spot"), active: false },
      ],
    },
  ];

  return (
    <div
      className={`flex flex-col gap-4 ${isRTL ? "items-end text-right" : "items-start text-left"}`}
    >
      {filterSections.map((section) => (
        <div key={section.key} className="w-full border-b border-gray-100 pb-4">
          {/* Toggle Button - Clickable Header */}
          <button
            onClick={() => toggleSection(section.key)}
            className={`w-full flex items-center justify-between py-2 group ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#0A3B9E] transition-colors">
              {section.title}
            </h4>
            {/* Arrow Icon - Rotates when open */}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                openSections[section.key] ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Filter Options - Show/Hide with animation */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSections[section.key]
                ? "max-h-96 opacity-100 mt-3"
                : "max-h-0 opacity-0"
            }`}
          >
            <div
              className={`flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {section.options.map((option) => (
                <button
                  key={option.value}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    option.active
                      ? "bg-[#0A3B9E] text-white border-[#0A3B9E]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#0A3B9E] hover:text-[#0A3B9E]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
