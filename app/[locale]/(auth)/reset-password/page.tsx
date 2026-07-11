"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { resetPassword } from "@/services/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ShieldCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError(
        t("common.password_min_length") ||
          "Password must be at least 8 characters.",
      );
      return;
    }
    if (password !== confirmPassword) {
      setError(t("common.passwords_dont_match") || "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const login = sessionStorage.getItem("reset_login") || "";
      const token = sessionStorage.getItem("reset_token") || "";
      if (!login || !token) {
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
      router.push(`/${locale}/password-updated`);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="flex justify-center mb-8">
            <Image
              src="/auth/auth-logo.png"
              alt="Mazal Logo"
              width={140}
              height={50}
              className="h-auto"
            />
          </div>

          <div
            className={`flex items-center gap-2 text-[#0A3B9E] text-xs font-semibold mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <ShieldCheck size={16} />
            <span>{t("common.licensed_escrow")}</span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl font-serif font-bold text-[#041443] mb-2 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("common.create_new_password") || "Create a New Password"}
          </h1>
          <p
            className={`text-gray-500 text-sm mb-8 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("common.reset_password_desc") ||
              "Your identity has been verified. Create a new password for your Mazal account."}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              name="new_password"
              label={t("common.new_password") || "New Password"}
              type={showPassword ? "text" : "password"}
              placeholder={t("common.password_placeholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              name="confirm_password"
              label={t("common.confirm_password") || "Confirm Password"}
              type={showPassword ? "text" : "password"}
              placeholder={t("common.password_placeholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
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
              {loading
                ? t("common.resetting") || "Resetting..."
                : t("common.reset_password_btn") || "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {t("common.remember_password") || "Remember your password?"}{" "}
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
