"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import AuthHero from "@/components/auth/AuthHero";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck } from "lucide-react";

const Icons = {
  User: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Phone: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  Email: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Lock: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Eye: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  ArrowRight: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
};

export default function RegisterPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const isRTL = locale === "ar";
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    mobile: "",
    email: "",
    emirates_id: "",
    password: "",
    agree_terms: false,
  });

  const { register, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agree_terms) {
      alert(t("common.agree_terms_error") || "Please agree to the terms");
      return;
    }

    if (!formData.full_name) {
      alert(t("common.name_required") || "Name is required");
      return;
    }

    if (!formData.email && !formData.mobile) {
      alert(
        t("common.email_or_mobile_required") || "Email or mobile is required",
      );
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      alert(
        t("common.password_min_length") ||
          "Password must be at least 8 characters",
      );
      return;
    }

    try {
      await register({
        name: formData.full_name,
        login: formData.email || formData.mobile,
        password: formData.password,
        password_confirmation: formData.password,
      });

      router.push(`/${locale}`);
    } catch (err: any) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-stretch gap-0 rounded-3xl overflow-hidden shadow-2xl">
        {/* Auth Hero Side - Hidden on Mobile */}
        <div
          className={`w-full lg:w-1/2 hidden lg:flex ${isRTL ? "lg:order-2" : "lg:order-1"}`}
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
                <ShieldCheck size={16} />
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

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="full_name"
                  label={t("common.full_name")}
                  icon={<Icons.User />}
                  type="text"
                  placeholder={t("common.full_name_placeholder")}
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  autoComplete="name"
                />
                <Input
                  name="mobile"
                  label={t("common.mobile_number")}
                  icon={<Icons.Phone />}
                  type="tel"
                  placeholder={t("common.mobile_placeholder")}
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  autoComplete="tel"
                />
              </div>

              <Input
                name="email"
                label={t("common.email_address")}
                icon={<Icons.Email />}
                type="email"
                placeholder={t("common.email_placeholder")}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                autoComplete="email"
              />

              <Input
                name="emirates_id"
                label={t("common.emirates_id")}
                icon={<Icons.Lock />}
                type="text"
                placeholder={t("common.id_placeholder")}
                value={formData.emirates_id}
                onChange={(e) =>
                  setFormData({ ...formData, emirates_id: e.target.value })
                }
                hint={t("common.id_skip_note")}
              />

              <Input
                name="password"
                label={t("common.password")}
                icon={<Icons.Lock />}
                type={showPassword ? "text" : "password"}
                placeholder={t("common.password_placeholder")}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                autoComplete="new-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <Icons.Eye /> : <Icons.EyeOff />}
                  </button>
                }
              />

              {/* Terms Agreement - Exact Positioning from Image */}
              <div
                className={`flex items-start gap-2 pt-1 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <input
                  name="agree_terms"
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#0A3B9E] focus:ring-[#0A3B9E]"
                  checked={formData.agree_terms}
                  onChange={(e) =>
                    setFormData({ ...formData, agree_terms: e.target.checked })
                  }
                />
                <label
                  className={`flex flex-wrap items-center gap-1 text-[11px] text-gray-500 leading-relaxed cursor-pointer ${isRTL ? "text-right" : "text-left"}`}
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
                disabled={loading}
              >
                {loading
                  ? t("common.loading") || "Creating account..."
                  : t("common.create_account_btn")}
              </Button>
            </form>

            {/* Footer Link */}
            <div
              className={`mt-6 text-sm text-gray-500 ${isRTL ? "lg:text-right" : "lg:text-left"} text-center`}
            >
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
