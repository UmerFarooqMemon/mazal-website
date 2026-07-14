"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import AuthHero from "@/components/auth/AuthHero";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";
import AuthSkeleton from "@/components/skeletons/auth/AuthSkeleton";

export default function LoginPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const router = useRouter();
  const isRTL = locale === "ar";
  const { getColor, branding, loading: themeLoading } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    remember_me: false,
  });
  const [fieldErrors, setFieldErrors] = useState<{
    login?: string;
    password?: string;
  }>({});

  const { login, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(`/${locale}/dashboard-certificates`);
    }
  }, [isAuthenticated, locale, router]);

  // Show skeleton while theme & locale are loading
  if (themeLoading || localeLoading) {
    return <AuthSkeleton locale={locale} type="login" />;
  }

  const validateFields = () => {
    const errors: { login?: string; password?: string } = {};
    if (!formData.login.trim()) errors.login = t("common.error_field_required");
    if (!formData.password.trim())
      errors.password = t("common.error_field_required");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error(t("common.error_fill_fields"));
      return;
    }

    const loadingToast = toast.loading(t("common.signing_in"));

    try {
      await login({ login: formData.login, password: formData.password });
      toast.dismiss(loadingToast);
      toast.success(t("common.login_success"));
      setTimeout(() => router.push(`/${locale}/dashboard-certificates`), 800);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(t("common.invalid_credentials"));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-stretch gap-0 rounded-3xl overflow-hidden shadow-2xl">
        {/* AuthHero - right for AR, left for EN */}
        <div
          className={`hidden lg:flex w-full lg:w-1/2 ${isRTL ? "lg:order-2" : "lg:order-1"}`}
        >
          <AuthHero
            titleKey="auth.hero_title"
            subtitleKey="auth.hero_subtitle"
            showTrustBadge={true}
            className="rounded-none h-full"
          />
        </div>

        {/* Form - left for AR, right for EN */}
          <div
            className={`w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 ${isRTL ? "lg:order-1" : "lg:order-2"}`}
            style={{ backgroundColor: getColor("surface") }}
            dir={isRTL ? "rtl" : "ltr"}
          >
          <div className="w-full max-w-md">
            {/* Logo - Only from API */}
            {branding.logoUrl && (
              <div className="flex justify-center mb-8 pt-4">
                <Image
                  src={branding.logoUrl}
                  alt="Mazal Logo"
                  width={140}
                  height={50}
                  className="h-auto"
                  unoptimized
                />
              </div>
            )}

            <div
              className={`flex items-center justify-between mb-8 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-semibold ${isRTL ? "flex-row-reverse" : ""}`}
                style={{ color: getColor("primary") }}
              >
                <Icons.Shield size={14} />
                <span>{t("common.secure_access")}</span>
              </div>
              <div
                className={`flex rounded-full border p-0.5 text-xs font-medium ${isRTL ? "flex-row-reverse" : ""}`}
                style={{ borderColor: getColor("border") }}
              >
                <span
                  className="px-4 py-1 text-white rounded-full"
                  style={{ backgroundColor: getColor("primary") }}
                >
                  {t("common.sign_in")}
                </span>
                <Link
                  href={`/${locale}/register`}
                  className="px-4 py-1 transition"
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("common.register")}
                </Link>
              </div>
            </div>

            <h2
              className={`text-3xl font-serif font-bold mb-2 ${isRTL ? "text-right" : "text-left"}`}
              style={{ color: getColor("primaryText") }}
            >
              {t("common.welcome_back")}
            </h2>
            <p
              className={`text-sm mb-8 ${isRTL ? "text-right" : "text-left"}`}
              style={{ color: getColor("secondaryText") }}
            >
              {t("common.sign_in_subtitle")}
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
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

              <div
                className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <label
                  className={`flex items-center gap-2 cursor-pointer ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <input
                    name="remember_me"
                    type="checkbox"
                    className="w-4 h-4 rounded"
                    style={{ accentColor: getColor("primary") }}
                    checked={formData.remember_me}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        remember_me: e.target.checked,
                      })
                    }
                  />
                  <span
                    className="text-xs"
                    style={{ color: getColor("secondaryText") }}
                  >
                    {t("common.keep_me_signed_in")}
                  </span>
                </label>
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-xs hover:underline"
                  style={{ color: getColor("primary") }}
                >
                  {t("common.forgot_password")}
                </Link>
              </div>

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

            <div className="mt-6 text-center text-sm">
              <span style={{ color: getColor("secondaryText") }}>
                {t("common.new_to_mazal")}{" "}
              </span>
              <Link
                href={`/${locale}/register`}
                className="font-medium hover:underline"
                style={{ color: getColor("primary") }}
              >
                {t("common.create_account")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}