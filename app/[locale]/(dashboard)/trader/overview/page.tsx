"use client";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";

export default function TraderDashboardPage() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  // Statistical data (we used translation keys)
  const stats = [
    {
      label: t("dashboard.plates_owned"),
      value: "18",
      sub: t("dashboard.active_inventory"),
    },
    {
      label: t("dashboard.invested"),
      value: "AED 41,200,000",
      sub: t("dashboard.total_cost_basis"),
    },
    {
      label: t("dashboard.unrealised_value"),
      value: "AED 56,800,000",
      sub: "+AED 15,600,000",
    },
    {
      label: t("dashboard.avg_hold_period"),
      value: "8.4 months",
      sub: t("dashboard.across_active"),
    },
  ];

  // Active Lists Data
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
      isBlurred: true,
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

  // CRM data
  const clients = [
    {
      name: "Hamdan A.",
      deals: "4 deals · last Mar 2026",
      amount: "AED 8,400,000",
      tag: "VIP",
    },
    {
      name: "Reem S.",
      deals: "12 deals · last Jun 2026",
      amount: "AED 22,100,000",
      tag: "TRADER",
    },
    {
      name: "Khalid M.",
      deals: "2 deals · last Jan 2026",
      amount: "AED 1,450,000",
      tag: "COLLECTOR",
    },
    {
      name: "Yousef R.",
      deals: "7 deals · last May 2026",
      amount: "AED 14,200,000",
      tag: "VIP",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ========== Page Header ========== */}
        <div
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-200 pb-6 ${isRTL ? "flex-row-reverse sm:flex-row-reverse" : ""}`}
        >
          <div
            className={`flex flex-col ${isRTL ? "items-end text-right" : "items-start text-left"}`}
          >
            <div className="text-[10px] font-bold text-[#0A3B9E] uppercase tracking-wider mb-1">
              {t("dashboard.trader_workspace")}
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#041443]">
              Al Marwan Plates
            </h1>
            <div
              className={`text-sm text-gray-500 mt-1 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <span>32 {t("dashboard.deals_closed")}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="flex items-center gap-1">
                <span className="text-[#D4AF37]">★</span> 4.9
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>{t("dashboard.verified_id")}</span>
            </div>
          </div>
          <div
            className={`flex gap-3 w-full sm:w-auto ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Button
              variant="outline"
              size="md"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto justify-center"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {t("dashboard.export_pl")}
            </Button>

            <Link href={`/${locale}/listings/create`}>
              <Button
                variant="primary"
                size="md"
                fullWidth
                className="w-full sm:w-auto justify-center"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {t("dashboard.new_listing")}
              </Button>
            </Link>
          </div>
        </div>

        {/* ========== Content Network ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left and middle columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Statistics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {stat.label}
                  </div>
                  <div className="text-2xl font-bold text-[#041443] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#0A3B9E]">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* 2. Active Lists Table */}
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
                <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-xs font-medium hover:bg-gray-50 transition flex items-center gap-2">
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
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {listings.map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-wrap lg:flex-nowrap items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    {/* Small card for the board */}
                    <div className="bg-[#F3F4F8] border border-gray-200 rounded-lg py-2 px-4 min-w-30 flex items-center justify-center gap-2">
                      <div className="text-center">
                        <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                          {item.emirate}
                        </div>
                        <div
                          className={`flex items-center gap-1.5 text-lg font-serif font-bold text-[#0A3B9E] leading-none ${item.isBlurred ? "blur-[3px] opacity-60" : ""}`}
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

                    {/* Title and Status */}
                    <div className="grow min-w-37.5">
                      <div className="font-medium text-sm text-[#041443]">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-400">{item.status}</div>
                    </div>

                    {/* Price and Margin */}
                    <div
                      className={`min-w-25 ${isRTL ? "text-left" : "text-right"}`}
                    >
                      <div className="text-[10px] text-gray-500 font-medium">
                        {t("dashboard.listed")}
                      </div>
                      <div className="font-bold text-sm text-[#041443]">
                        AED {item.price}
                      </div>
                    </div>

                    <div
                      className={`min-w-20 ${isRTL ? "text-left" : "text-right"}`}
                    >
                      <div className="text-[10px] text-gray-500 font-medium">
                        {t("dashboard.margin")}
                      </div>
                      <div className="font-semibold text-sm text-green-600">
                        {item.margin} ↗
                      </div>
                    </div>

                    <button className="bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs font-medium hover:bg-gray-50 transition whitespace-nowrap">
                      {t("dashboard.manage")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-1 space-y-6">
            {/* 3. Realized P&L Card */}
            <div className="bg-[#041443] text-white rounded-xl p-6 shadow-lg border border-blue-900/50">
              <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {t("dashboard.realised_pl")}
              </div>
              <div className="text-4xl font-bold mb-1">AED 7,320,000</div>
              <div className="text-xs text-gray-400 mb-6">
                {t("dashboard.net_fees")}
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                <div>
                  <div className="text-lg font-bold">14</div>
                  <div className="text-[10px] text-gray-400 uppercase">
                    {t("dashboard.sold")}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold">63%</div>
                  <div className="text-[10px] text-gray-400 uppercase">
                    {t("dashboard.win_rate")}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold">8.4m</div>
                  <div className="text-[10px] text-gray-400 uppercase">
                    {t("dashboard.avg_hold")}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. CRM card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div
                className={`flex justify-between items-center mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div className="flex items-center gap-2 font-medium text-[#041443]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {t("dashboard.crm")}
                </div>
                <button className="text-xs text-[#0A3B9E] hover:underline">
                  {t("dashboard.export")}
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {clients.map((client, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`${isRTL ? "text-right" : "text-left"}`}>
                      <div className="text-sm font-medium text-[#041443]">
                        {client.name}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {client.deals}
                      </div>
                    </div>
                    <div className={`${isRTL ? "text-left" : "text-right"}`}>
                      <div className="text-sm font-bold text-[#041443]">
                        {client.amount}
                      </div>
                      <div className="text-[8px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        {client.tag}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Activity card*/}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 font-medium text-[#041443] mb-4">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                {t("dashboard.activity")}
              </div>
              <ul className="text-xs text-gray-500 space-y-3">
                <li className="flex items-center gap-2">
                  · Hamdan A. watchlisted{" "}
                  <span className="font-semibold text-[#041443]">
                    Dubai M · 7
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  · Bid placed on{" "}
                  <span className="font-semibold text-[#041443]">
                    Auction AUC-a1
                  </span>{" "}
                  by Bidder #2241
                </li>
                <li className="flex items-center gap-2">
                  · Invoice INV-0089 generated for{" "}
                  <span className="font-semibold text-[#041443]">
                    Sharjah 1 · 5
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  · Reveal fee paid on{" "}
                  <span className="font-semibold text-[#041443]">
                    Dubai AA · 999
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
