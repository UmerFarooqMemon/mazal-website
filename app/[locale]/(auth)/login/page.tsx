"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import AuthHero from "@/components/auth/AuthHero";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const isRTL = locale === "ar";
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    remember_me: false,
  });
  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    login?: string;
    password?: string;
  }>({});

  const { login, loading } = useAuth();

  // Validate fields before submission
  const validateFields = () => {
    const errors: { login?: string; password?: string } = {};
    if (!formData.login.trim()) {
      errors.login = t("common.error_field_required");
    }
    if (!formData.password.trim()) {
      errors.password = t("common.error_field_required");
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear field error when user types
  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields first
    if (!validateFields()) {
      toast.error(t("common.error_fill_fields"), {
        style: {
          background: "#FFF4E2",
          color: "#93651B",
          border: "1px solid #F5D78E",
        },
        icon: "",
      });
      return;
    }

    // Loading toast
    const loadingToast = toast.loading(
      t("common.signing_in") || "Signing in...",
      {
        style: {
          background: "#EEF2F8",
          color: "#0A3B9E",
        },
      },
    );

    try {
      await login({
        login: formData.login,
        password: formData.password,
      });
      toast.dismiss(loadingToast);
      toast.success(t("common.login_success"), {
        style: {
          background: "#E8FFE2",
          color: "#015C14",
          border: "1px solid #86D98F",
        },
        icon: "",
        duration: 2000,
      });
      setTimeout(() => router.push(`/${locale}/dashboard-certificates`), 800);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(t("common.invalid_credentials"), {
        style: {
          background: "#FFE8E8",
          color: "#8B0000",
          border: "1px solid #FFB3B3",
        },
        icon: "",
        duration: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-stretch gap-0 rounded-3xl overflow-hidden shadow-2xl">
        {/* Auth Hero Side - Hidden on Mobile, Shown on Desktop */}
        <div
          className={`w-full lg:w-1/2 ${isRTL ? "lg:order-2" : "lg:order-1"}`}
        >
          <AuthHero
            titleKey="auth.hero_title"
            subtitleKey="auth.hero_subtitle"
            showTrustBadge={true}
            className="rounded-none h-full"
          />
        </div>

        {/* Form Side */}
        <div
          className={`w-full lg:w-1/2 flex items-center justify-center bg-white p-6 sm:p-8 lg:p-12 ${isRTL ? "lg:order-1" : "lg:order-2"}`}
        >
          <div className="w-full max-w-md">
            {/* Logo - Only visible on Mobile */}
            <div className="flex justify-center mb-6 lg:hidden">
              <Image
                src="/auth/auth-logo.png"
                alt="Mazal Logo"
                width={130}
                height={45}
                className="h-auto"
              />
            </div>

            {/* Card Header */}
            <div
              className={`flex items-center justify-between mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex items-center gap-2 text-[#0A3B9E] text-xs font-semibold ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Icons.Shield size={14} />
                <span>{t("common.secure_access")}</span>
              </div>
              <div
                className={`flex rounded-full border border-gray-200 p-0.5 text-xs font-medium ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <span className="px-4 py-1 bg-[#0A3B9E] text-white rounded-full">
                  {t("common.sign_in")}
                </span>
                <Link
                  href={`/${locale}/register`}
                  className="px-4 py-1 text-gray-500 hover:text-[#0A3B9E] transition"
                >
                  {t("common.register")}
                </Link>
              </div>
            </div>

            {/* Title */}
            <h2
              className={`text-3xl font-serif font-bold text-[#041443] mb-2 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("common.welcome_back")}
            </h2>
            <p
              className={`text-gray-500 text-sm mb-8 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("common.sign_in_subtitle")}
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Input */}
              <Input
                name="login"
                label={t("common.email_or_mobile")}
                icon={<Icons.Email />}
                type="text"
                placeholder={t("common.email_placeholder")}
                value={formData.login}
                onChange={(e) => handleFieldChange("login", e.target.value)}
                autoComplete="email"
                error={fieldErrors.login}
              />

              {/* Password Input */}
              <Input
                name="password"
                label={t("common.password")}
                icon={<Icons.Lock />}
                type={showPassword ? "text" : "password"}
                placeholder={t("common.password_placeholder")}
                className="tracking-widest"
                value={formData.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                autoComplete="current-password"
                error={fieldErrors.password}
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

              {/* Remember & Forgot */}
              <div
                className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <label
                  className={`flex items-center gap-2 cursor-pointer ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <input
                    name="remember_me"
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#0A3B9E] focus:ring-[#0A3B9E]"
                    checked={formData.remember_me}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        remember_me: e.target.checked,
                      })
                    }
                  />
                  <span className="text-xs text-gray-500">
                    {t("common.keep_me_signed_in")}
                  </span>
                </label>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-xs text-[#0A3B9E] hover:underline"
                >
                  {t("common.forgot_password")}
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={<Icons.ArrowRight />}
                disabled={loading}
              >
                {loading ? t("common.loading") : t("common.sign_in")}
              </Button>
            </form>

            {/* Divider */}
            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs text-gray-400 uppercase tracking-wider">
                <span className="bg-white px-4">
                  {t("common.or_continue_with")}
                </span>
              </div>
            </div>

            <div className="space-y-3">
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
              <Button
                variant="outline"
                fullWidth
                leftIcon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                }
              >
                {t("common.continue_with_google")}
              </Button>
            </div> */}

            <div className="mt-6 text-center text-sm text-gray-500 flex flex-col gap-1">
              <div>
                {t("common.new_to_mazal")}{" "}
                <Link
                  href={`/${locale}/register`}
                  className="text-[#0A3B9E] font-medium hover:underline"
                >
                  {t("common.create_account")}
                </Link>
              </div>
              {/* <div>
                {t("common.need_help")}{" "}
                <Link
                  href={`/${locale}/contact`}
                  className="text-[#0A3B9E] font-medium hover:underline"
                >
                  {t("common.contact_support")}
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
