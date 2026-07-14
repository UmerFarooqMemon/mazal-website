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
import { useAuth } from "@/hooks/useAuth";
import {
  ShieldCheck,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import AuthSkeleton from "@/components/skeletons/auth/AuthSkeleton";

export default function RegisterPage() {
  const { t, locale, loading: localeLoading } = useLocale();
  const router = useRouter();
  const isRTL = locale === "ar";
  const { getColor, branding, loading: themeLoading } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    mobile: "",
    email: "",
    emirates_id: "",
    password: "",
    password_confirmation: "",
    agree_terms: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { register, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(`/${locale}/dashboard-certificates`);
    }
  }, [isAuthenticated, locale, router]);

  // Show skeleton while theme & locale are loading
  if (themeLoading || localeLoading) {
    return <AuthSkeleton locale={locale} type="register" />;
  }

  // Validate fields
  const validateFields = () => {
    const errors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      errors.full_name = t("common.name_required");
    }
    if (!formData.email.trim() && !formData.mobile.trim()) {
      errors.email = t("common.email_or_mobile_required");
      errors.mobile = t("common.email_or_mobile_required");
    }
    if (!formData.password.trim()) {
      errors.password = t("common.error_field_required");
    } else if (formData.password.length < 8) {
      errors.password = t("common.password_min_length");
    }
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = t("common.passwords_dont_match");
    }
    if (!formData.agree_terms) {
      errors.agree_terms = t("common.agree_terms_error");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear error on change
  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error(t("common.error_fill_fields"));
      return;
    }

    const loadingToast = toast.loading(t("common.creating_account"));

    try {
      await register({
        name: formData.full_name,
        login: formData.email || formData.mobile,
        password: formData.password,
        password_confirmation: formData.password,
      });
      toast.dismiss(loadingToast);
      toast.success(t("common.register_success"));
      setTimeout(() => router.push(`/${locale}/dashboard-certificates`), 800);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(t("common.register_failed"));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="w-full max-w-6xl">
        <div className="rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">
          {/* Form Side */}
          <div
            className={`flex items-center justify-center p-6 sm:p-8 lg:p-12 ${isRTL ? "lg:order-2" : "lg:order-1"}`}
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

              {/* Card Header */}
              <div
                className={`flex items-center justify-between mb-8 gap-3 ${isRTL ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`flex items-center gap-2 text-xs font-semibold ${isRTL ? "flex-row-reverse" : "flex-row"}`}
                  style={{ color: getColor("primary") }}
                >
                  <ShieldCheck size={16} />
                  <span>{t("common.create_account_header")}</span>
                </div>
                <div
                  className="text-xs"
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("common.already_have_account")}{" "}
                  <Link
                    href={`/${locale}/login`}
                    className="font-medium hover:underline"
                    style={{ color: getColor("primary") }}
                  >
                    {t("common.sign_in")}
                  </Link>
                </div>
              </div>

              <h2
                className={`text-3xl font-serif font-bold mb-2 ${isRTL ? "text-right" : "text-left"}`}
                style={{ color: getColor("primaryText") }}
              >
                {t("common.create_account_title")}
              </h2>
              <p
                className={`text-sm mb-6 ${isRTL ? "text-right" : "text-left"}`}
                style={{ color: getColor("secondaryText") }}
              >
                {t("common.create_account_subtitle")}
              </p>

              {/* Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="full_name"
                    label={t("common.full_name")}
                    icon={<User size={20} strokeWidth={1.5} />}
                    type="text"
                    placeholder={t("common.full_name_placeholder")}
                    value={formData.full_name}
                    onChange={(e) =>
                      handleFieldChange("full_name", e.target.value)
                    }
                    autoComplete="name"
                    error={fieldErrors.full_name}
                  />
                  <Input
                    name="mobile"
                    label={t("common.mobile_number")}
                    icon={<Phone size={20} strokeWidth={1.5} />}
                    type="tel"
                    placeholder={t("common.mobile_placeholder")}
                    value={formData.mobile}
                    onChange={(e) =>
                      handleFieldChange("mobile", e.target.value)
                    }
                    autoComplete="tel"
                    error={fieldErrors.mobile}
                  />
                </div>

                <Input
                  name="email"
                  label={t("common.email_address")}
                  icon={<Mail size={20} strokeWidth={1.5} />}
                  type="email"
                  placeholder={t("common.email_placeholder")}
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  autoComplete="email"
                  error={fieldErrors.email}
                />

                <Input
                  name="emirates_id"
                  label={t("common.emirates_id")}
                  icon={<Lock size={20} strokeWidth={1.5} />}
                  type="text"
                  placeholder={t("common.id_placeholder")}
                  value={formData.emirates_id}
                  onChange={(e) =>
                    handleFieldChange("emirates_id", e.target.value)
                  }
                  hint={t("common.id_skip_note")}
                />

                <Input
                  name="password"
                  label={t("common.password")}
                  icon={<Lock size={20} strokeWidth={1.5} />}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("common.password_placeholder")}
                  value={formData.password}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  autoComplete="new-password"
                  error={fieldErrors.password}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <Eye size={20} strokeWidth={1.5} />
                      ) : (
                        <EyeOff size={20} strokeWidth={1.5} />
                      )}
                    </button>
                  }
                />

                <Input
                  name="password_confirmation"
                  label={t("common.confirm_password")}
                  icon={<Lock size={20} strokeWidth={1.5} />}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("common.password_placeholder")}
                  value={formData.password_confirmation}
                  onChange={(e) =>
                    handleFieldChange("password_confirmation", e.target.value)
                  }
                  autoComplete="new-password"
                  error={fieldErrors.password_confirmation}
                />

                {/* Terms Agreement */}
                <div
                  className={`flex items-start gap-2 pt-1 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <input
                    name="agree_terms"
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded shrink-0"
                    style={{ accentColor: getColor("primary") }}
                    checked={formData.agree_terms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agree_terms: e.target.checked,
                      })
                    }
                  />
                  <label
                    className={`text-[11px] leading-relaxed cursor-pointer ${isRTL ? "text-right" : "text-left"}`}
                    style={{ color: getColor("secondaryText") }}
                  >
                    <span>{t("common.agree_terms_part1")}</span>
                    <Link
                      href=""
                      className="hover:underline whitespace-nowrap"
                      style={{ color: getColor("primary") }}
                    >
                      {t("common.terms_service")}
                    </Link>
                    <span>{t("common.agree_terms_part2")}</span>
                    <Link
                      href=""
                      className="hover:underline whitespace-nowrap"
                      style={{ color: getColor("primary") }}
                    >
                      {t("common.privacy_policy")}
                    </Link>
                    <span>{t("common.agree_terms_part3")}</span>
                  </label>
                </div>
                {/* Terms error */}
                {fieldErrors.agree_terms && (
                  <p
                    className={`text-[11px] -mt-3 ${isRTL ? "text-right" : "text-left"}`}
                    style={{ color: getColor("error") }}
                  >
                    {fieldErrors.agree_terms}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  rightIcon={<ArrowRight size={20} strokeWidth={1.5} />}
                  disabled={loading}
                >
                  {loading
                    ? t("common.loading")
                    : t("common.create_account_btn")}
                </Button>
              </form>

              {/* Footer Link */}
              <div
                className="mt-6 text-center text-sm"
                style={{ color: getColor("secondaryText") }}
              >
                {t("common.already_registered")}{" "}
                <Link
                  href={`/${locale}/login`}
                  className="font-medium hover:underline"
                  style={{ color: getColor("primary") }}
                >
                  {t("common.sign_in_instead")}
                </Link>
              </div>
            </div>
          </div>

          {/* Auth Hero - right for AR, left for EN */}
          <div className={`${isRTL ? "lg:order-1" : "lg:order-2"}`}>
            <AuthHero
              titleKey="auth.register_hero_title"
              subtitleKey="auth.register_hero_subtitle"
              showTrustBadge={true}
              className="rounded-none h-full min-h-75"
            />
          </div>
        </div>
      </div>
    </div>
  );
}