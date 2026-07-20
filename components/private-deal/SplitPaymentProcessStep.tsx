"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  FileCheck,
  Banknote,
  Upload,
  Info,
  CheckCircle2,
  Calendar,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, Input } from "@/components/ui";
import type { PaymentMethod, SplitPaymentEntry } from "./PaymentMethodStep";

interface SplitPaymentProcessStepProps {
  payment: SplitPaymentEntry;
  onBack: () => void;
  onComplete: (payload: {
    paymentReference?: string;
    senderBankName?: string;
    senderAccountLast4?: string;
    notes?: string;
    evidence?: File | null;
    checkNumber?: string;
    collectionDate?: string;
    collectionTime?: string;
  }) => void;
  submitting?: boolean;
  custodyInstructions?: Record<string, unknown>;
}

const METHOD_META: Record<
  PaymentMethod,
  { titleKey: string; icon: typeof Building2 }
> = {
  bank: { titleKey: "bank_transfer", icon: Building2 },
  card: { titleKey: "card_payment", icon: CreditCard },
  managers_check: { titleKey: "managers_check", icon: FileCheck },
  cash: { titleKey: "cash_collection", icon: Banknote },
};

function formatAed(amount: number) {
  return `AED ${amount.toLocaleString("en-AE")}`;
}

export default function SplitPaymentProcessStep({
  payment,
  onBack,
  onComplete,
  submitting = false,
  custodyInstructions,
}: SplitPaymentProcessStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const meta = METHOD_META[payment.method];
  const Icon = meta.icon;
  const fileRef = useRef<HTMLInputElement>(null);

  const [proofName, setProofName] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [bankTransfer, setBankTransfer] = useState({
    paymentReference: "",
    senderBankName: payment.bank || "",
    senderAccountLast4: payment.accountNumber?.slice(-4) || "",
    notes: payment.notes || "",
  });
  const [check, setCheck] = useState({
    number: "",
    date: "",
    time: "",
    notes: payment.notes || "",
  });
  const [cash, setCash] = useState({
    date: "",
    time: "",
    notes: payment.notes || "",
  });

  const ctaLabel =
    payment.method === "bank"
      ? t("private-deal.transfer_completed")
      : t("private-deal.pay_now");

  const instructionRows = Object.entries(custodyInstructions || {}).filter(
    ([, value]) => value != null && value !== "",
  );

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

  const handleSubmit = () => {
    if (payment.method === "bank") {
      onComplete({
        paymentReference: bankTransfer.paymentReference,
        senderBankName: bankTransfer.senderBankName,
        senderAccountLast4: bankTransfer.senderAccountLast4,
        notes: bankTransfer.notes,
        evidence: proofFile,
      });
      return;
    }

    if (payment.method === "card") {
      onComplete({});
      return;
    }

    if (payment.method === "managers_check") {
      onComplete({
        checkNumber: check.number,
        collectionDate: check.date,
        collectionTime: check.time,
        notes: check.notes,
      });
      return;
    }

    onComplete({
      collectionDate: cash.date,
      collectionTime: cash.time,
      notes: cash.notes,
    });
  };

  return (
    <div
      className="rounded-[20px] border shadow-[0_20px_50px_-24px_rgba(1,15,81,0.25)] p-6 md:p-8"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: getColor("border") }}
      >
        <div
          className={`flex items-center gap-3 px-4 py-3.5 border-b ${isRTL ? "flex-row-reverse" : ""}`}
          style={{
            backgroundColor: getColor("primaryLight"),
            borderColor: getColor("border"),
          }}
        >
          <div
            className="size-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${getColor("primary")}1A`,
              color: getColor("primary"),
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className={`min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
            <div
              className="font-medium"
              style={{ color: getColor("primaryText") }}
            >
              {t(`private-deal.${meta.titleKey}`)}
            </div>
            <div className="text-sm" style={{ color: getColor("mutedText") }}>
              {t("private-deal.secure_online")}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-5 space-y-4">
          {instructionRows.length > 0 && (
            <div className="space-y-3">
              {instructionRows.map(([key, value]) => (
                <div
                  key={key}
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
                      {key.replace(/_/g, " ")}
                    </div>
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: getColor("primaryText") }}
                    >
                      {String(value)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyValue(key, String(value))}
                    className="shrink-0 p-2 rounded-lg"
                    style={{ color: getColor("primary") }}
                  >
                    {copiedKey === key ? (
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

          {payment.method === "bank" && (
            <>
              <Input
                label={t("private-deal.payment_reference")}
                value={bankTransfer.paymentReference}
                onChange={(e) =>
                  setBankTransfer((prev) => ({
                    ...prev,
                    paymentReference: e.target.value,
                  }))
                }
                placeholder="BANK-TRANSFER-REFERENCE-001"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t("private-deal.sender_bank_name")}
                  value={bankTransfer.senderBankName}
                  onChange={(e) =>
                    setBankTransfer((prev) => ({
                      ...prev,
                      senderBankName: e.target.value,
                    }))
                  }
                  placeholder="Example UAE Bank"
                />
                <Input
                  label={t("private-deal.sender_account_last4")}
                  value={bankTransfer.senderAccountLast4}
                  onChange={(e) =>
                    setBankTransfer((prev) => ({
                      ...prev,
                      senderAccountLast4: e.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                  placeholder="1234"
                />
              </div>
              <div>
                <label
                  className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.upload_payment_proof")}
                </label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-xl border border-dashed py-10 px-4 text-center transition-colors"
                  style={{
                    borderColor: getColor("border"),
                    backgroundColor: getColor("primaryLight"),
                  }}
                >
                  <Upload
                    className="w-[18px] h-[18px] mx-auto mb-2"
                    style={{ color: getColor("primary") }}
                  />
                  <div
                    className="text-sm font-medium"
                    style={{ color: getColor("primaryText") }}
                  >
                    {proofName || t("private-deal.click_upload_proof")}
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: getColor("mutedText") }}
                  >
                    {t("private-deal.upload_hint")}
                  </div>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProofName(file.name);
                      setProofFile(file);
                    }
                  }}
                />
              </div>
              <div>
                <label
                  className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.notes")}
                </label>
                <textarea
                  value={bankTransfer.notes}
                  onChange={(e) =>
                    setBankTransfer((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  className={`w-full rounded-xl border py-3 px-4 text-sm focus:outline-none focus:ring-2 ${isRTL ? "text-right" : "text-left"}`}
                  style={{
                    borderColor: getColor("border"),
                    backgroundColor: getColor("surface"),
                    color: getColor("primaryText"),
                  }}
                />
              </div>
            </>
          )}

          {payment.method === "card" && (
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: `${getColor("primary")}26`,
                backgroundColor: `${getColor("primary")}0D`,
              }}
            >
              <p
                className={`text-sm leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
                style={{ color: getColor("secondaryText") }}
              >
                {t("private-deal.card_redirect_notice")}
              </p>
            </div>
          )}

          {payment.method === "managers_check" && (
            <>
              <Input
                label={t("private-deal.check_amount")}
                value={formatAed(payment.amount)}
                readOnly
              />
              <div
                className="rounded-xl border p-4"
                style={{
                  borderColor: `${getColor("primary")}26`,
                  backgroundColor: `${getColor("primary")}0D`,
                }}
              >
                <div
                  className={`flex items-center gap-2 text-sm font-medium mb-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  style={{ color: getColor("primaryText") }}
                >
                  <Info
                    className="w-4 h-4 shrink-0"
                    style={{ color: getColor("primary") }}
                  />
                  {t("private-deal.instructions")}
                </div>
                <p
                  className={`text-sm leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.managers_check_instructions")}
                </p>
              </div>
              <Input
                label={t("private-deal.check_number")}
                value={check.number}
                onChange={(e) => setCheck({ ...check, number: e.target.value })}
                placeholder="eg. 000123"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t("private-deal.collection_date")}
                  type="date"
                  value={check.date}
                  onChange={(e) => setCheck({ ...check, date: e.target.value })}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <Input
                  label={t("private-deal.collection_time")}
                  type="time"
                  value={check.time}
                  onChange={(e) => setCheck({ ...check, time: e.target.value })}
                  icon={<Clock className="w-4 h-4" />}
                />
              </div>
              <div>
                <label
                  className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.notes")}
                </label>
                <textarea
                  value={check.notes}
                  onChange={(e) => setCheck({ ...check, notes: e.target.value })}
                  rows={3}
                  className={`w-full rounded-xl border py-3 px-4 text-sm focus:outline-none focus:ring-2 ${isRTL ? "text-right" : "text-left"}`}
                  style={{
                    borderColor: getColor("border"),
                    backgroundColor: getColor("surface"),
                    color: getColor("primaryText"),
                  }}
                />
              </div>
            </>
          )}

          {payment.method === "cash" && (
            <>
              <Input
                label={t("private-deal.amount")}
                value={formatAed(payment.amount)}
                readOnly
              />
              <div
                className="rounded-xl border p-4"
                style={{
                  borderColor: `${getColor("primary")}26`,
                  backgroundColor: `${getColor("primary")}0D`,
                }}
              >
                <div
                  className={`flex items-center gap-2 text-sm font-medium mb-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  style={{ color: getColor("primaryText") }}
                >
                  <Info
                    className="w-4 h-4 shrink-0"
                    style={{ color: getColor("primary") }}
                  />
                  {t("private-deal.instructions")}
                </div>
                <p
                  className={`text-sm leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.cash_collection_instructions")}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t("private-deal.collection_date")}
                  type="date"
                  value={cash.date}
                  onChange={(e) => setCash({ ...cash, date: e.target.value })}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <Input
                  label={t("private-deal.collection_time")}
                  type="time"
                  value={cash.time}
                  onChange={(e) => setCash({ ...cash, time: e.target.value })}
                  icon={<Clock className="w-4 h-4" />}
                />
              </div>
              <div>
                <label
                  className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.notes")}
                </label>
                <textarea
                  value={cash.notes}
                  onChange={(e) => setCash({ ...cash, notes: e.target.value })}
                  rows={3}
                  className={`w-full rounded-xl border py-3 px-4 text-sm focus:outline-none focus:ring-2 ${isRTL ? "text-right" : "text-left"}`}
                  style={{
                    borderColor: getColor("border"),
                    backgroundColor: getColor("surface"),
                    color: getColor("primaryText"),
                  }}
                />
              </div>
            </>
          )}

          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {submitting ? t("private-deal.processing") : ctaLabel}
          </Button>
        </div>
      </div>

      <div
        className={`flex items-center border-t pt-6 mt-6 ${isRTL ? "flex-row-reverse" : ""}`}
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
      </div>
    </div>
  );
}
