"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { forgotPassword } from "@/services/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ShieldCheck, X } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { getColor, branding } = useTheme();
  const [login, setLogin] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");

  // Handle input change
  const handleChange = (value: string) => {
    setLogin(value);
    if (fieldError) setFieldError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate field
    if (!login.trim()) {
      setFieldError(t("common.error_field_required"));
      toast.error(t("common.error_fill_fields"));
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword({ login });
      if (response.status) {
        sessionStorage.setItem("reset_login", login);
        toast.success(t("common.code_sent"));
        setTimeout(() => router.push(`/${locale}/verify-code`), 800);
      } else {
        toast.error(t("common.send_code_failed"));
      }
    } catch (err: any) {
      toast.error(err.message || t("common.send_code_failed"));
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
            {t("common.forgot_password_title")}
          </h1>
          <p
            className={`text-sm mb-8 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("common.forgot_password_desc")}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              name="login"
              label={t("common.email_or_mobile")}
              type="text"
              placeholder={t("common.email_placeholder")}
              value={login}
              onChange={(e) => handleChange(e.target.value)}
              error={fieldError}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? t("common.sending") : t("common.send_code")}
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
