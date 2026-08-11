"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  Download,
  Plus,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button, DirhamAmount } from "@/components/ui";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { getMyListings } from "@/services/marketplace";
import type { MarketplaceListingPreview } from "@/services/marketplace";

type DashboardListing = {
  id: number;
  emirate: string;
  plate_code: string;
  plate_digits: string;
  code: string;
  title: string;
  status: string;
  price: string;
  margin: string;
  isBlurred?: boolean;
  preview?: MarketplaceListingPreview | null;
  plate_type?: string | null;
  plate_design?: string | null;
};

const FALLBACK_LISTINGS: DashboardListing[] = [
  {
    id: 1,
    emirate: "DUBAI",
    plate_code: "M",
    plate_digits: "7",
    code: "M | 7",
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
    code: "1 | 88",
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
    plate_code: "1",
    plate_digits: "5",
    code: "1 | 5",
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
    code: "K | 55",
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
    code: "5 | 777",
    title: "Abu Dhabi · 5 777",
    status: "Active · 1 edits this week",
    price: "540,000",
    margin: "+28%",
  },
];

export default function TraderDashboardPage() {
  const { t, locale } = useLocale();
  const [listings, setListings] = useState<DashboardListing[]>(FALLBACK_LISTINGS);

  useEffect(() => {
    let active = true;

    getMyListings(locale)
      .then((response) => {
        if (!active || !response.data.listings?.length) return;
        setListings(
          response.data.listings.map((listing) => ({
            id: listing.id,
            emirate: listing.emirate_label?.toUpperCase() || listing.emirate,
            plate_code: listing.plate_code || "",
            plate_digits: listing.plate_digits || "",
            code:
              listing.plate_code && listing.plate_digits
                ? `${listing.plate_code} | ${listing.plate_digits}`
                : listing.display_plate,
            title: listing.title,
            status: `${listing.status} · ${listing.view_count} views`,
            price: listing.asking_price.toLocaleString("en-AE"),
            margin: "+—",
            isBlurred: listing.code_hidden,
            preview: listing.preview,
            plate_type: listing.plate_type,
            plate_design: listing.plate_design,
          })),
        );
      })
      .catch(() => {
        // Keep fallback mock data
      });

    return () => {
      active = false;
    };
  }, [locale]);

  const stats = [
    {
      label: t("dashboard.plates_owned"),
      value: "18",
      sub: t("dashboard.active_inventory"),
    },
    {
      label: t("dashboard.invested"),
      amount: 41_200_000,
      sub: t("dashboard.total_cost_basis"),
    },
    {
      label: t("dashboard.unrealised_value"),
      amount: 56_800_000,
      subAmount: 15_600_000,
    },
    {
      label: t("dashboard.avg_hold_period"),
      value: "8.4 months",
      sub: t("dashboard.across_active"),
    },
  ];

  const clients = [
    {
      name: "Hamdan A.",
      deals: "4 deals · last Mar 2026",
      amount: 8_400_000,
      tag: t("dashboard.vip"),
    },
    {
      name: "Reem S.",
      deals: "12 deals · last Jun 2026",
      amount: 22_100_000,
      tag: t("dashboard.trader_tag"),
    },
    {
      name: "Khalid M.",
      deals: "2 deals · last Jan 2026",
      amount: 1_450_000,
      tag: t("dashboard.collector"),
    },
    {
      name: "Yousef R.",
      deals: "7 deals · last May 2026",
      amount: 14_200_000,
      tag: t("dashboard.vip"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      {/* Page header — Figma 497:9755 */}
      <section className="border-b border-[#d9dee6] bg-[#fbfaf7]">
        <div className="mx-auto flex min-h-[181px] max-w-[1280px] flex-col gap-6 px-6 py-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[294px] text-start">
            <p className="text-xs font-medium uppercase tracking-wide text-[#0a2f94]">
              {t("dashboard.trader_workspace")}
            </p>
            <h1 className="mt-2 font-serif text-[36px] font-normal leading-10 tracking-[-0.02em] text-[#081123]">
              Al Marwan Plates
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-5 text-[#545e6f]">
              <span>
                32 {t("dashboard.deals_closed")} · 4.9★ ·{" "}
                {t("dashboard.verified_id")}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="md"
              className="h-[38px] rounded-full border-[#d9dee6] bg-[#fbfaf7] px-4 text-sm font-normal text-[#081123] hover:bg-white"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              {t("dashboard.export_pl")}
            </Button>

            <Link href={`/${locale}/listings/create`}>
              <Button
                variant="primary"
                size="md"
                className="h-[38px] rounded-full px-5 text-sm font-medium"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                {t("dashboard.new_listing")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main content — Figma 497:9775 */}
      <div className="mx-auto max-w-[1280px] space-y-6 px-6 py-10">
        {/* Stat cards — Figma 497:9776 */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#d9dee6] bg-white p-5"
            >
              <div className="text-xs uppercase text-[#545e6f]">
                {stat.label}
              </div>
              <div className="mt-1 font-serif text-2xl font-semibold text-[#081123]">
                {"amount" in stat && stat.amount != null ? (
                  <DirhamAmount amount={stat.amount} weight="bold" />
                ) : (
                  stat.value
                )}
              </div>
              <div className="mt-1 text-xs text-[#0a2f94]">
                {"subAmount" in stat && stat.subAmount != null ? (
                  <>
                    +<DirhamAmount amount={stat.subAmount} />
                  </>
                ) : (
                  stat.sub
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_395px]">
          {/* Active listings — Figma 497:9806 */}
          <div className="rounded-2xl border border-[#d9dee6] bg-white">
            <div className="flex flex-col gap-4 border-b border-[#d9dee6] px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-start">
                <h2 className="font-serif text-2xl font-normal text-[#081123]">
                  {t("dashboard.active_listings")}
                </h2>
                <p className="mt-1 text-sm text-[#545e6f]">
                  {t("dashboard.edit_reflected")}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-[#d9dee6] px-3 text-xs text-[#081123] transition hover:bg-[#fbfaf7]"
              >
                <Share2 className="h-3.5 w-3.5" strokeWidth={2} />
                {t("dashboard.share_all")}
              </button>
            </div>

            <div className="divide-y divide-[#d9dee6]">
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
                      preview={item.preview}
                      plateType={item.plate_type || undefined}
                      plateDesign={item.plate_design || undefined}
                      crop="compact"
                      hideCode={item.isBlurred}
                      wrapperClassName="w-[120px] overflow-hidden"
                      width={120}
                    />
                  </div>

                  <div className="min-w-[140px] flex-1 text-start">
                    <div className="text-sm font-medium text-[#081123]">
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-xs text-[#545e6f]">
                      {item.status}
                    </div>
                  </div>

                  <div className="min-w-[100px] text-end">
                    <div className="text-xs text-[#545e6f]">
                      {t("dashboard.listed")}
                    </div>
                    <div className="font-serif text-lg text-[#081123]">
                      <DirhamAmount
                        amount={Number(item.price.replace(/,/g, ""))}
                        weight="bold"
                      />
                    </div>
                  </div>

                  <div className="min-w-[72px] text-end">
                    <div className="text-xs text-[#545e6f]">
                      {t("dashboard.margin")}
                    </div>
                    <div className="font-serif text-lg text-[#0a2f94]">
                      {item.margin} ↗
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-[30px] shrink-0 items-center rounded-full border border-[#d9dee6] px-3 text-xs text-[#081123] transition hover:bg-[#fbfaf7]"
                  >
                    {t("dashboard.manage")}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — Figma 497:9992 */}
          <div className="space-y-6">
            {/* Realised P&L — Figma 497:9993 */}
            <div className="rounded-2xl border border-[#d9dee6] bg-[#010f51] p-6 text-[#fbfaf6]">
              <div className="flex items-center gap-2 text-xs uppercase text-[#e0ae57]">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                {t("dashboard.realised_pl")}
              </div>
              <div className="mt-2 font-serif text-4xl font-semibold">
                <DirhamAmount amount={7_320_000} weight="bold" />
              </div>
              <p className="mt-1 text-sm text-[#fbfaf6]/90">
                {t("dashboard.net_fees")}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                <div>
                  <div className="font-serif text-base">14</div>
                  <div className="text-xs text-[#fbfaf6]/80">
                    {t("dashboard.sold")}
                  </div>
                </div>
                <div>
                  <div className="font-serif text-base">63%</div>
                  <div className="text-xs text-[#fbfaf6]/80">
                    {t("dashboard.win_rate")}
                  </div>
                </div>
                <div>
                  <div className="font-serif text-base">8.4m</div>
                  <div className="text-xs text-[#fbfaf6]/80">
                    {t("dashboard.avg_hold")}
                  </div>
                </div>
              </div>
            </div>

            {/* CRM — Figma 497:10021 */}
            <div className="rounded-2xl border border-[#d9dee6] bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-serif text-xl text-[#081123]">
                  <Users className="h-[18px] w-[18px]" strokeWidth={2} />
                  {t("dashboard.crm")}
                </div>
                <button
                  type="button"
                  className="text-xs text-[#0a2f94] hover:underline"
                >
                  {t("dashboard.export")}
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {clients.map((client, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border-b border-[#d9dee6] pb-3 last:border-0 last:pb-0"
                  >
                    <div className="text-start">
                      <div className="text-sm font-medium text-[#081123]">
                        {client.name}
                      </div>
                      <div className="text-xs text-[#545e6f]">
                        {client.deals}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="font-serif text-sm font-normal text-[#081123]">
                        <DirhamAmount amount={client.amount} weight="bold" />
                      </div>
                      <div className="mt-0.5 text-[10px] uppercase text-[#0a2f94]">
                        {client.tag}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity — Figma 497:10073 */}
            <div className="rounded-2xl border border-[#d9dee6] bg-white p-6">
              <div className="mb-4 flex items-center gap-2 font-serif text-xl text-[#081123]">
                <Activity className="h-[18px] w-[18px]" strokeWidth={2} />
                {t("dashboard.activity")}
              </div>
              <ul className="space-y-3 text-sm text-[#081123]">
                <li>
                  · Hamdan A. watchlisted{" "}
                  <span className="font-medium">Dubai M · 7</span>
                </li>
                <li>
                  · Bid placed on{" "}
                  <span className="font-medium">Auction AUC-a1</span> by Bidder
                  #2241
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
        </div>
      </div>
    </div>
  );
}
