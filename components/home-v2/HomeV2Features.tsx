"use client";

import HomeV2Icon from "@/components/home-v2/HomeV2Icon";

const FEATURES = [
  {
    icon: "/home-v2/icon-escrow.svg",
    title: "Escrow custody",
    description:
      "Plate transfers to Mazal before you pay. Funds release only after ownership.",
  },
  {
    icon: "/home-v2/icon-auctions.svg",
    title: "Live auctions",
    description:
      "Auto-extend timers, proxy bids, KYC-gated rooms. No sniping, no theatre.",
  },
  {
    icon: "/home-v2/icon-blind.svg",
    title: "Blind negotiation",
    description:
      "Identities stay hidden until terms are agreed. No bypassing the platform.",
  },
  {
    icon: "/home-v2/icon-onspot.svg",
    title: "On Spot",
    description: "An exclusive new service is coming soon. Stay Tuned!",
    upcoming: true,
  },
];

export default function HomeV2Features() {
  return (
    <section className="border-y border-[#d9dee6] bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:px-8 lg:py-14">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <HomeV2Icon src={feature.icon} size={24} />
              {feature.upcoming ? (
                <span className="rounded-full bg-[rgba(225,225,225,0.35)] px-2.5 py-1 text-[9px] tracking-[1px] text-[#545e6f] uppercase">
                  Upcoming Feature
                </span>
              ) : null}
            </div>
            <h3 className="pt-2 font-serif text-2xl tracking-tight text-[#081123]">
              {feature.title}
            </h3>
            <p className="text-sm leading-5 text-[#545e6f]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
