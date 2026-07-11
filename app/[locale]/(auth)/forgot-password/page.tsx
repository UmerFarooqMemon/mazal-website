"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "@/context/LocaleContext";
import { forgotPassword } from "@/services/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const [login, setLogin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await forgotPassword({ login });
      if (response.status) {
        sessionStorage.setItem("reset_login", login);
        router.push(`/${locale}/verify-code`);
      } else {
        setError(response.data?.message || "An error occurred.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          {/* Logo */}
          <div className="flex justify-center mb-8">
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
            {t("common.forgot_password_title") || "Reset Your Password"}
          </h1>
          <p
            className={`text-gray-500 text-sm mb-8 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("common.forgot_password_desc") ||
              "Enter your registered email address or mobile number. We'll send you a 6-digit verification code."}
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              name="login"
              label={t("common.email_or_mobile")}
              type="text"
              placeholder={t("common.email_placeholder")}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading
                ? t("common.sending") || "Sending..."
                : t("common.send_code") || "Send Verification Code"}
            </Button>
          </form>

          {/* Footer */}
          <div className={`mt-6 text-center text-sm text-gray-500`}>
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
