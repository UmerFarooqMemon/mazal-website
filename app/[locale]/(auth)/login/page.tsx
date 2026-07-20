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
import { requestGoogleIdToken } from "@/lib/google-auth";

export default function LoginPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const router = useRouter();
  const isRTL = locale === "ar";
  const { getColor, branding, loading: themeLoading } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    remember_me: false,
  });
  const [fieldErrors, setFieldErrors] = useState<{
    login?: string;
    password?: string;
  }>({});

  const { login, loginWithGoogle, loading, isAuthenticated } = useAuth();

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

  const handleGoogleSignIn = async () => {
    if (googleLoading || loading) return;

    setGoogleLoading(true);
    const loadingToast = toast.loading(t("common.signing_in_google"));

    try {
      // Step 1: Google Identity Services → id_token
      const idToken = await requestGoogleIdToken();
      // Step 2: POST /api/v1/auth/google → Mazal JWT
      await loginWithGoogle(idToken);
      toast.dismiss(loadingToast);
      toast.success(t("common.login_success"));
      setTimeout(() => router.push(`/${locale}/dashboard-certificates`), 800);
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      const message =
        err instanceof Error && err.message
          ? err.message
          : t("common.google_signin_failed");
      toast.error(message);
    } finally {
      setGoogleLoading(false);
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

            <div className="mt-6 flex items-center gap-3">
              <div
                className="h-px flex-1"
                style={{ backgroundColor: getColor("border") }}
              />
              <span
                className="shrink-0 text-[11px] font-medium uppercase tracking-wider"
                style={{ color: getColor("mutedText") }}
              >
                {t("common.or_continue_with")}
              </span>
              <div
                className="h-px flex-1"
                style={{ backgroundColor: getColor("border") }}
              />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-full border bg-white px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderColor: getColor("border"),
                color: getColor("primaryText"),
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
                  fill="#EA4335"
                />
              </svg>
              {googleLoading
                ? t("common.loading")
                : t("common.continue_with_google")}
            </button>

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