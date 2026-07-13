"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import Button from "@/components/ui/Button";
import { ShieldCheck, X } from "lucide-react";

export default function VerifyCodePage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { getColor, branding } = useTheme();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(300);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Clear error when user types
    if (error) setError("");
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) (prevInput as HTMLInputElement).focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length < 6) {
      setError(t("common.enter_full_code"));
      toast.error(t("common.enter_full_code"));
      return;
    }

    setLoading(true);
    setError("");
    sessionStorage.setItem("reset_token", code);

    toast.success(t("common.code_verified"));
    setTimeout(() => router.push(`/${locale}/reset-password`), 600);
  };

  const handleResend = () => {
    // Reset timer
    setTimer(300);
    setOtp(["", "", "", "", "", ""]);
    setError("");
    // Focus first input
    const firstInput = document.getElementById("otp-0");
    if (firstInput) (firstInput as HTMLInputElement).focus();

    toast.success(t("common.code_resent"));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: getColor("background") }}
    >
      <div className="w-full max-w-sm mx-auto">
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

          {/* Logo */}
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
            className={`flex items-center justify-center gap-2 text-[10px] font-semibold mb-5 ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ color: getColor("primary") }}
          >
            <ShieldCheck size={16} />
            <span>{t("common.licensed_escrow")}</span>
          </div>

          {/* Title */}
          <h1
            className="text-2xl font-serif font-bold mb-2 text-center"
            style={{ color: getColor("primaryText") }}
          >
            {t("common.verify_email")}
          </h1>
          <p
            className="text-xs mb-6 text-center leading-relaxed px-2"
            style={{ color: getColor("secondaryText") }}
          >
            {t("common.verify_code_desc")}
          </p>

          {/* Error */}
          {error && (
            <div
              className={`mb-4 p-2.5 rounded-xl text-xs flex items-center gap-2 ${isRTL ? "flex-row-reverse text-right" : "flex-row text-left"}`}
              style={{
                backgroundColor: `${getColor("error")}15`,
                borderColor: getColor("error"),
                color: getColor("error"),
                borderWidth: "1px",
              }}
            >
              <span className="text-base shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP Boxes */}
            <div className="flex justify-center gap-1.5 sm:gap-2" dir="ltr">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-10 h-11 sm:w-11 sm:h-12 text-center text-lg font-semibold border rounded-lg bg-white focus:ring-2 outline-none transition-all`}
                  style={{
                    borderColor:
                      error && otp.join("").length < 6
                        ? getColor("error")
                        : getColor("border"),
                    color: getColor("primaryText"),
                  }}
                  autoFocus={index === 0}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              className="text-sm"
            >
              {loading ? t("common.verifying") : t("common.verify_code_btn")}
            </Button>
          </form>

          {/* Timer & Resend */}
          <div className="mt-5 text-center text-xs">
            <div className="mb-2" style={{ color: getColor("secondaryText") }}>
              {t("common.code_expires")}{" "}
              <span
                className="font-semibold"
                style={{ color: getColor("primaryText") }}
              >
                {formatTime(timer)}
              </span>
            </div>
            <div style={{ color: getColor("secondaryText") }}>
              {t("common.didnt_receive")}{" "}
              <button
                type="button"
                onClick={handleResend}
                className="font-medium hover:underline disabled:opacity-50"
                style={{ color: getColor("primary") }}
                disabled={timer > 0}
              >
                {timer > 0
                  ? `${t("common.resend_in")} ${formatTime(timer)}`
                  : t("common.resend_code")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
