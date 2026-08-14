"use client";

import { Share2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { DirhamAmount } from "@/components/ui";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";

const listings = [
  {
    id: 1,
    emirate: "DUBAI",
    plate_code: "M",
    plate_digits: "7",
    title: "Dubai · M 7",
    status: "Active · 3 edits this week",
    price: "12,500,000",
    margin: "+28%",
  },
  {
    id: 2,
    emirate: "ABU DHABI",
    plate_code: "1",
    plate_digits: "88",
    title: "Abu Dhabi · 1 88",
    status: "In escrow · 2 edits this week",
    price: "4,800,000",
    margin: "+28%",
  },
  {
    id: 3,
    emirate: "DUBAI",
    plate_code: "AA",
    plate_digits: "999",
    title: "Dubai · AA 999",
    status: "Pending reveal · 1 edits this week",
    price: "1,850,000",
    margin: "+28%",
    blur: true,
  },
  {
    id: 4,
    emirate: "SHARJAH",
    plate_code: "1",
    plate_digits: "5",
    title: "Sharjah · 1 5",
    status: "Active · 3 edits this week",
    price: "920,000",
    margin: "+28%",
  },
  {
    id: 5,
    emirate: "DUBAI",
    plate_code: "K",
    plate_digits: "55",
    title: "Dubai · K 55",
    status: "Active · 2 edits this week",
    price: "680,000",
    margin: "+28%",
  },
  {
    id: 6,
    emirate: "ABU DHABI",
    plate_code: "5",
    plate_digits: "777",
    title: "Abu Dhabi · 5 777",
    status: "Active · 1 edits this week",
    price: "540,000",
    margin: "+28%",
  },
];

export default function ActiveListings() {
  const { t } = useLocale();

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-start">
          <h2 className="font-serif text-2xl font-normal text-[var(--color-text-dark)]">
            {t("dashboard.active_listings")}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted-text)]">
            {t("dashboard.edit_reflected")}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 text-xs text-[var(--color-text-dark)] transition hover:bg-[var(--color-background)]"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
          {t("dashboard.share_all")}
        </button>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {listings.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-4 px-6 py-4 lg:flex-nowrap"
          >
            <div className="w-[120px] shrink-0 overflow-hidden">
              <NumberPlateDisplay
                plate_code={item.plate_code}
                plate_digits={item.plate_digits}
                emirate={item.emirate}
                crop="compact"
                hideCode={item.blur}
                wrapperClassName="w-[120px] overflow-hidden"
                width={120}
              />
            </div>

            <div className="min-w-[140px] flex-1 text-start">
              <div className="text-sm font-medium text-[var(--color-text-dark)]">
                {item.title}
              </div>
              <div className="mt-0.5 text-xs text-[var(--color-muted-text)]">{item.status}</div>
            </div>

            <div className="min-w-[100px] text-end">
              <div className="text-xs text-[var(--color-muted-text)]">
                {t("dashboard.listed")}
              </div>
              <div className="font-serif text-lg text-[var(--color-text-dark)]">
                <DirhamAmount
                  amount={Number(item.price.replace(/,/g, ""))}
                  weight="bold"
                />
              </div>
            </div>

            <div className="min-w-[72px] text-end">
              <div className="text-xs text-[var(--color-muted-text)]">
                {t("dashboard.margin")}
              </div>
              <div className="font-serif text-lg text-[var(--color-primary)]">
                {item.margin} ↗
              </div>
            </div>

            <button
              type="button"
              className="inline-flex h-[30px] shrink-0 items-center rounded-full border border-[var(--color-border)] px-3 text-xs text-[var(--color-text-dark)] transition hover:bg-[var(--color-background)]"
            >
              {t("dashboard.manage")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
