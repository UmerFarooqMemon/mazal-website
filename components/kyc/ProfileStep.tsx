"use client";

import Image from "next/image";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import type { KycProfileType } from "@/components/kyc/types";

interface ProfileStepProps {
  profileType: KycProfileType;
  setProfileType: (type: KycProfileType) => void;
  onContinue: () => Promise<void> | void;
  onBack?: () => void;
  loading?: boolean;
}

export default function ProfileStep({
  profileType,
  setProfileType,
  onContinue,
  onBack,
  loading = false,
}: ProfileStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleContinue = async () => {
    if (!profileType) {
      toast.error(t("kyc.select_profile_error"));
      return;
    }
    await onContinue();
  };

  const cardStyle = (selected: boolean) =>
    selected
      ? {
          borderColor: getColor("primary"),
          backgroundColor: `${getColor("primary")}0D`,
          boxShadow: `0 30px 60px -25px ${getColor("primary")}55`,
        }
      : {
          borderColor: getColor("border"),
          backgroundColor: getColor("surface"),
          boxShadow: `0 30px 60px -25px ${getColor("primary")}22`,
        };

  const profiles = [
    {
      key: "uae_resident" as const,
      title: t("kyc.uae_resident"),
      badge: t("kyc.uae_badge"),
      points: [t("kyc.uae_point_1"), t("kyc.uae_point_2"), t("kyc.uae_point_3")],
    },
    {
      key: "international" as const,
      title: t("kyc.international"),
      badge: t("kyc.international_badge"),
      points: [t("kyc.intl_point_1"), t("kyc.intl_point_2"), t("kyc.intl_point_3")],
    },
  ];

  return (
    <div
      className="rounded-[20px] border p-8 md:p-10 shadow-[0_30px_60px_-25px_rgba(1,15,81,0.2)]"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <h2
        className={`text-2xl font-serif tracking-tight mb-1 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("primaryText") }}
      >
        {t("kyc.profile_title")}
      </h2>
      <p
        className={`text-sm mb-8 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("secondaryText") }}
      >
        {t("kyc.profile_subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {profiles.map((profile) => {
          const selected = profileType === profile.key;
          return (
            <button
              key={profile.key}
              type="button"
              onClick={() => setProfileType(profile.key)}
              disabled={loading}
              className={`text-start p-6 rounded-2xl border transition-all duration-200 ${isRTL ? "text-right" : "text-left"}`}
              style={cardStyle(selected)}
            >
              <div
                className={`flex items-start justify-between gap-3 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Image
                  src="/kyc-building-icon.png"
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6 shrink-0 object-contain"
                />
                <span
                  className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] tracking-[0.06em] uppercase"
                  style={{
                    backgroundColor: selected
                      ? getColor("surface")
                      : `${getColor("border")}42`,
                    border: selected
                      ? "none"
                      : `1px solid ${getColor("border")}`,
                    color: getColor("secondaryText"),
                  }}
                >
                  {profile.badge}
                </span>
              </div>

              <h3
                className="font-serif text-[22px] tracking-tight mb-3"
                style={{ color: getColor("primaryText") }}
              >
                {profile.title}
              </h3>

              <ul className="space-y-1.5">
                {profile.points.map((point) => (
                  <li key={point} className="flex items-center gap-1.5">
                    <span
                      className="flex items-center justify-center size-[18px] rounded-full shrink-0"
                      style={{
                        backgroundColor: `${getColor("success")}18`,
                      }}
                    >
                      <Check
                        className="w-3 h-3"
                        style={{ color: getColor("success") }}
                        strokeWidth={3}
                      />
                    </span>
                    <span
                      className={`text-sm ${isRTL ? "text-right" : "text-left"}`}
                      style={{ color: getColor("secondaryText") }}
                    >
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
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
          className="opacity-70"
          disabled={loading}
        >
          {t("kyc.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleContinue}
          loading={loading}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {t("kyc.continue")}
        </Button>
      </div>
    </div>
  );
}
