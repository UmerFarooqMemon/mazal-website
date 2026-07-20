"use client";

import { Copy, Share2, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";

interface TransferProgressStepProps {
  otp?: string;
  shareUrl?: string;
}

export default function TransferProgressStep({
  otp = "256 256 1245",
  shareUrl,
}: TransferProgressStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(otp.replace(/\s/g, ""));
      setCopied(true);
      toast.success(t("private-deal.copied"));
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Mazal Private Deal",
      text: `Join this Mazal private escrow deal. OTP: ${otp}${shareUrl ? ` ${shareUrl}` : ""}`,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      await handleCopy();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div
        className="rounded-[22px] border shadow-[0_27px_54px_rgba(1,15,81,0.2)] px-8 py-12 text-center"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <div className="text-6xl mb-4" aria-hidden>
          🎉
        </div>
        <h2
          className="font-serif text-[28px] md:text-[34px] tracking-tight mb-4"
          style={{ color: getColor("primaryText") }}
        >
          {t("private-deal.transfer_progress_title")}
        </h2>
        <p
          className="text-base md:text-lg leading-relaxed max-w-3xl mx-auto"
          style={{ color: getColor("secondaryText") }}
        >
          {t("private-deal.transfer_progress_desc")}
        </p>
      </div>

      <div
        className="rounded-[22px] border p-5 md:p-6"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <div
          className={`flex flex-col lg:flex-row items-center justify-center gap-5 lg:gap-10 ${isRTL ? "lg:flex-row-reverse" : ""}`}
        >
          <p
            className={`text-base max-w-sm ${isRTL ? "text-right" : "text-left"}`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("private-deal.share_otp_hint")}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleShare}
            leftIcon={<Share2 className="w-5 h-5" />}
            className="rounded-[22px] px-6"
          >
            {t("private-deal.share")}
          </Button>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-3 rounded-[22px] border px-5 py-3.5 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
            style={{
              borderColor: getColor("border"),
              backgroundColor: getColor("surface"),
              color: getColor("primaryText"),
            }}
          >
            <span className="text-base whitespace-nowrap">
              {t("private-deal.otp_label")}: {otp}
            </span>
            {copied ? (
              <Check
                className="w-5 h-5"
                style={{ color: getColor("success") }}
              />
            ) : (
              <Copy
                className="w-5 h-5"
                style={{ color: getColor("secondaryText") }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
