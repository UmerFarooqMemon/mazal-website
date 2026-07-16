"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
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
    <div className="bg-white rounded-[20px] border border-[#d9dee6] shadow-[0_20px_50px_-24px_rgba(1,15,81,0.25)] p-6 md:p-8">
      <h2
        className={`text-2xl font-serif text-[#081123] mb-1 ${isRTL ? "text-right" : "text-left"}`}
      >
        {t("private-deal.otp_title")}
      </h2>
      <p
        className={`text-sm text-[#545e6f] mb-8 ${isRTL ? "text-right" : "text-left"}`}
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
            className="w-11 h-12 sm:w-14 sm:h-14 rounded-xl border border-[#d9dee6] bg-white text-center text-xl font-semibold text-[#081123] focus:outline-none focus:border-[#0a2f94] focus:ring-2 focus:ring-[#0a2f94]/15"
          />
        ))}
      </div>

      <div
        className={`flex items-center justify-between border-t border-[#d9dee6] pt-6 ${isRTL ? "flex-row-reverse" : ""}`}
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
