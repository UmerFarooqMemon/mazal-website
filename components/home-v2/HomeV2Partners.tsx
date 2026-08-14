"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { fetchPartnersClient, type Partner } from "@/services/partners";

function PartnerLogo({
  partner,
  className,
}: {
  partner: Partner;
  className?: string;
}) {
  const image = (
    <div
      className={`relative h-20 w-44 shrink-0 overflow-visible sm:h-24 sm:w-52 ${className ?? ""}`}
    >
      <Image
        src={partner.logo_url}
        alt={partner.name}
        fill
        unoptimized
        className="object-contain grayscale opacity-70"
      />
    </div>
  );

  if (!partner.website_url) return image;

  return (
    <a
      href={partner.website_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0"
      aria-label={partner.name}
    >
      {image}
    </a>
  );
}

export default function HomeV2Partners() {
  const { t } = useLocale();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchPartnersClient()
      .then((list) => {
        if (active) setPartners(list);
      })
      .catch(() => {
        if (active) setPartners([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading || partners.length === 0) return null;

  const logos = [...partners, ...partners, ...partners];

  return (
    <section className="overflow-hidden bg-[var(--color-surface)] py-16 lg:py-20">
      <h2 className="mb-12 text-center font-serif text-3xl tracking-tight text-[var(--color-text-dark)] sm:text-4xl">
        {t("home.v2_partners")}
      </h2>
      <div className="relative">
        <div className="home-v2-marquee flex items-center gap-16 whitespace-nowrap px-8">
          {logos.map((partner, index) => (
            <PartnerLogo
              key={`${partner.id}-${index}`}
              partner={partner}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
