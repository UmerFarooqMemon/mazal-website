"use client";

import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";

const PARTNERS = [
  { src: "/home-v2/partner-1.png", alt: "Partner 1" },
  { src: "/home-v2/partner-2.png", alt: "Partner 2" },
  { src: "/home-v2/partner-3.png", alt: "Partner 3" },
];

export default function HomeV2Partners() {
  const { t } = useLocale();
  const logos = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section className="overflow-hidden bg-white py-16 lg:py-20">
      <h2 className="mb-12 text-center font-serif text-3xl tracking-tight text-[#081123] sm:text-4xl">
        {t("home.v2_partners")}
      </h2>
      <div className="relative">
        <div className="home-v2-marquee flex items-center gap-16 whitespace-nowrap px-8">
          {logos.map((partner, index) => (
            <div
              key={`${partner.src}-${index}`}
              className="relative h-16 w-40 shrink-0 grayscale opacity-70 sm:h-20 sm:w-48"
            >
              <Image
                src={partner.src}
                alt={partner.alt}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
