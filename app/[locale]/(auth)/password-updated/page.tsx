"use client";
import { useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import Button from "@/components/ui/Button";
import AuthSkeleton from "@/components/skeletons/auth/AuthSkeleton";
import SiteLogo from "@/components/layout/SiteLogo";

export default function PasswordUpdatedPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const { getColor, loading: themeLoading } = useTheme();

  // Show success toast on page load
  useEffect(() => {
    toast.success(t("common.password_updated_title"));
  }, [t]);

  if (themeLoading || localeLoading)
    return <AuthSkeleton locale={locale} type="password-updated" />;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="w-full max-w-md mx-auto">
        <div
          className="rounded-4xl shadow-xl border p-8 sm:p-10 text-center"
          style={{
            backgroundColor: getColor("surface"),
            borderColor: getColor("border"),
          }}
        >
          {/* Logo from site-settings API */}
          <div className="flex justify-center mb-8 pt-4">
            <SiteLogo variant="auth" />
          </div>

          {/* Celebration Emoji */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
              <span className="text-5xl sm:text-6xl">🎉</span>
            </div>
          </div>

          {/* Title */}
          <h1
            className="text-2xl sm:text-3xl font-serif font-bold mb-3"
            style={{ color: getColor("primaryText") }}
          >
            {t("common.password_updated_title")}
          </h1>
          <p
            className="text-sm sm:text-[15px] mb-8 leading-relaxed px-2"
            style={{ color: getColor("secondaryText") }}
          >
            {t("common.password_updated_desc")}
          </p>

          {/* CTA Button */}
          <Link href={`/${locale}/login`} className="block">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="rounded-full text-base"
            >
              {t("common.continue_to_sign_in")}
            </Button>
          </Link>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              href=""
              className="text-sm transition-colors"
              style={{ color: getColor("mutedText") }}
            >
              {t("common.back_to_home")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
