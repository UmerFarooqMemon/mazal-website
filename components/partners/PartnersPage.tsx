"use client";

import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";

const PARTNERS = [
  {
    src: "/home-v2/partner-1.png",
    alt: "Shademont",
    // Square PNG has large white padding — enlarge so the mark matches others
    className: "h-36 max-w-[280px] sm:h-44 sm:max-w-[320px]",
    imageClassName: "object-contain scale-[1.55]",
  },
  {
    src: "/home-v2/partner-2.png",
    alt: "PIXL Global",
    className: "h-24 max-w-[220px]",
    imageClassName: "object-contain",
  },
  {
    src: "/home-v2/partner-3.png",
    alt: "Transguard Group",
    className: "h-24 max-w-[240px]",
    imageClassName: "object-contain",
  },
];

export default function PartnersPage() {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="min-h-[70vh] bg-[#f2faef]">
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className={`max-w-2xl ${isRTL ? "mr-auto text-right" : "text-left"}`}>
          <h1 className="font-serif text-4xl tracking-tight text-[#081123] sm:text-5xl">
            {t("partners.title")}
          </h1>
          <p className="mt-4 text-base leading-7 text-[#545e6f]">
            {t("partners.subtitle")}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 items-center gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
          {PARTNERS.map((partner) => (
            <div
              key={partner.src}
              className={`relative mx-auto w-full overflow-visible ${partner.className}`}
            >
              <Image
                src={partner.src}
                alt={partner.alt}
                fill
                className={partner.imageClassName}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
