"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  FileCheck,
  Banknote,
  Info,
  MapPin,
  Calendar,
  Clock,
  Upload,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount, Input } from "@/components/ui";
import Select from "@/components/ui/Select";
import type { DepositPaymentMethod, DepositPaymentMode } from "./types";

interface DepositPaymentStepProps {
  method: DepositPaymentMethod;
  mode: DepositPaymentMode;
  onModeChange: (mode: DepositPaymentMode) => void;
  onBack: () => void;
  onContinue: () => void;
  depositAmount?: number;
  paymentReference?: string;
  submitting?: boolean;
}

const METHOD_META: Record<
  DepositPaymentMethod,
  { titleKey: string; icon: typeof Building2 }
> = {
  bank: { titleKey: "method_bank", icon: Building2 },
  card: { titleKey: "method_card", icon: CreditCard },
  managers_check: { titleKey: "method_managers_check", icon: FileCheck },
  cash: { titleKey: "method_cash", icon: Banknote },
};

const CARD_TYPES = [
  { key: "visa", label: "Visa" },
  { key: "mastercard", label: "Mastercard" },
  { key: "amex", label: "American Express" },
];

const BANK_DETAIL_KEYS = [
  { key: "bank_name", value: "Emirates NBD" },
  { key: "account_name", value: "Mazal Escrow LLC" },
  { key: "iban", value: "AE070331234567890123456" },
  { key: "swift_code", value: "EBILAEAD" },
] as const;

export default function DepositPaymentStep({
  method,
  mode,
  onModeChange,
  onBack,
  onContinue,
  depositAmount = 0,
  paymentReference,
  submitting = false,
}: DepositPaymentStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const meta = METHOD_META[method];
  const MethodIcon = meta.icon;

  const amountLabel = useMemo(() => {
    if (!depositAmount) return "";
    return String(depositAmount);
  }, [depositAmount]);

  const [copied, setCopied] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState({
    cardType: "",
    holderName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [checkForm, setCheckForm] = useState({
    amount: amountLabel,
    checkNumber: "",
    location: "",
    address: "",
    date: "",
    time: "",
  });
  const [cashForm, setCashForm] = useState({
    amount: amountLabel,
    location: "",
    address: "",
    date: "",
    time: "",
  });
  const [bankNotes, setBankNotes] = useState("");

  const showModeToggle = method !== "card";
  const reference =
    paymentReference ||
    (depositAmount > 0 ? `AUC-DEP-${depositAmount}` : "AUC-DEP");

  const bankRows = [
    ...BANK_DETAIL_KEYS.map((row) => ({
      key: row.key,
      label: t(`auctions.bank_detail_${row.key}`),
      value: row.value,
    })),
    {
      key: "reference",
      label: t("auctions.bank_detail_reference"),
      value: reference,
    },
  ];

  const copyValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success(t("auctions.copied") || "Copied");
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error(t("auctions.copy_failed") || "Copy failed");
    }
  };

  const continueLabel =
    method === "card"
      ? t("auctions.pay_with_paytabs") || "Pay with PayTabs"
      : t("auctions.continue");

  return (
    <div
      className="rounded-[20px] border shadow-[0_20px_50px_-24px_rgba(0,0,0,0.18)] p-6 md:p-8"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2
            className="text-2xl font-serif mb-1"
            style={{ color: getColor("primaryText") }}
          >
            {t("auctions.payment_title")}
          </h2>
          <p className="text-sm" style={{ color: getColor("secondaryText") }}>
            {method === "card"
              ? t("auctions.paytabs_checkout_desc") ||
                t("auctions.deposit_method_subtitle")
              : t("auctions.deposit_method_subtitle")}
          </p>
        </div>

        {showModeToggle && (
          <div
            className="inline-flex rounded-full border p-1 self-start"
            style={{
              borderColor: getColor("border"),
              backgroundColor: getColor("primaryLight"),
            }}
          >
            <button
              type="button"
              onClick={() => onModeChange("single")}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={
                mode === "single"
                  ? { backgroundColor: getColor("primary"), color: "#fff" }
                  : { color: getColor("secondaryText") }
              }
            >
              {t("auctions.single_payment")}
            </button>
            <button
              type="button"
              onClick={() => onModeChange("split")}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={
                mode === "split"
                  ? { backgroundColor: getColor("primary"), color: "#fff" }
                  : { color: getColor("secondaryText") }
              }
            >
              {t("auctions.split_payment")}
            </button>
          </div>
        )}
      </div>

      <div
        className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 mb-6"
        style={{
          borderColor: getColor("border"),
          backgroundColor: getColor("primaryLight"),
        }}
      >
        <div
          className="size-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${getColor("primary")}1A`,
            color: getColor("primary"),
          }}
        >
          <MethodIcon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div
            className="font-medium"
            style={{ color: getColor("primaryText") }}
          >
            {t(`auctions.${meta.titleKey}`)}
          </div>
          <div className="text-sm" style={{ color: getColor("mutedText") }}>
            {depositAmount > 0 ? (
              <>
                {t("auctions.summary_min_deposit")}:{" "}
                <DirhamAmount amount={depositAmount} />
              </>
            ) : (
              t("auctions.secure_online")
            )}
          </div>
        </div>
      </div>

      {method === "bank" && (
        <div className="space-y-4 mb-6">
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3.5"
            style={{
              backgroundColor: getColor("primaryLight"),
              color: getColor("secondaryText"),
            }}
          >
            <Info
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: getColor("primary") }}
            />
            <p className="text-sm leading-relaxed">
              {t("auctions.bank_transfer_instructions")}
            </p>
          </div>

          <div className="space-y-3">
            {bankRows.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5"
                style={{
                  borderColor: getColor("border"),
                  backgroundColor: getColor("surface"),
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
                    {row.value}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyValue(row.key, row.value)}
                  className="shrink-0 p-2 rounded-lg"
                  style={{ color: getColor("primary") }}
                  aria-label={`Copy ${row.label}`}
                >
                  {copied === row.key ? (
                    <Check className="w-4 h-4" style={{ color: getColor("success") }} />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div>
            <label
              className="block text-[11px] font-medium mb-2"
              style={{ color: getColor("secondaryText") }}
            >
              {t("auctions.field_notes")}
            </label>
            <textarea
              value={bankNotes}
              onChange={(e) => setBankNotes(e.target.value)}
              placeholder={t("auctions.field_notes_placeholder")}
              rows={3}
              className="w-full rounded-xl border bg-white py-3 px-4 text-sm resize-none outline-none"
              style={{
                borderColor: getColor("border"),
                color: getColor("primaryText"),
              }}
            />
          </div>

          <label
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 cursor-pointer transition-colors text-center"
            style={{
              borderColor: getColor("border"),
              backgroundColor: getColor("primaryLight"),
              color: getColor("secondaryText"),
            }}
          >
            <Upload className="w-5 h-5" style={{ color: getColor("primary") }} />
            <span className="text-sm font-medium">
              {proofFileName || t("auctions.upload_payment_proof")}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setProofFileName(file?.name ?? null);
              }}
            />
          </label>
        </div>
      )}

      {method === "card" && (
        <div className="space-y-4 mb-6">
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3.5"
            style={{
              backgroundColor: getColor("primaryLight"),
              color: getColor("secondaryText"),
            }}
          >
            <Info
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: getColor("primary") }}
            />
            <p className="text-sm leading-relaxed">
              {t("auctions.paytabs_checkout_desc") ||
                "You will be redirected to PayTabs to pay your refundable auction deposit securely."}
            </p>
          </div>

          <Select
            label={t("auctions.field_card_type")}
            options={CARD_TYPES}
            value={cardForm.cardType}
            onChange={(v) => setCardForm({ ...cardForm, cardType: v })}
            placeholder={t("auctions.field_card_type_placeholder")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t("auctions.field_card_holder")}
              value={cardForm.holderName}
              onChange={(e) =>
                setCardForm({ ...cardForm, holderName: e.target.value })
              }
              placeholder={t("auctions.field_card_holder")}
            />
            <Input
              label={t("auctions.field_card_number")}
              value={cardForm.cardNumber}
              onChange={(e) =>
                setCardForm({
                  ...cardForm,
                  cardNumber: e.target.value
                    .replace(/[^\d\s]/g, "")
                    .slice(0, 19),
                })
              }
              placeholder="ACCT-000003"
            />
            <Input
              label={t("auctions.field_expiry")}
              value={cardForm.expiry}
              onChange={(e) =>
                setCardForm({ ...cardForm, expiry: e.target.value })
              }
              placeholder="MM/YY"
            />
            <Input
              label={t("auctions.field_cvv")}
              value={cardForm.cvv}
              onChange={(e) =>
                setCardForm({
                  ...cardForm,
                  cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                })
              }
              placeholder="123"
            />
          </div>
          <p className="text-xs" style={{ color: getColor("mutedText") }}>
            {t("auctions.card_fields_hint")}
          </p>
        </div>
      )}

      {(method === "managers_check" || method === "cash") && (
        <div className="space-y-4 mb-6">
          <Input
            label={
              method === "managers_check"
                ? t("auctions.field_check_amount")
                : t("auctions.field_amount")
            }
            value={
              method === "managers_check" ? checkForm.amount : cashForm.amount
            }
            onChange={(e) =>
              method === "managers_check"
                ? setCheckForm({ ...checkForm, amount: e.target.value })
                : setCashForm({ ...cashForm, amount: e.target.value })
            }
            placeholder={t("auctions.field_amount_placeholder")}
          />

          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3.5"
            style={{
              backgroundColor: getColor("primaryLight"),
              color: getColor("secondaryText"),
            }}
          >
            <Info
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: getColor("primary") }}
            />
            <p className="text-sm leading-relaxed">
              {method === "managers_check"
                ? t("auctions.check_instructions")
                : t("auctions.cash_instructions")}
            </p>
          </div>

          {method === "managers_check" && (
            <Input
              label={t("auctions.field_check_number")}
              value={checkForm.checkNumber}
              onChange={(e) =>
                setCheckForm({ ...checkForm, checkNumber: e.target.value })
              }
              placeholder="eg. 000123"
            />
          )}

          <Input
            label={t("auctions.field_collection_location")}
            icon={<MapPin className="w-4 h-4" />}
            value={
              method === "managers_check"
                ? checkForm.location
                : cashForm.location
            }
            onChange={(e) =>
              method === "managers_check"
                ? setCheckForm({ ...checkForm, location: e.target.value })
                : setCashForm({ ...cashForm, location: e.target.value })
            }
            placeholder="eg. Dubai"
          />

          <div>
            <label
              className="block text-[11px] font-medium mb-2"
              style={{ color: getColor("secondaryText") }}
            >
              {t("auctions.field_collection_address")}
            </label>
            <textarea
              value={
                method === "managers_check"
                  ? checkForm.address
                  : cashForm.address
              }
              onChange={(e) =>
                method === "managers_check"
                  ? setCheckForm({ ...checkForm, address: e.target.value })
                  : setCashForm({ ...cashForm, address: e.target.value })
              }
              placeholder={t("auctions.field_full_address")}
              rows={3}
              className="w-full rounded-xl border bg-white py-3 px-4 text-sm resize-none outline-none"
              style={{
                borderColor: getColor("border"),
                color: getColor("primaryText"),
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t("auctions.field_collection_date")}
              type="date"
              icon={<Calendar className="w-4 h-4" />}
              value={
                method === "managers_check" ? checkForm.date : cashForm.date
              }
              onChange={(e) =>
                method === "managers_check"
                  ? setCheckForm({ ...checkForm, date: e.target.value })
                  : setCashForm({ ...cashForm, date: e.target.value })
              }
            />
            <Input
              label={t("auctions.field_collection_time")}
              type="time"
              icon={<Clock className="w-4 h-4" />}
              value={
                method === "managers_check" ? checkForm.time : cashForm.time
              }
              onChange={(e) =>
                method === "managers_check"
                  ? setCheckForm({ ...checkForm, time: e.target.value })
                  : setCashForm({ ...cashForm, time: e.target.value })
              }
            />
          </div>
        </div>
      )}

      <div
        className="flex items-center justify-between border-t pt-6"
        style={{ borderColor: getColor("border") }}
      >
        <Button
          variant="outline"
          size="md"
          onClick={onBack}
          leftIcon={<BackIcon className="w-4 h-4" />}
          disabled={submitting}
        >
          {t("auctions.back")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onContinue}
          rightIcon={<NextIcon className="w-4 h-4" />}
          disabled={submitting}
        >
          {continueLabel}
        </Button>
      </div>
    </div>
  );
}
