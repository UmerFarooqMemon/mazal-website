"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { resetPassword } from "@/services/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ShieldCheck, X, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
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

    setLoading(true);
    try {
      const login = sessionStorage.getItem("reset_login") || "";
      const token = sessionStorage.getItem("reset_token") || "";
      if (!login || !token) {
        toast.error(t("common.session_expired"), {
          style: {
            background: "#FFE8E8",
            color: "#8B0000",
            border: "1px solid #FFB3B3",
          },
          icon: "",
        });
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
      toast.success(t("common.password_reset_success"), {
        style: {
          background: "#E8FFE2",
          color: "#015C14",
          border: "1px solid #86D98F",
        },
        icon: "",
        duration: 2000,
      });
      setTimeout(() => router.push(`/${locale}/password-updated`), 800);
    } catch (err: any) {
      toast.error(err.message || t("common.reset_failed"), {
        style: {
          background: "#FFE8E8",
          color: "#8B0000",
          border: "1px solid #FFB3B3",
        },
        icon: "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 relative">
          {/* Close / Back Button */}
          <Link
            href={`/${locale}/login`}
            className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600`}
            aria-label={t("common.back") || "Back"}
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </Link>

          {/* Logo */}
          <div className="flex justify-center mb-8 pt-4">
            <Image
              src="/auth/auth-logo.png"
              alt="Mazal Logo"
              width={140}
              height={50}
              className="h-auto"
            />
          </div>

          {/* Badge */}
          <div
            className={`flex items-center gap-2 text-[#0A3B9E] text-xs font-semibold mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <ShieldCheck size={16} />
            <span>{t("common.licensed_escrow")}</span>
          </div>

          {/* Title */}
          <h1
            className={`text-2xl sm:text-3xl font-serif font-bold text-[#041443] mb-2 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("common.create_new_password")}
          </h1>
          <p
            className={`text-gray-500 text-sm mb-8 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
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
              className={`text-xs text-gray-400 space-y-1 ${isRTL ? "text-right" : "text-left"}`}
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
          <div className="mt-6 text-center text-sm text-gray-500">
            {t("common.remember_password")}{" "}
            <Link
              href={`/${locale}/login`}
              className="text-[#0A3B9E] font-medium hover:underline"
            >
              {t("common.sign_in")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
