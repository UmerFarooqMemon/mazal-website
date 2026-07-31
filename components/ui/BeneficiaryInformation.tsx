"use client";

import { useState } from "react";
import { Building2, Check, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";

/** Mazal custody / escrow bank details (fallback when API omits a field). */
export const MAZAL_BENEFICIARY_DEFAULTS = {
  beneficiaryName: "Mazaal For Auctions Organizing CO. L.L.C",
  iban: "AE80034000370852324190",
  accountNumber: "3708523241901",
} as const;

export interface BeneficiaryInformationProps {
  beneficiaryName?: string | null;
  iban?: string | null;
  accountNumber?: string | null;
  className?: string;
}

export default function BeneficiaryInformation({
  beneficiaryName,
  iban,
  accountNumber,
  className = "",
}: BeneficiaryInformationProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();
  const [copied, setCopied] = useState<string | null>(null);

  const rows = [
    {
      key: "name",
      label: t("common.beneficiary_name"),
      value:
        beneficiaryName?.trim() || MAZAL_BENEFICIARY_DEFAULTS.beneficiaryName,
    },
    {
      key: "iban",
      label: t("common.iban"),
      value: iban?.trim() || MAZAL_BENEFICIARY_DEFAULTS.iban,
    },
    {
      key: "account",
      label: t("common.account_number"),
      value:
        accountNumber?.trim() || MAZAL_BENEFICIARY_DEFAULTS.accountNumber,
    },
  ];

  const copyValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success(t("common.copied") || "Copied");
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error(t("common.copy_failed") || "Copy failed");
    }
  };

  return (
    <div
      className={`rounded-2xl border p-5 md:p-6 ${className}`}
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("primary"),
      }}
    >
      <div
        className="flex items-center gap-2 font-semibold mb-4"
        style={{ color: getColor("primaryText") }}
      >
        <Building2
          className="w-4 h-4 shrink-0"
          strokeWidth={2.25}
          style={{ color: getColor("primary") }}
        />
        <span className="text-sm">{t("common.beneficiary_information")}</span>
      </div>

      <div className="space-y-3.5">
        {rows.map((row) => (
          <div key={row.key} className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-sm leading-relaxed">
              <span style={{ color: getColor("mutedText") }}>{row.label}: </span>
              <span
                className="font-semibold break-all"
                style={{ color: getColor("primaryText") }}
              >
                {row.value}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyValue(row.key, row.value)}
              className="shrink-0 p-1.5 rounded-lg transition-opacity hover:opacity-80"
              style={{ color: getColor("mutedText") }}
              aria-label={`Copy ${row.label}`}
            >
              {copied === row.key ? (
                <Check
                  className="w-4 h-4"
                  style={{ color: getColor("success") }}
                />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
