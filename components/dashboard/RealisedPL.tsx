"use client";
import { useLocale } from "@/context/LocaleContext";

export default function RealisedPL() {
  const { t } = useLocale();

  return (
    <div className="bg-[#041443] text-white rounded-xl p-6 shadow-lg border border-blue-900/50 mb-6">
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
  );
}
