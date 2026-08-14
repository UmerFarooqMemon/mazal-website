"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

export default function HomeV2CTA() {
  const { locale, t } = useLocale();

  return (
    <section className="bg-[var(--color-background)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-20 text-center lg:px-8 lg:py-24">
        <h2 className="max-w-4xl bg-linear-to-r from-[var(--color-btn-primary)] to-[var(--color-btn-primary-hover)] bg-clip-text font-serif text-4xl tracking-tight text-transparent capitalize sm:text-5xl">
          {t("home.cta_title")}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-6 text-[var(--color-muted-text)]">
          {t("home.cta_subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}/listings/create`}
            className="rounded-full bg-linear-to-r from-[var(--color-btn-primary)] to-[var(--color-btn-primary-hover)] px-7 py-3 text-sm font-medium text-[var(--color-text-light)] shadow-[0_30px_60px_-25px_rgba(1,15,81,0.35)] transition-opacity hover:opacity-90"
          >
            {t("home.cta_list")}
          </Link>
          <Link
            href={`/${locale}/trader/overview`}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-7 py-3 text-sm font-medium text-[var(--color-text-dark)] transition-colors hover:bg-[var(--color-surface)]"
          >
            {t("home.cta_dashboard")}
          </Link>
        </div>
      </div>
    </section>
  );
}
