"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { fetchPartnersClient, type Partner } from "@/services/partners";

function PartnerCard({ partner }: { partner: Partner }) {
  const image = (
    <div className="relative mx-auto h-28 w-full max-w-[260px] sm:h-32">
      <Image
        src={partner.logo_url}
        alt={partner.name}
        fill
        unoptimized
        className="object-contain"
      />
    </div>
  );

  if (!partner.website_url) {
    return (
      <div className="flex flex-col items-center gap-3">
        {image}
        <p className="text-center text-sm font-medium text-[var(--color-text-dark)]">
          {partner.name}
        </p>
      </div>
    );
  }

  return (
    <a
      href={partner.website_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-3 transition-opacity hover:opacity-80"
      aria-label={partner.name}
    >
      {image}
      <p className="text-center text-sm font-medium text-[var(--color-text-dark)]">
        {partner.name}
      </p>
    </a>
  );
}

export default function PartnersPage() {
  const { t } = useLocale();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    fetchPartnersClient()
      .then((list) => {
        if (!active) return;
        setPartners(list);
        setError(false);
      })
      .catch(() => {
        if (!active) return;
        setPartners([]);
        setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-[70vh] bg-[var(--color-background)]">
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl tracking-tight text-[var(--color-text-dark)] sm:text-5xl">
            {t("partners.title")}
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--color-muted-text)]">
            {t("partners.subtitle")}
          </p>
        </div>

        {loading ? (
          <p className="mt-16 text-[var(--color-muted-text)]">{t("partners.loading")}</p>
        ) : error ? (
          <p className="mt-16 text-[var(--color-muted-text)]">{t("partners.error")}</p>
        ) : partners.length === 0 ? (
          <p className="mt-16 text-[var(--color-muted-text)]">{t("partners.empty")}</p>
        ) : (
          <div className="mt-16 grid grid-cols-1 items-center gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
