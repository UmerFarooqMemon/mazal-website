"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";

interface OtpVerificationStepProps {
  otp: string[];
  onChange: (otp: string[]) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function OtpVerificationStep({
  otp,
  onChange,
  onBack,
  onContinue,
}: OtpVerificationStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    onChange(next);
    if (digit && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");
    if (!pasted.length) return;
    const next = [...otp];
    pasted.forEach((d, i) => {
      next[i] = d;
    });
    onChange(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div
      className="rounded-[20px] border shadow-[0_20px_50px_-24px_rgba(1,15,81,0.25)] p-6 md:p-8"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <h2
        className={`text-2xl font-serif mb-1 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("primaryText") }}
      >
        {t("private-deal.otp_title")}
      </h2>
      <p
        className={`text-sm mb-8 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("secondaryText") }}
      >
        {t("private-deal.otp_subtitle")}
      </p>

      <div
        className={`flex items-center justify-center gap-2 sm:gap-3 mb-10 ${isRTL ? "flex-row-reverse" : ""}`}
        onPaste={onPaste}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => setDigit(index, e.target.value)}
            onKeyDown={(e) => onKeyDown(index, e)}
            className="w-11 h-12 sm:w-14 sm:h-14 rounded-xl border text-center text-xl font-semibold focus:outline-none focus:ring-2"
            style={{
              borderColor: getColor("border"),
              backgroundColor: getColor("surface"),
              color: getColor("primaryText"),
            }}
          />
        ))}
      </div>

      <div
        className={`flex items-center justify-between border-t pt-6 ${isRTL ? "flex-row-reverse" : ""}`}
        style={{ borderColor: getColor("border") }}
      >
        <Button
          variant="outline"
          size="md"
          onClick={onBack}
          leftIcon={<BackIcon className="w-4 h-4" />}
        >
          {t("private-deal.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onContinue}
          rightIcon={<NextIcon className="w-4 h-4" />}
          disabled={otp.some((d) => !d)}
        >
          {t("private-deal.continue")}
        </Button>
      </div>
    </div>
  );
}
