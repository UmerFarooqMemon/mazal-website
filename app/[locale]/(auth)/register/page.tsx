"use client";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import AuthHero from "@/components/auth/AuthHero";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";

export default function RegisterPage() {
  const { t, locale } = useLocale();
  const [accountType, setAccountType] = useState<"Individual" | "Trader">(
    "Individual",
  );
  const [showPassword, setShowPassword] = useState(false);
  const isRTL = locale === "ar";

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-stretch gap-0 rounded-3xl overflow-hidden shadow-2xl">
        {/* Auth Hero Side */}
        <div
          className={`w-full lg:w-1/2 ${isRTL ? "lg:order-2" : "lg:order-1"}`}
        >
          <AuthHero
            titleKey="auth.register_hero_title"
            subtitleKey="auth.register_hero_subtitle"
            showTrustBadge={true}
            className="rounded-none h-full"
          />
        </div>

        {/* Form Side */}
        <div
          className={`w-full lg:w-1/2 flex items-center justify-center bg-white p-6 sm:p-8 lg:p-12 ${isRTL ? "lg:order-1" : "lg:order-2"}`}
        >
          <div className="w-full max-w-md">
            {/* Card Header */}
            <div
              className={`flex items-center justify-between mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex items-center gap-2 text-[#0A3B9E] text-xs font-semibold ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Icons.Shield size={14} />
                <span>{t("common.create_account_header")}</span>
              </div>
              <div
                className={`text-xs text-gray-500 ${isRTL ? "text-left" : "text-right"}`}
              >
                {t("common.already_have_account")}{" "}
                <Link
                  href={`/${locale}/login`}
                  className="text-[#0A3B9E] font-medium hover:underline"
                >
                  {t("common.sign_in")}
                </Link>
              </div>
            </div>

            {/* Title */}
            <h2
              className={`text-3xl font-serif font-bold text-[#041443] mb-2 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("common.create_account_title")}
            </h2>
            <p
              className={`text-gray-500 text-sm mb-6 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("common.create_account_subtitle")}
            </p>

            {/* Account Type Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setAccountType("Individual")}
                className={`relative p-4 rounded-xl border transition-all ${
                  accountType === "Individual"
                    ? "border-[#0A3B9E] bg-[#0A3B9E]/5 ring-1 ring-[#0A3B9E]"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                } ${isRTL ? "text-right" : "text-left"}`}
              >
                <div
                  className={`flex items-center justify-between mb-1 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span className="font-semibold text-sm text-[#041443]">
                    {t("common.individual")}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      accountType === "Individual"
                        ? "border-[#041443] bg-white"
                        : "border-gray-300"
                    }`}
                  >
                    {accountType === "Individual" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#041443]"></div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  {t("common.individual_desc")}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAccountType("Trader")}
                className={`relative p-4 rounded-xl border transition-all ${
                  accountType === "Trader"
                    ? "border-[#0A3B9E] bg-[#0A3B9E]/5 ring-1 ring-[#0A3B9E]"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                } ${isRTL ? "text-right" : "text-left"}`}
              >
                <div
                  className={`flex items-center justify-between mb-1 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span className="font-semibold text-sm text-[#041443]">
                    {t("common.trader")}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      accountType === "Trader"
                        ? "border-[#041443] bg-white"
                        : "border-gray-300"
                    }`}
                  >
                    {accountType === "Trader" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#041443]"></div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  {t("common.trader_desc")}
                </p>
              </button>
            </div>

            {/* Form */}
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="full_name"
                  label={t("common.full_name")}
                  icon={<Icons.User />}
                  type="text"
                  placeholder={t("common.full_name_placeholder")}
                  autoComplete="name"
                />
                <Input
                  name="mobile"
                  label={t("common.mobile_number")}
                  icon={<Icons.Phone />}
                  type="tel"
                  placeholder={t("common.mobile_placeholder")}
                  autoComplete="tel"
                />
              </div>

              <Input
                name="email"
                label={t("common.email_address")}
                icon={<Icons.Email />}
                type="email"
                placeholder={t("common.email_placeholder")}
                autoComplete="email"
              />

              <Input
                name="emirates_id"
                label={t("common.emirates_id")}
                icon={<Icons.Lock />}
                type="text"
                placeholder={t("common.id_placeholder")}
                hint={t("common.id_skip_note")}
              />

              <Input
                name="password"
                label={t("common.password")}
                icon={<Icons.Lock />}
                type={showPassword ? "text" : "password"}
                placeholder={t("common.password_placeholder")}
                autoComplete="new-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <Icons.Eye size={16} />
                    ) : (
                      <Icons.EyeOff size={16} />
                    )}
                  </button>
                }
              />

              {/* Terms Agreement */}
              <div
                className={`flex items-start gap-2 pt-1 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <input
                  name="agree_terms"
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#0A3B9E] focus:ring-[#0A3B9E]"
                />
                <label
                  className={`flex flex-wrap items-center gap-1 text-[10px] text-gray-500 leading-relaxed cursor-pointer ${isRTL ? "text-right" : "text-left"}`}
                >
                  <span>{t("common.agree_terms_part1")}</span>
                  <Link
                    href={`/${locale}/terms`}
                    className="text-[#0A3B9E] hover:underline whitespace-nowrap"
                  >
                    {t("common.terms_service")}
                  </Link>
                  <span>{t("common.agree_terms_part2")}</span>
                  <Link
                    href={`/${locale}/privacy`}
                    className="text-[#0A3B9E] hover:underline whitespace-nowrap"
                  >
                    {t("common.privacy_policy")}
                  </Link>
                  <span>{t("common.agree_terms_part3")}</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={<Icons.ArrowRight />}
              >
                {t("common.create_account_btn")}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 uppercase tracking-wider">
                <span className="bg-white px-4">
                  {t("common.or_register_with")}
                </span>
              </div>
            </div>

            {/* UAE Pass */}
            <Button
              variant="outline"
              fullWidth
              leftIcon={
                <img
                  src="/auth/uae-password.png"
                  alt="UAE Pass"
                  className="w-5 h-5 object-contain"
                />
              }
            >
              {t("common.continue_with_uae_pass")}
            </Button>

            {/* Footer Link */}
            <div className="mt-6 text-center text-sm text-gray-500">
              {t("common.already_registered")}{" "}
              <Link
                href={`/${locale}/login`}
                className="text-[#0A3B9E] font-medium hover:underline"
              >
                {t("common.sign_in_instead")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
