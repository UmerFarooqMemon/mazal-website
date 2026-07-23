"use client";

import HomeV2Icon from "@/components/home-v2/HomeV2Icon";
import { useLocale } from "@/context/LocaleContext";

export default function HomeV2Features() {
  const { t } = useLocale();

  const features = [
    {
      icon: "/home-v2/icon-escrow.svg",
      title: t("home.feature_1_title"),
      description: t("home.feature_1_desc"),
    },
    {
      icon: "/home-v2/icon-auctions.svg",
      title: t("home.feature_2_title"),
      description: t("home.feature_2_desc"),
    },
    {
      icon: "/home-v2/icon-blind.svg",
      title: t("home.feature_4_title"),
      description: t("home.feature_4_desc"),
    },
    {
      icon: "/home-v2/icon-onspot.svg",
      title: t("home.v2_feature_onspot_title"),
      description: t("home.v2_feature_onspot_desc"),
      upcoming: true,
    },
  ];

  return (
    <section className="border-y border-[#d9dee6] bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:px-8 lg:py-14">
        {features.map((feature) => (
          <div key={feature.title} className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <HomeV2Icon src={feature.icon} size={24} />
              {feature.upcoming ? (
                <span className="rounded-full bg-[rgba(225,225,225,0.35)] px-2.5 py-1 text-[9px] tracking-[1px] text-[#545e6f] uppercase">
                  {t("common.upcoming_feature")}
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
