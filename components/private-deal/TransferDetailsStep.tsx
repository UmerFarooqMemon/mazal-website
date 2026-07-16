"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
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
    <div className="bg-white rounded-[20px] border border-[#d9dee6] shadow-[0_20px_50px_-24px_rgba(1,15,81,0.25)] p-6 md:p-8">
      <h2
        className={`text-2xl font-serif text-[#081123] mb-1 ${isRTL ? "text-right" : "text-left"}`}
      >
        {t("private-deal.transfer_title")}
      </h2>
      <p
        className={`text-sm text-[#545e6f] mb-6 ${isRTL ? "text-right" : "text-left"}`}
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
              className={`flex items-center justify-between gap-3 rounded-xl border border-[#d9dee6] bg-[#fafbfd] px-4 py-3.5 ${isRTL ? "flex-row-reverse text-right" : ""}`}
            >
              <div className="min-w-0">
                <div className="text-xs text-[#8b95a7] mb-0.5">{label}</div>
                <div className="text-sm font-medium text-[#081123] truncate">
                  {value}
                </div>
              </div>
              {field.copyable && (
                <button
                  type="button"
                  onClick={() => copyValue(field.key, value)}
                  className="shrink-0 p-2 rounded-lg hover:bg-white text-[#0a2f94] transition-colors"
                  aria-label="Copy"
                >
                  {copiedKey === field.key ? (
                    <Check className="w-4 h-4 text-green-600" />
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
          className="mt-1 size-4 rounded border-[#d9dee6] accent-[#0a2f94]"
        />
        <span className="text-sm text-[#545e6f]">
          {t("private-deal.agree_terms")}
        </span>
      </label>

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
