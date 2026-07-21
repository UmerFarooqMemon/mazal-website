"use client";
import { useLocale } from "@/context/LocaleContext";
import { Button, DirhamAmount } from "@/components/ui";

const listings = [
  {
    id: 1,
    emirate: "DUBAI",
    code: "M | 7",
    title: "Dubai · M 7",
    status: "Active · 3 edits this week",
    price: "12,500,000",
    margin: "+28%",
  },
  {
    id: 2,
    emirate: "ABU DHABI",
    code: "1 | 88",
    title: "Abu Dhabi · 1 88",
    status: "In escrow · 2 edits this week",
    price: "4,800,000",
    margin: "+28%",
  },
  {
    id: 3,
    emirate: "DUBAI",
    code: "AA | 999",
    title: "Dubai · AA 999",
    status: "Pending reveal · 1 edits this week",
    price: "1,850,000",
    margin: "+28%",
    blur: true,
  },
  {
    id: 4,
    emirate: "SHARJAH",
    code: "1 | 5",
    title: "Sharjah · 1 5",
    status: "Active · 3 edits this week",
    price: "920,000",
    margin: "+28%",
  },
  {
    id: 5,
    emirate: "DUBAI",
    code: "K | 55",
    title: "Dubai · K 55",
    status: "Active · 2 edits this week",
    price: "680,000",
    margin: "+28%",
  },
  {
    id: 6,
    emirate: "ABU DHABI",
    code: "5 | 777",
    title: "Abu Dhabi · 5 777",
    status: "Active · 1 edits this week",
    price: "540,000",
    margin: "+28%",
  },
];

export default function ActiveListings() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 ${isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""}`}
      >
        <div className={`${isRTL ? "text-right" : "text-left"}`}>
          <h3 className="text-xl font-serif font-bold text-[#041443]">
            {t("dashboard.active_listings")}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {t("dashboard.edit_reflected")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {t("dashboard.share_all")}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {listings.map((item) => (
          <div
            key={item.id}
            className={`flex flex-wrap lg:flex-nowrap items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {/* Small card for the board */}
            <div className="bg-[#F3F4F8] border border-gray-200 rounded-lg py-2 px-4 min-w-32.5 flex items-center justify-center gap-2">
              <div className="text-center">
                <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                  {item.emirate}
                </div>
                <div
                  className={`flex items-center gap-1.5 text-lg font-serif font-bold text-[#0A3B9E] leading-none ${item.blur ? "blur-[3px] opacity-60" : ""}`}
                >
                  {item.code.split("|").map((part, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {part.trim()}
                      {i === 0 && (
                        <span className="text-gray-300 font-light text-sm">
                          |
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`grow min-w-37.5 ${isRTL ? "text-right" : "text-left"}`}
            >
              <div className="font-medium text-sm text-[#041443]">
                {item.title}
              </div>
              <div className="text-xs text-gray-400">{item.status}</div>
            </div>

            <div className={`min-w-25 ${isRTL ? "text-left" : "text-right"}`}>
              <div className="text-[10px] text-gray-500 font-medium">
                {t("dashboard.listed")}
              </div>
              <div className="font-bold text-sm text-[#041443]">
                <DirhamAmount
                  amount={Number(item.price.replace(/,/g, ""))}
                  weight="bold"
                />
              </div>
            </div>

            <div className={`min-w-20 ${isRTL ? "text-left" : "text-right"}`}>
              <div className="text-[10px] text-gray-500 font-medium">
                {t("dashboard.margin")}
              </div>
              <div className="font-semibold text-sm text-green-600">
                {item.margin} ↗
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            >
              {t("dashboard.manage")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
