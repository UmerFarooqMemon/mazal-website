"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { resetPassword } from "@/services/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ShieldCheck, X } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { getColor, branding } = useTheme();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});

  // Clear errors on change
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (fieldErrors.password)
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
  };

  const handleConfirmChange = (value: string) => {
    setConfirmPassword(value);
    if (fieldErrors.confirm)
      setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
  };

  // Validate fields
  const validateFields = () => {
    const errors: { password?: string; confirm?: string } = {};
    if (!password.trim()) {
      errors.password = t("common.error_field_required");
    } else if (password.length < 8) {
      errors.password = t("common.password_min_length");
    }
    if (!confirmPassword.trim()) {
      errors.confirm = t("common.error_field_required");
    } else if (password !== confirmPassword) {
      errors.confirm = t("common.passwords_dont_match");
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error(t("common.error_fill_fields"));
      return;
    }

    setLoading(true);
    try {
      const login = sessionStorage.getItem("reset_login") || "";
      const token = sessionStorage.getItem("reset_token") || "";
      if (!login || !token) {
        toast.error(t("common.session_expired"));
        router.push(`/${locale}/forgot-password`);
        return;
      }
      await resetPassword({
        login,
        token,
        password,
        password_confirmation: password,
      });
      sessionStorage.removeItem("reset_login");
      sessionStorage.removeItem("reset_token");
      toast.success(t("common.password_reset_success"));
      setTimeout(() => router.push(`/${locale}/password-updated`), 800);
    } catch (err: any) {
      toast.error(err.message || t("common.reset_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="w-full max-w-md mx-auto">
        <div
          className="rounded-3xl shadow-xl p-6 sm:p-8 border relative"
          style={{
            backgroundColor: getColor("surface"),
            borderColor: getColor("border"),
          }}
        >
          {/* Close / Back Button */}
          <Link
            href={`/${locale}/login`}
            className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} h-9 w-9 flex items-center justify-center rounded-lg transition-colors`}
            style={{ color: getColor("mutedText") }}
            aria-label={t("common.back") || "Back"}
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </Link>

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

          {/* Badge */}
          <div
            className={`flex items-center gap-2 text-xs font-semibold mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ color: getColor("primary") }}
          >
            <ShieldCheck size={16} />
            <span>{t("common.licensed_escrow")}</span>
          </div>

          {/* Title */}
          <h1
            className={`text-2xl sm:text-3xl font-serif font-bold mb-2 ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("primaryText") }}
          >
            {t("common.create_new_password")}
          </h1>
          <p
            className={`text-sm mb-8 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("common.reset_password_desc")}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              name="new_password"
              label={t("common.new_password")}
              type={showPassword ? "text" : "password"}
              placeholder={t("common.password_placeholder")}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              error={fieldErrors.password}
              required
            />
            <Input
              name="confirm_password"
              label={t("common.confirm_password")}
              type={showPassword ? "text" : "password"}
              placeholder={t("common.password_placeholder")}
              value={confirmPassword}
              onChange={(e) => handleConfirmChange(e.target.value)}
              error={fieldErrors.confirm}
              required
            />

            {/* Password Requirements */}
            <div
              className={`text-xs space-y-1 ${isRTL ? "text-right" : "text-left"}`}
              style={{ color: getColor("mutedText") }}
            >
              {[
                "pw_at_least_8",
                "pw_uppercase",
                "pw_lowercase",
                "pw_number",
                "pw_special",
              ].map((key) => (
                <p
                  key={key}
                  className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span>✓</span>
                  <span>{t(`common.${key}`)}</span>
                </p>
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? t("common.resetting") : t("common.reset_password_btn")}
            </Button>
          </form>

          {/* Footer */}
          <div
            className="mt-6 text-center text-sm"
            style={{ color: getColor("secondaryText") }}
          >
            {t("common.remember_password")}{" "}
            <Link
              href={`/${locale}/login`}
              className="font-medium hover:underline"
              style={{ color: getColor("primary") }}
            >
              {t("common.sign_in")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
