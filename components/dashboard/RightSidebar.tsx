"use client";

import { Activity, Users } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { DirhamAmount } from "@/components/ui";

const clients = [
  {
    name: "Hamdan A.",
    deals: "4 deals · last Mar 2026",
    amount: 8_400_000,
    tagKey: "dashboard.vip",
  },
  {
    name: "Reem S.",
    deals: "12 deals · last Jun 2026",
    amount: 22_100_000,
    tagKey: "dashboard.trader_tag",
  },
  {
    name: "Khalid M.",
    deals: "2 deals · last Jan 2026",
    amount: 1_450_000,
    tagKey: "dashboard.collector",
  },
  {
    name: "Yousef R.",
    deals: "7 deals · last May 2026",
    amount: 14_200_000,
    tagKey: "dashboard.vip",
  },
];

export default function RightSidebar() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif text-xl text-[var(--color-text-dark)]">
            <Users className="h-[18px] w-[18px]" strokeWidth={2} />
            {t("dashboard.crm")}
          </div>
          <button
            type="button"
            className="text-xs text-[var(--color-primary)] hover:underline"
          >
            {t("dashboard.export")}
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {clients.map((client, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0"
            >
              <div className="text-start">
                <div className="text-sm font-medium text-[var(--color-text-dark)]">
                  {client.name}
                </div>
                <div className="text-xs text-[var(--color-muted-text)]">{client.deals}</div>
              </div>
              <div className="text-end">
                <div className="font-serif text-sm font-normal text-[var(--color-text-dark)]">
                  <DirhamAmount amount={client.amount} weight="bold" />
                </div>
                <div className="mt-0.5 text-[10px] uppercase text-[var(--color-primary)]">
                  {t(client.tagKey)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="mb-4 flex items-center gap-2 font-serif text-xl text-[var(--color-text-dark)]">
          <Activity className="h-[18px] w-[18px]" strokeWidth={2} />
          {t("dashboard.activity")}
        </div>
        <ul className="space-y-3 text-sm text-[var(--color-text-dark)]">
          <li>
            · Hamdan A. watchlisted{" "}
            <span className="font-medium">Dubai M · 7</span>
          </li>
          <li>
            · Bid placed on{" "}
            <span className="font-medium">Auction AUC-a1</span> by Bidder #2241
          </li>
          <li>
            · Invoice INV-0089 generated for{" "}
            <span className="font-medium">Sharjah 1 · 5</span>
          </li>
          <li>
            · Reveal fee paid on{" "}
            <span className="font-medium">Dubai AA · 999</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
