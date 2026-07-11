"use client";

import { HTMLAttributes, forwardRef } from "react";
import { useLocale } from "@/context/LocaleContext";
import { ShieldCheck } from "lucide-react";

interface AuthHeroProps extends HTMLAttributes<HTMLDivElement> {
  titleKey?: string;
  subtitleKey?: string;
  showTrustBadge?: boolean;
}

const AuthHero = forwardRef<HTMLDivElement, AuthHeroProps>(
  (
    {
      titleKey = "auth.register_hero_title",
      subtitleKey = "auth.register_hero_subtitle",
      showTrustBadge = true,
      className = "",
      ...props
    },
    ref,
  ) => {
    const { t, locale } = useLocale();

    return (
      <div
        ref={ref}
        dir={locale === "ar" ? "rtl" : "ltr"}
        className={`hidden lg:flex flex-col w-full bg-linear-to-br from-[#041443] via-[#0A3B9E] to-[#041443] p-8 lg:p-12 relative overflow-hidden h-full rounded-none ${className}`}
        {...props}
      >
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none"></div>

        {/* Glow Effect */}
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1">
          {/* Top: Badge & Title */}
          <div className="flex flex-col items-start shrink-0">
            {showTrustBadge && (
              <div className="inline-flex items-center gap-2 rounded-full bg-transparent border border-[#D4AF37]/30 px-4 py-1.5 text-[#D4AF37] text-[10px] font-medium mb-6 backdrop-blur-sm tracking-wider">
                <ShieldCheck size={14} className="text-[#D4AF37]" />
                <span className="uppercase">{t("auth.trust_badge")}</span>
              </div>
            )}

            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-white leading-[1.1] mb-5 text-start">
              {t(titleKey)}
            </h1>
            <p className="text-blue-100/80 text-sm lg:text-base font-light max-w-md leading-relaxed text-start">
              {t(subtitleKey)}
            </p>
          </div>

          {/* Center: Plate Image - Glassmorphism Effect */}
          <div className="flex-1 flex items-center justify-center min-h-0 py-6 lg:py-8">
            <div className="relative w-full max-w-xs lg:max-w-md mx-auto">
              <div className="relative w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/auth/auth-hero.png"
                  alt="Dubai U 609 Plate"
                  className="w-full h-auto object-contain block"
                />
              </div>
            </div>
          </div>

          {/* Bottom: Features List */}
          <div className="flex flex-col items-start gap-2 lg:gap-3 text-white/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 shrink-0 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[10px] text-[#D4AF37]">
                ✓
              </div>
              <span className="text-xs lg:text-sm text-start">
                {t("auth.feature_1")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 shrink-0 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[10px] text-[#D4AF37]">
                ✓
              </div>
              <span className="text-xs lg:text-sm text-start">
                {t("auth.feature_2")}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

AuthHero.displayName = "AuthHero";

export default AuthHero;
