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
  const { t } = useLocale();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="text-xs uppercase text-[var(--color-muted-text)]">
            {t(stat.labelKey)}
          </div>
          <div className="mt-1 font-serif text-2xl font-semibold text-[var(--color-text-dark)]">
            {"amount" in stat && stat.amount != null ? (
              <DirhamAmount amount={stat.amount} weight="bold" />
            ) : (
              stat.value
            )}
          </div>
          <div className="mt-1 text-xs text-[var(--color-primary)]">
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
