"use client";

import Link from "next/link";
import HomeV2Icon from "@/components/home-v2/HomeV2Icon";
import { useLocale } from "@/context/LocaleContext";

const STEPS = [
  {
    number: "01",
    title: "Seller transfers plate to Mazal custody",
    description: "Ownership held by Mazal, listing flagged 'in custody'.",
  },
  {
    number: "02",
    title: "Buyer pays full amount into escrow",
    description: "Bank transfer, card or scheduled cash pickup.",
  },
  {
    number: "03",
    title: "Ownership transfers to buyer",
    description: "RTA handover orchestrated through the app.",
  },
  {
    number: "04",
    title: "Funds release to seller",
    description: "Auto-generated invoice itemising every fee.",
  },
];

export default function HomeV2Escrow() {
  const { locale } = useLocale();

  return (
    <section className="bg-[#152e2b] text-[#fbfaf6]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <HomeV2Icon src="/home-v2/icon-gold-star.svg" size={14} />
            <span className="text-xs font-medium tracking-[0.6px] text-[#e0ae57] uppercase">
              Trust-first escrow
            </span>
          </div>

          <h2 className="font-serif text-4xl leading-none tracking-tight sm:text-5xl">
            Plate first.
            <br />
            Then payment.
            <br />
            Then release.
          </h2>

          <p className="max-w-md pt-1 text-base leading-6 text-[rgba(251,250,246,0.75)]">
            Mazal holds custody of the plate before the buyer transfers a fil.
            Ownership only moves after full payment is confirmed — and funds
            only release after ownership clears.
          </p>

          <div className="pt-2">
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-2 rounded-full bg-[#e0ae57] px-6 py-3 text-sm font-medium text-[#2b1500] transition-opacity hover:opacity-90"
            >
              See an example transaction
              <HomeV2Icon src="/home-v2/icon-arrow-dark.svg" size={16} />
            </Link>
          </div>
        </div>

        <ol className="flex flex-col gap-5">
          {STEPS.map((step) => (
            <li
              key={step.number}
              className="flex gap-5 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-[4px]"
            >
              <span className="font-serif text-2xl tracking-tight text-[#e0ae57]">
                {step.number}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-medium text-[#fbfaf6]">
                  {step.title}
                </h3>
                <p className="text-sm leading-5 text-[rgba(251,250,246,0.7)]">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
