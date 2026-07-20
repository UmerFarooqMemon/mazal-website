"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { siteConfig } from "@/config/site";

type FooterLink = {
  href: string;
  labelKey: string;
};

type FooterColumn = {
  titleKey: string;
  links: FooterLink[];
};

const FOOTER_ICONS = {
  instagram: { src: "/instagram.png", width: 13, height: 13 },
  x: { src: "/x.png", width: 13, height: 11 },
  linkedin: { src: "/Linkedin.png", width: 14, height: 14 },
  playstore: { src: "/playstore.png", width: 25, height: 25 },
  apple: { src: "/apple.png", width: 26, height: 25 },
} as const;

function FooterColumnBlock({
  title,
  links,
  isRTL,
}: {
  title: string;
  links: { href: string; label: string }[];
  isRTL: boolean;
}) {
  return (
    <div className={isRTL ? "text-right" : "text-left"}>
      <h4 className="mb-4 text-[15px] font-semibold leading-none text-white">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-sm leading-snug text-[#A3A3A3] transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { t, locale } = useLocale();
  const { branding, getColor } = useTheme();
  const isRTL = locale === "ar";

  const primaryColor =
    getColor("primary") !== "transparent" ? getColor("primary") : "#0A3B9E";

  const columns: FooterColumn[] = [
    {
      titleKey: "footer_ecosystem",
      links: [
        { href: `/${locale}/marketplace`, labelKey: "footer_buy" },
        { href: `/${locale}/listings/create`, labelKey: "footer_sell" },
        { href: `/${locale}/certificates/request`, labelKey: "footer_get_valuation" },
        { href: `/${locale}/spot-cash`, labelKey: "spot_cash" },
        { href: `/${locale}/about`, labelKey: "footer_how_it_works" },
      ],
    },
    {
      titleKey: "footer_discover",
      links: [
        { href: `/${locale}/about`, labelKey: "footer_about" },
        { href: `/${locale}/about`, labelKey: "footer_blog" },
        { href: `/${locale}/about`, labelKey: "footer_newsroom" },
      ],
    },
    {
      titleKey: "footer_support",
      links: [
        { href: `/${locale}/contact`, labelKey: "footer_help_center" },
        { href: `/${locale}/about`, labelKey: "footer_faq" },
        { href: `/${locale}/contact`, labelKey: "footer_contact_us" },
      ],
    },
    {
      titleKey: "footer_legal",
      links: [
        { href: `/${locale}/about`, labelKey: "compliance" },
        { href: `/${locale}/terms`, labelKey: "footer_terms" },
        { href: `/${locale}/privacy`, labelKey: "privacy_policy" },
        { href: `/${locale}/private-deal`, labelKey: "footer_escrow_policy" },
        { href: `/${locale}/kyc`, labelKey: "emirates_id_kyc" },
      ],
    },
  ];

  const socialLinks = [
    {
      href: siteConfig.links.instagram,
      label: "Instagram",
      icon: FOOTER_ICONS.instagram,
    },
    {
      href: siteConfig.links.twitter,
      label: "X",
      icon: FOOTER_ICONS.x,
    },
    {
      href: siteConfig.links.linkedin,
      label: "LinkedIn",
      icon: FOOTER_ICONS.linkedin,
    },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
        <div
          className={`grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-x-20 lg:gap-y-0 ${isRTL ? "lg:grid-flow-col-dense" : ""}`}
        >
          {/* Brand */}
          <div
            className={`flex flex-col ${isRTL ? "items-end text-right lg:col-start-2" : "items-start text-left"}`}
          >
            <Link
              href={`/${locale}`}
              className={`inline-flex items-center ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {branding.logoUrl ? (
                <Image
                  src={branding.logoUrl}
                  alt="Mazal"
                  width={140}
                  height={40}
                  className="h-10 w-auto object-contain brightness-0 invert"
                  unoptimized
                />
              ) : (
                <span className="text-[34px] font-bold tracking-[0.18em] text-white">
                  MAZAL
                </span>
              )}
            </Link>

            <p className="mt-5 max-w-[320px] text-sm leading-[1.6] text-[#A3A3A3]">
              {t("common.footer_desc")}
            </p>

            <div
              className={`mt-5 flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {socialLinks.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-85"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Image
                    src={icon.src}
                    alt=""
                    width={icon.width}
                    height={icon.height}
                    className="h-auto w-auto object-contain"
                    unoptimized
                  />
                </a>
              ))}
            </div>

            <div
              className={`mt-4 flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <a
                href="#"
                aria-label="Google Play"
                className="transition-opacity hover:opacity-85"
              >
                <Image
                  src={FOOTER_ICONS.playstore.src}
                  alt="Google Play"
                  width={FOOTER_ICONS.playstore.width}
                  height={FOOTER_ICONS.playstore.height}
                  className="h-[25px] w-[25px] object-contain"
                  unoptimized
                />
              </a>
              <a
                href="#"
                aria-label="App Store"
                className="transition-opacity hover:opacity-85"
              >
                <Image
                  src={FOOTER_ICONS.apple.src}
                  alt="App Store"
                  width={FOOTER_ICONS.apple.width}
                  height={FOOTER_ICONS.apple.height}
                  className="h-[25px] w-[26px] object-contain"
                  unoptimized
                />
              </a>
            </div>

            <p className="mt-10 text-xs leading-none text-[#737373]">
              {t("common.copyright")}
            </p>
          </div>

          {/* Link columns */}
          <div
            className={`grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-x-10 ${isRTL ? "lg:col-start-1" : ""}`}
          >
            {columns.map((column) => (
              <FooterColumnBlock
                key={column.titleKey}
                title={t(`common.${column.titleKey}`)}
                links={column.links.map((link) => ({
                  href: link.href,
                  label: t(`common.${link.labelKey}`),
                }))}
                isRTL={isRTL}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
