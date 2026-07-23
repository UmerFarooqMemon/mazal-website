"use client";

import Link from "next/link";
import HomeV2Icon from "@/components/home-v2/HomeV2Icon";
import { useLocale } from "@/context/LocaleContext";

export default function HomeV2Escrow() {
  const { locale, t } = useLocale();

  const steps = [
    {
      number: "01",
      title: t("home.escrow_step_1_title"),
      description: t("home.escrow_step_1_desc"),
    },
    {
      number: "02",
      title: t("home.escrow_step_2_title"),
      description: t("home.escrow_step_2_desc"),
    },
    {
      number: "03",
      title: t("home.escrow_step_3_title"),
      description: t("home.escrow_step_3_desc"),
    },
    {
      number: "04",
      title: t("home.escrow_step_4_title"),
      description: t("home.escrow_step_4_desc"),
    },
  ];

  return (
    <section className="bg-[#152e2b] text-[#fbfaf6]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <HomeV2Icon src="/home-v2/icon-gold-star.svg" size={14} />
            <span className="text-xs font-medium tracking-[0.6px] text-[#e0ae57] uppercase">
              {t("home.escrow_badge")}
            </span>
          </div>

          <h2 className="font-serif text-4xl leading-none tracking-tight sm:text-5xl">
            {t("home.escrow_title_1")}
            <br />
            {t("home.escrow_title_2")}
            <br />
            {t("home.escrow_title_3")}
          </h2>

          <p className="max-w-md pt-1 text-base leading-6 text-[rgba(251,250,246,0.75)]">
            {t("home.escrow_subtitle")}
          </p>

          <div className="pt-2">
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-2 rounded-full bg-[#e0ae57] px-6 py-3 text-sm font-medium text-[#2b1500] transition-opacity hover:opacity-90"
            >
              {t("home.escrow_button")}
              <HomeV2Icon src="/home-v2/icon-arrow-dark.svg" size={16} />
            </Link>
          </div>
        </div>

        <ol className="flex flex-col gap-5">
          {steps.map((step) => (
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
