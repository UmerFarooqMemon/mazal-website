"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";

interface TransferDetailsStepProps {
  onBack: () => void;
  onComplete: () => void;
}

const TRANSFER_FIELDS = [
  {
    key: "type",
    labelKey: "transfer_type_hint" as const,
    valueKey: "transfer_type_value" as const,
    copyable: false,
  },
  {
    key: "trade",
    labelKey: "paste_trade_license" as const,
    value: "1629312",
    copyable: true,
  },
  {
    key: "mobile",
    labelKey: "paste_mobile" as const,
    value: "+971 557487474",
    copyable: true,
  },
  {
    key: "traffic",
    labelKey: "if_traffic_code" as const,
    value: "19999999",
    copyable: true,
  },
  {
    key: "source",
    labelKey: "license_source_select" as const,
    valueKey: "license_source_default" as const,
    copyable: false,
  },
];

export default function TransferDetailsStep({
  onBack,
  onComplete,
}: TransferDetailsStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const [agreed, setAgreed] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast.success(t("private-deal.copied"));
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      toast.error("Copy failed");
    }
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
        {t("private-deal.transfer_title")}
      </h2>
      <p
        className={`text-sm mb-6 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("secondaryText") }}
      >
        {t("private-deal.transfer_subtitle")}
      </p>

      <div className="space-y-3 mb-6">
        {TRANSFER_FIELDS.map((field) => {
          const label = t(`private-deal.${field.labelKey}`);
          const value =
            "value" in field && field.value
              ? field.value
              : t(`private-deal.${field.valueKey!}`);

          return (
            <div
              key={field.key}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 ${isRTL ? "flex-row-reverse text-right" : ""}`}
              style={{
                borderColor: getColor("border"),
                backgroundColor: getColor("primaryLight"),
              }}
            >
              <div className="min-w-0">
                <div
                  className="text-xs mb-0.5"
                  style={{ color: getColor("mutedText") }}
                >
                  {label}
                </div>
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: getColor("primaryText") }}
                >
                  {value}
                </div>
              </div>
              {field.copyable && (
                <button
                  type="button"
                  onClick={() => copyValue(field.key, value)}
                  className="shrink-0 p-2 rounded-lg transition-colors"
                  style={{ color: getColor("primary") }}
                  aria-label="Copy"
                >
                  {copiedKey === field.key ? (
                    <Check
                      className="w-4 h-4"
                      style={{ color: getColor("success") }}
                    />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <label
        className={`flex items-start gap-3 mb-6 cursor-pointer ${isRTL ? "flex-row-reverse text-right" : ""}`}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 size-4 rounded"
          style={{
            borderColor: getColor("border"),
            accentColor: getColor("primary"),
          }}
        />
        <span className="text-sm" style={{ color: getColor("secondaryText") }}>
          {t("private-deal.agree_terms")}
        </span>
      </label>

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
          disabled={!agreed}
          onClick={onComplete}
          rightIcon={<NextIcon className="w-4 h-4" />}
        >
          {t("private-deal.complete")}
        </Button>
      </div>
    </div>
  );
}
