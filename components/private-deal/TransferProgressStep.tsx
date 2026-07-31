"use client";

import { Copy, Share2, Check, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";

interface TransferProgressStepProps {
  otp?: string;
  shareUrl?: string;
  /** Gift invites are emailed; sale invites are manual share. */
  delivery?: string;
  invitationEmailSent?: boolean;
  recipientEmail?: string | null;
}

export default function TransferProgressStep({
  otp = "256 256 1245",
  shareUrl,
  delivery,
  invitationEmailSent,
  recipientEmail,
}: TransferProgressStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const [copied, setCopied] = useState(false);
  const isGiftEmail = delivery === "email";

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

      {isGiftEmail && (
        <div
          className="rounded-[22px] border px-5 py-4 flex items-start gap-3"
          style={{
            backgroundColor: `${getColor("primary")}0D`,
            borderColor: `${getColor("primary")}33`,
          }}
        >
          <Mail
            className="w-5 h-5 shrink-0 mt-0.5"
            style={{ color: getColor("primary") }}
          />
          <div className="text-start min-w-0">
            <p
              className="text-sm font-medium"
              style={{ color: getColor("primaryText") }}
            >
              {invitationEmailSent
                ? t("private-deal.gift_invite_emailed")
                : t("private-deal.gift_invite_email_failed")}
            </p>
            {recipientEmail && (
              <p
                className="text-sm mt-1 truncate"
                style={{ color: getColor("secondaryText") }}
              >
                {recipientEmail}
              </p>
            )}
            <p
              className="text-xs mt-2"
              style={{ color: getColor("mutedText") }}
            >
              {t("private-deal.gift_invite_code_fallback")}
            </p>
          </div>
        </div>
      )}

      <div
        className="rounded-[22px] border p-5 md:p-6"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <div
          className={`flex flex-col lg:flex-row items-center justify-center gap-5 lg:gap-10`}
        >
          <p
            className={`text-base max-w-sm text-start`}
            style={{ color: getColor("secondaryText") }}
          >
            {isGiftEmail
              ? t("private-deal.gift_share_otp_hint")
              : t("private-deal.share_otp_hint")}
          </p>
          {!isGiftEmail && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleShare}
              leftIcon={<Share2 className="w-5 h-5" />}
              className="rounded-[22px] px-6"
            >
              {t("private-deal.share")}
            </Button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-3 rounded-[22px] border px-5 py-3.5 transition-colors`}
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
