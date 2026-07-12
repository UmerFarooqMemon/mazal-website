"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import Button from "@/components/ui/Button";
import { ShieldCheck, X } from "lucide-react";

export default function VerifyCodePage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
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
      toast.error(t("common.enter_full_code"), {
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
    setError("");
    sessionStorage.setItem("reset_token", code);

    toast.success(t("common.code_verified"), {
      style: {
        background: "#E8FFE2",
        color: "#015C14",
        border: "1px solid #86D98F",
      },
      icon: "",
      duration: 1500,
    });

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

    toast.success(t("common.code_resent"), {
      style: {
        background: "#EEF2F8",
        color: "#0A3B9E",
        border: "1px solid #B3C7E6",
      },
      icon: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
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
          <div className="flex justify-center mb-6 pt-4">
            <Image
              src="/auth/auth-logo.png"
              alt="Mazal Logo"
              width={120}
              height={40}
              className="h-auto"
            />
          </div>

          {/* Badge */}
          <div
            className={`flex items-center justify-center gap-2 text-[#0A3B9E] text-[10px] font-semibold mb-5 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <ShieldCheck size={16} />
            <span>{t("common.licensed_escrow")}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-serif font-bold text-[#041443] mb-2 text-center">
            {t("common.verify_email")}
          </h1>
          <p className="text-gray-500 text-xs mb-6 text-center leading-relaxed px-2">
            {t("common.verify_code_desc")}
          </p>

          {/* Error */}
          {error && (
            <div
              className={`mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2 ${isRTL ? "flex-row-reverse text-right" : "flex-row text-left"}`}
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
                  className={`w-10 h-11 sm:w-11 sm:h-12 text-center text-lg font-semibold border rounded-lg bg-white focus:ring-2 outline-none transition-all ${
                    error && otp.join("").length < 6
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-[#0A3B9E] focus:ring-[#0A3B9E]/20"
                  }`}
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
            <div className="text-gray-500 mt-2 mb-2">
              {t("common.code_expires")}{" "}
              <span className="font-semibold text-[#041443]">
                {formatTime(timer)}
              </span>
            </div>
            <div className="text-gray-500">
              {t("common.didnt_receive")}{" "}
              <button
                type="button"
                onClick={handleResend}
                className="text-[#0A3B9E] font-medium hover:underline disabled:opacity-50"
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
