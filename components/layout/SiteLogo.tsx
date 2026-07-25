"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";

type SiteLogoVariant = "header" | "footer" | "auth";

interface SiteLogoProps {
  variant?: SiteLogoVariant;
  href?: string | false;
  className?: string;
}

const VARIANT_STYLES: Record<
  SiteLogoVariant,
  { width: number; height: number; className: string; preferSmall: boolean }
> = {
  header: {
    width: 140,
    height: 36,
    className: "h-8 sm:h-9 w-auto max-w-[140px] object-contain",
    preferSmall: true,
  },
  footer: {
    width: 160,
    height: 44,
    className: "h-10 w-auto max-w-[180px] object-contain",
    preferSmall: false,
  },
  auth: {
    width: 160,
    height: 48,
    className: "h-10 sm:h-12 w-auto max-w-[180px] object-contain",
    preferSmall: false,
  },
};

export default function SiteLogo({
  variant = "header",
  href,
  className = "",
}: SiteLogoProps) {
  const { branding, getColor, footerColors } = useTheme();
  const { locale } = useLocale();
  const styles = VARIANT_STYLES[variant];

  const logoSrc = styles.preferSmall
    ? branding.smallLogoUrl || branding.logoUrl
    : branding.logoUrl || branding.smallLogoUrl;

  const homeHref = href === false ? null : (href ?? `/${locale}`);

  const fallback = (
    <span
      className={
        variant === "footer"
          ? "text-[34px] font-bold tracking-[0.18em]"
          : "text-lg font-bold tracking-[0.18em]"
      }
      style={{
        color:
          variant === "footer" ? footerColors.heading : getColor("primaryText"),
      }}
    >
      MAZAL
    </span>
  );

  const content = logoSrc ? (
    <Image
      src={logoSrc}
      alt="Mazal"
      width={styles.width}
      height={styles.height}
      className={`${styles.className} ${className}`.trim()}
      priority={variant === "header"}
      unoptimized
    />
  ) : (
    fallback
  );

  if (!homeHref) return content;

  return (
    <Link href={homeHref} className="inline-flex items-center shrink-0 min-w-0">
      {content}
    </Link>
  );
}
