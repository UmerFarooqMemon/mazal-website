"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  FileCheck,
  Banknote,
  Info,
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
import type { MarketplaceAuctionBankInstructions } from "@/services/marketplace";
import type {
  DepositPaymentMethod,
  DepositPaymentSubmitPayload,
} from "./types";

interface DepositPaymentStepProps {
  method: Exclude<DepositPaymentMethod, "wallet">;
  onBack: () => void;
  onContinue: (payload: DepositPaymentSubmitPayload) => void;
  depositAmount?: number;
  bankInstructions?: MarketplaceAuctionBankInstructions | null;
  custodyInstructions?: MarketplaceAuctionBankInstructions | null;
  instructionsLoading?: boolean;
  submitting?: boolean;
}

const METHOD_META: Record<
  Exclude<DepositPaymentMethod, "wallet">,
  { titleKey: string; icon: typeof Building2 }
> = {
  bank: { titleKey: "method_bank", icon: Building2 },
  card: { titleKey: "method_card", icon: CreditCard },
  managers_check: { titleKey: "method_managers_check", icon: FileCheck },
  cash: { titleKey: "method_cash", icon: Banknote },
};

export default function DepositPaymentStep({
  method,
  onBack,
  onContinue,
  depositAmount = 0,
  bankInstructions,
  custodyInstructions,
  instructionsLoading = false,
  submitting = false,
}: DepositPaymentStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const meta = METHOD_META[method];
  const MethodIcon = meta.icon;

  const [copied, setCopied] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [bankForm, setBankForm] = useState({
    paymentReference: "",
    notes: "",
    evidence: null as File | null,
  });
  const [checkForm, setCheckForm] = useState({
    checkNumber: "",
    date: "",
    time: "",
    pickupAddress: "",
    notes: "",
  });
  const [cashForm, setCashForm] = useState({
    date: "",
    time: "",
    pickupAddress: "",
    notes: "",
  });

  useEffect(() => {
    setFormError(null);
  }, [method]);

  useEffect(() => {
    if (bankInstructions?.reference) {
      setBankForm((prev) =>
        prev.paymentReference
          ? prev
          : { ...prev, paymentReference: String(bankInstructions.reference) },
      );
    }
  }, [bankInstructions?.reference]);

  const bankRows = useMemo(() => {
    const source = bankInstructions;
    if (!source) return [];
    return [
      {
        key: "bank_name",
        label: t("auctions.bank_detail_bank_name"),
        value: source.bank_name || "—",
      },
      {
        key: "swift_code",
        label: t("auctions.bank_detail_swift_code"),
        value: source.swift_bic || "—",
      },
      {
        key: "reference",
        label: t("auctions.bank_detail_reference"),
        value: source.reference || "—",
      },
      {
        key: "amount",
        label: t("auctions.field_amount"),
        value: source.amount != null ? String(source.amount) : depositAmount
          ? String(depositAmount)
          : "—",
      },
    ].filter((row) => row.value && row.value !== "—");
  }, [bankInstructions, depositAmount, t]);

  const collectionInfo = useMemo(() => {
    const source =
      method === "managers_check" || method === "cash"
        ? custodyInstructions
        : null;
    if (!source) return null;
    return {
      payee: source.cheque_payee,
      location: source.collection_location,
      address: source.collection_address,
      notice: source.notice,
      reference: source.reference,
    };
  }, [custodyInstructions, method]);

  const copyValue = async (key: string, value: string) => {
    if (!value || value === "—") return;
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

  const handleContinue = () => {
    setFormError(null);

    if (method === "card") {
      onContinue({ method: "card" });
      return;
    }

    if (method === "bank") {
      if (!bankForm.paymentReference.trim()) {
        setFormError(
          t("auctions.payment_reference_required") ||
            "Payment reference is required.",
        );
        return;
      }
      if (!bankForm.evidence) {
        setFormError(
          t("auctions.evidence_required") ||
            "Please upload your transfer receipt.",
        );
        return;
      }
      onContinue({
        method: "bank",
        payment_reference: bankForm.paymentReference.trim(),
        notes: bankForm.notes.trim() || undefined,
        evidence: bankForm.evidence,
      });
      return;
    }

    if (method === "managers_check") {
      if (!checkForm.checkNumber.trim()) {
        setFormError(
          t("auctions.check_number_required") || "Check number is required.",
        );
        return;
      }
      if (!checkForm.date || !checkForm.time) {
        setFormError(
          t("auctions.collection_slot_required") ||
            "Collection date and time are required.",
        );
        return;
      }
      if (!checkForm.pickupAddress.trim()) {
        setFormError(
          t("auctions.pickup_address_required") ||
            "Pickup address is required.",
        );
        return;
      }
      onContinue({
        method: "managers_check",
        check_number: checkForm.checkNumber.trim(),
        collection_date: checkForm.date,
        collection_time: checkForm.time,
        pickup_address: checkForm.pickupAddress.trim(),
        notes: checkForm.notes.trim() || undefined,
      });
      return;
    }

    if (!cashForm.date || !cashForm.time) {
      setFormError(
        t("auctions.collection_slot_required") ||
          "Collection date and time are required.",
      );
      return;
    }
    if (!cashForm.pickupAddress.trim()) {
      setFormError(
        t("auctions.pickup_address_required") || "Pickup address is required.",
      );
      return;
    }
    onContinue({
      method: "cash",
      collection_date: cashForm.date,
      collection_time: cashForm.time,
      pickup_address: cashForm.pickupAddress.trim(),
      notes: cashForm.notes.trim() || undefined,
    });
  };

  return (
    <div
      className="rounded-[20px] border shadow-[0_20px_50px_-24px_rgba(0,0,0,0.18)] p-6 md:p-8"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
      }}
    >
      <div className="mb-6">
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
              {bankInstructions?.notice ||
                t("auctions.bank_transfer_instructions")}
            </p>
          </div>

          {instructionsLoading ? (
            <p className="text-sm" style={{ color: getColor("mutedText") }}>
              {t("common.loading") || "Loading..."}
            </p>
          ) : (
            bankRows.length > 0 && (
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
            )
          )}

          <Input
            label={t("auctions.field_payment_reference")}
            value={bankForm.paymentReference}
            onChange={(e) =>
              setBankForm({ ...bankForm, paymentReference: e.target.value })
            }
            placeholder={t("auctions.field_payment_reference_placeholder")}
          />

          <div>
            <label
              className="block text-[11px] font-medium mb-2"
              style={{ color: getColor("secondaryText") }}
            >
              {t("auctions.field_notes")}
            </label>
            <textarea
              value={bankForm.notes}
              onChange={(e) =>
                setBankForm({ ...bankForm, notes: e.target.value })
              }
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
              {bankForm.evidence?.name || t("auctions.upload_payment_proof")}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,application/pdf,.pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setBankForm({ ...bankForm, evidence: file });
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
          <p className="text-xs" style={{ color: getColor("mutedText") }}>
            {t("auctions.card_fields_hint")}
          </p>
        </div>
      )}

      {(method === "managers_check" || method === "cash") && (
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
              {collectionInfo?.notice ||
                (method === "managers_check"
                  ? t("auctions.check_instructions")
                  : t("auctions.cash_instructions"))}
            </p>
          </div>

          {collectionInfo && (
            <div className="space-y-3">
              {method === "managers_check" && collectionInfo.payee && (
                <div
                  className="rounded-xl border px-4 py-3.5"
                  style={{ borderColor: getColor("border") }}
                >
                  <div
                    className="text-xs mb-0.5"
                    style={{ color: getColor("mutedText") }}
                  >
                    {t("auctions.cheque_payee")}
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: getColor("primaryText") }}
                  >
                    {collectionInfo.payee}
                  </div>
                </div>
              )}
              {collectionInfo.location && (
                <div
                  className="rounded-xl border px-4 py-3.5"
                  style={{ borderColor: getColor("border") }}
                >
                  <div
                    className="text-xs mb-0.5"
                    style={{ color: getColor("mutedText") }}
                  >
                    {t("auctions.field_collection_location")}
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: getColor("primaryText") }}
                  >
                    {collectionInfo.location}
                  </div>
                </div>
              )}
              {collectionInfo.address && (
                <div
                  className="rounded-xl border px-4 py-3.5"
                  style={{ borderColor: getColor("border") }}
                >
                  <div
                    className="text-xs mb-0.5"
                    style={{ color: getColor("mutedText") }}
                  >
                    {t("auctions.field_collection_address")}
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: getColor("primaryText") }}
                  >
                    {collectionInfo.address}
                  </div>
                </div>
              )}
            </div>
          )}

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t("auctions.field_collection_date")}
              type="date"
              icon={<Calendar className="w-4 h-4" />}
              value={method === "managers_check" ? checkForm.date : cashForm.date}
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
              value={method === "managers_check" ? checkForm.time : cashForm.time}
              onChange={(e) =>
                method === "managers_check"
                  ? setCheckForm({ ...checkForm, time: e.target.value })
                  : setCashForm({ ...cashForm, time: e.target.value })
              }
            />
          </div>

          <Input
            label={t("auctions.field_pickup_address")}
            value={
              method === "managers_check"
                ? checkForm.pickupAddress
                : cashForm.pickupAddress
            }
            onChange={(e) =>
              method === "managers_check"
                ? setCheckForm({ ...checkForm, pickupAddress: e.target.value })
                : setCashForm({ ...cashForm, pickupAddress: e.target.value })
            }
            placeholder={t("auctions.field_full_address")}
          />

          <div>
            <label
              className="block text-[11px] font-medium mb-2"
              style={{ color: getColor("secondaryText") }}
            >
              {t("auctions.field_notes")}
            </label>
            <textarea
              value={
                method === "managers_check" ? checkForm.notes : cashForm.notes
              }
              onChange={(e) =>
                method === "managers_check"
                  ? setCheckForm({ ...checkForm, notes: e.target.value })
                  : setCashForm({ ...cashForm, notes: e.target.value })
              }
              placeholder={t("auctions.field_notes_placeholder")}
              rows={3}
              className="w-full rounded-xl border bg-white py-3 px-4 text-sm resize-none outline-none"
              style={{
                borderColor: getColor("border"),
                color: getColor("primaryText"),
              }}
            />
          </div>
        </div>
      )}

      {formError && (
        <p className="text-sm mb-4" style={{ color: "#DC2626" }}>
          {formError}
        </p>
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
          onClick={handleContinue}
          rightIcon={<NextIcon className="w-4 h-4" />}
          disabled={submitting || (method === "bank" && instructionsLoading)}
        >
          {continueLabel}
        </Button>
      </div>
    </div>
  );
}
