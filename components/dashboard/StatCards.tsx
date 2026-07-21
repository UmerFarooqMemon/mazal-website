"use client";
import { useLocale } from "@/context/LocaleContext";
import { DirhamAmount } from "@/components/ui";

const stats = [
  {
    labelKey: "dashboard.plates_owned",
    value: "18",
    subKey: "dashboard.active_inventory",
  },
  {
    labelKey: "dashboard.invested",
    amount: 41_200_000,
    subKey: "dashboard.total_cost_basis",
  },
  {
    labelKey: "dashboard.unrealised_value",
    amount: 56_800_000,
    subAmount: 15_600_000,
  },
  {
    labelKey: "dashboard.avg_hold_period",
    value: "8.4 months",
    subKey: "dashboard.across_active",
  },
];

export default function StatCards() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
        >
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            {t(stat.labelKey)}
          </div>
          <div className="text-2xl font-bold text-[#041443] mb-1">
            {"amount" in stat && stat.amount != null ? (
              <DirhamAmount amount={stat.amount} weight="bold" />
            ) : (
              stat.value
            )}
          </div>
          <div className="text-xs text-[#0A3B9E]">
            {"subAmount" in stat && stat.subAmount != null ? (
              <>
                +<DirhamAmount amount={stat.subAmount} />
              </>
            ) : (
              t(stat.subKey!)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
