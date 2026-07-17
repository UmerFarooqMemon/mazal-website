"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, Input } from "@/components/ui";
import type { PaymentMethod } from "./PaymentMethodStep";

interface PaymentDetailsStepProps {
  method: PaymentMethod;
  amount: number;
  onBack: () => void;
  onContinue: () => void;
}

const BANK_DETAILS = [
  { label: "Bank Name", value: "Emirates NBD" },
  { label: "Account Name", value: "Mazal Escrow LLC" },
  { label: "IBAN", value: "AE070331234567890123456" },
  { label: "Swift Code", value: "EBILAEAD" },
  { label: "Reference", value: "MZL-ESC-450777" },
];

export default function PaymentDetailsStep({
  method,
  amount,
  onBack,
  onContinue,
}: PaymentDetailsStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const [copied, setCopied] = useState<string | null>(null);
  const [card, setCard] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  const copyValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success(t("private-deal.copied"));
      setTimeout(() => setCopied(null), 1500);
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
        {method === "card"
          ? t("private-deal.card_payment")
          : method === "bank"
            ? t("private-deal.bank_transfer")
            : method === "managers_check"
              ? t("private-deal.managers_check")
              : t("private-deal.cash_collection")}
      </h2>
      <p
        className={`text-sm mb-6 ${isRTL ? "text-right" : "text-left"}`}
        style={{ color: getColor("secondaryText") }}
      >
        {t("private-deal.secure_online")} · AED {amount.toLocaleString("en-AE")}
      </p>

      {method === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="sm:col-span-2">
            <Input
              label="Name on card"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Card number"
              value={card.number}
              onChange={(e) =>
                setCard({
                  ...card,
                  number: e.target.value.replace(/[^\d\s]/g, "").slice(0, 19),
                })
              }
              placeholder="ACCT-000003"
            />
          </div>
          <Input
            label="Expiry"
            value={card.expiry}
            onChange={(e) => setCard({ ...card, expiry: e.target.value })}
            placeholder="MM/YY"
          />
          <Input
            label="CVV"
            value={card.cvv}
            onChange={(e) =>
              setCard({
                ...card,
                cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
              })
            }
            placeholder="123"
          />
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {BANK_DETAILS.map((row) => (
            <div
              key={row.label}
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
                  {row.label}
                </div>
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: getColor("primaryText") }}
                >
                  {method === "cash"
                    ? row.label === "Bank Name"
                      ? "Mazal Collection Desk — Dubai"
                      : row.value
                    : row.value}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyValue(row.label, row.value)}
                className="shrink-0 p-2 rounded-lg"
                style={{ color: getColor("primary") }}
              >
                {copied === row.label ? (
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
      )}

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
        >
          {t("private-deal.continue")}
        </Button>
      </div>
    </div>
  );
}
