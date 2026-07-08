"use client";
import { useLocale } from "@/context/LocaleContext";

const clients = [
  {
    name: "Hamdan A.",
    deals: "4 deals · last Mar 2026",
    amount: "AED 8,400,000",
    tagKey: "dashboard.vip",
  },
  {
    name: "Reem S.",
    deals: "12 deals · last Jun 2026",
    amount: "AED 22,100,000",
    tagKey: "dashboard.trader_tag",
  },
  {
    name: "Khalid M.",
    deals: "2 deals · last Jan 2026",
    amount: "AED 1,450,000",
    tagKey: "dashboard.collector",
  },
  {
    name: "Yousef R.",
    deals: "7 deals · last May 2026",
    amount: "AED 14,200,000",
    tagKey: "dashboard.vip",
  },
];

export default function RightSidebar() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="flex flex-col gap-6">
      {/* CRM Card */}
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
                <div className="text-[10px] text-gray-400">{client.deals}</div>
              </div>
              <div className={`${isRTL ? "text-left" : "text-right"}`}>
                <div className="text-sm font-bold text-[#041443]">
                  {client.amount}
                </div>
                <div className="text-[8px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                  {t(client.tagKey)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
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
            <span className="font-semibold text-[#041443]">Dubai M · 7</span>
          </li>
          <li className="flex items-center gap-2">
            · Bid placed on{" "}
            <span className="font-semibold text-[#041443]">Auction AUC-a1</span>{" "}
            by Bidder #2241
          </li>
          <li className="flex items-center gap-2">
            · Invoice INV-0089 generated for{" "}
            <span className="font-semibold text-[#041443]">Sharjah 1 · 5</span>
          </li>
          <li className="flex items-center gap-2">
            · Reveal fee paid on{" "}
            <span className="font-semibold text-[#041443]">Dubai AA · 999</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
