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
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme, type ThemeColors } from "@/context/ThemeContext";
import PayTabsManagedForm from "@/components/payments/PayTabsManagedForm";
import CollectionSlotPicker from "@/components/payments/CollectionSlotPicker";
import { Button, DirhamAmount, Input } from "@/components/ui";
import { formatPriceInput } from "@/lib/card-input";
import { useCollectionSlots } from "@/hooks/useCollectionSlots";
import { findCollectionSlot } from "@/services/collection-slots";
import BankSelect from "@/components/ui/BankSelect";
import { usePayTabsConfig } from "@/hooks/usePayTabsConfig";
import { resolveBankLabel } from "@/lib/uae-banks";
import type { PaymentMethod, SplitPaymentEntry } from "./PaymentMethodStep";

type GetColor = (key: keyof ThemeColors) => string;

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
    collectionSlotId?: number;
    pickupAddress?: string;
    amount?: number;
  }) => void;
  submitting?: boolean;
  custodyInstructions?: Record<string, unknown>;
  onCardPay?: (paymentToken: string) => void | Promise<void>;
  /** When set, the amount field can be increased (not below this floor). */
  minAmount?: number;
  onAmountChange?: (amount: number) => void;
}

const METHOD_META: Record<
  PaymentMethod,
  { titleKey: string; icon: typeof Building2 }
> = {
  bank: { titleKey: "bank_transfer", icon: Building2 },
  card: { titleKey: "card_payment", icon: CreditCard },
  managers_check: { titleKey: "managers_check", icon: FileCheck },
  cash: { titleKey: "cash_collection", icon: Banknote },
  wallet: { titleKey: "wallet_payment", icon: Wallet },
};

function parseMoneyInput(value: string) {
  const parsed = Number(String(value).replace(/\D/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function ReadOnlyAmountField({
  label,
  amount,
  getColor,
}: {
  label: string;
  amount: number;
  getColor: GetColor;
}) {
  return (
    <div className="w-full">
      <label
        className="block text-[11px] font-medium leading-none mb-2 text-start"
        style={{ color: getColor("secondaryText") }}
      >
        {label}
      </label>
      <div
        className="w-full rounded-xl border bg-white py-3.5 text-sm text-start ps-4"
        style={{
          borderColor: getColor("border"),
          color: getColor("primaryText"),
        }}
      >
        <DirhamAmount amount={amount} />
      </div>
    </div>
  );
}

function InstructionsBox({
  title,
  body,
  getColor,
}: {
  title: string;
  body: string;
  getColor: GetColor;
}) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: `${getColor("primary")}26`,
        backgroundColor: `${getColor("primary")}0D`,
      }}
    >
      <div
        className="flex items-center gap-2 text-sm font-medium mb-2"
        style={{ color: getColor("primaryText") }}
      >
        <Info
          className="w-4 h-4 shrink-0"
          style={{ color: getColor("primary") }}
        />
        {title}
      </div>
      <p
        className="text-sm leading-relaxed text-start"
        style={{ color: getColor("secondaryText") }}
      >
        {body}
      </p>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  icon,
  getColor,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  getColor: GetColor;
}) {
  if (!value) return null;
  return (
    <div className="w-full">
      <label
        className="block text-[11px] font-medium leading-none mb-2 text-start"
        style={{ color: getColor("secondaryText") }}
      >
        {label}
      </label>
      <div
        className={`relative w-full rounded-xl border bg-white py-3.5 text-sm text-start ${icon ? "ps-10 pe-4" : "px-4"}`}
        style={{
          borderColor: getColor("border"),
          color: getColor("primaryText"),
          backgroundColor: getColor("primaryLight"),
        }}
      >
        {icon ? (
          <div
            className="absolute inset-y-0 start-3 flex items-center"
            style={{ color: getColor("mutedText") }}
          >
            {icon}
          </div>
        ) : null}
        {value}
      </div>
    </div>
  );
}

export default function SplitPaymentProcessStep({
  payment,
  onBack,
  onComplete,
  submitting = false,
  custodyInstructions,
  onCardPay,
  minAmount,
  onAmountChange,
}: SplitPaymentProcessStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const paytabs = usePayTabsConfig(locale);
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  const meta = METHOD_META[payment.method];
  const Icon = meta.icon;
  const fileRef = useRef<HTMLInputElement>(null);

  const [proofName, setProofName] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [bankTransfer, setBankTransfer] = useState({
    paymentReference: "",
    bank: payment.bank || "fab",
    bankOther: payment.bankOther || "",
    accountNumber: payment.accountNumber || "",
    notes: payment.notes || "",
  });
  const needsSlots =
    payment.method === "managers_check" || payment.method === "cash";
  const {
    slots,
    error: slotsError,
    refresh: refreshSlots,
  } = useCollectionSlots({ enabled: needsSlots });
  const [collectionDate, setCollectionDate] = useState("");
  const [collectionTime, setCollectionTime] = useState("");

  const [check, setCheck] = useState({
    number: "",
    pickupAddress: "",
    notes: payment.notes || "",
  });
  const [cash, setCash] = useState({
    pickupAddress: "",
    notes: payment.notes || "",
  });
  const amountEditable = minAmount != null && minAmount > 0;
  const amountFloor = amountEditable ? minAmount : payment.amount;
  const [amountInput, setAmountInput] = useState(() =>
    formatPriceInput(String(payment.amount || minAmount || 0)),
  );

  const resolveAmount = () =>
    Math.max(parseMoneyInput(amountInput), amountFloor || 0);

  const commitAmount = () => {
    const next = resolveAmount();
    setAmountInput(next > 0 ? formatPriceInput(String(next)) : amountInput);
    onAmountChange?.(next);
    return next;
  };

  const amountField = (label: string) =>
    amountEditable ? (
      <Input
        label={label}
        inputMode="numeric"
        value={amountInput}
        onChange={(e) => {
          setAmountInput(formatPriceInput(e.target.value));
          const next = parseMoneyInput(e.target.value);
          if (next >= amountFloor) onAmountChange?.(next);
        }}
        onBlur={commitAmount}
      />
    ) : (
      <ReadOnlyAmountField
        label={label}
        amount={payment.amount}
        getColor={getColor}
      />
    );

  const custodyAddress = String(
    custodyInstructions?.collection_address || "",
  ).trim();
  const custodyIban = String(custodyInstructions?.iban || "").trim();
  const custodyBankName = String(custodyInstructions?.bank_name || "").trim();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (payment.method === "bank") {
      if (!bankTransfer.paymentReference.trim()) {
        errors.paymentReference =
          t("private-deal.error_payment_reference_required") ||
          "Payment reference is required.";
      }
      if (!proofFile) {
        errors.evidence =
          t("private-deal.error_evidence_required") ||
          "Payment evidence is required.";
      }
      const last4 = bankTransfer.accountNumber.replace(/\D/g, "").slice(-4);
      if (
        bankTransfer.accountNumber.trim() &&
        last4.length > 0 &&
        last4.length !== 4
      ) {
        errors.accountNumber =
          t("private-deal.error_account_last4") ||
          "Account number must include at least 4 digits.";
      }
    }

    if (payment.method === "managers_check") {
      if (!check.number.trim()) {
        errors.checkNumber =
          t("private-deal.error_check_number_required") ||
          "Check number is required.";
      }
      if (!findCollectionSlot(slots, collectionDate, collectionTime)) {
        errors.collectionSlot =
          t("private-deal.collection_slot_required") ||
          "Please choose an available collection date and time.";
      }
      if (!check.pickupAddress.trim()) {
        errors.pickupAddress =
          t("private-deal.pickup_address_required") ||
          "Pickup address is required.";
      }
    }

    if (payment.method === "cash") {
      if (!findCollectionSlot(slots, collectionDate, collectionTime)) {
        errors.collectionSlot =
          t("private-deal.collection_slot_required") ||
          "Please choose an available collection date and time.";
      }
      if (!cash.pickupAddress.trim()) {
        errors.pickupAddress =
          t("private-deal.pickup_address_required") ||
          "Pickup address is required.";
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      toast.error(first);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    let resolvedSlotId: number | undefined;
    if (needsSlots) {
      const latest = await refreshSlots();
      const slot = findCollectionSlot(latest, collectionDate, collectionTime);
      if (!slot) {
        const message =
          t("private-deal.collection_slot_unavailable") ||
          t("private-deal.collection_slot_required") ||
          "That collection slot is no longer available. Please choose another.";
        toast.error(message);
        return;
      }
      resolvedSlotId = slot.id;
    }

    if (!validate()) return;
    const amount = commitAmount();

    if (payment.method === "bank") {
      const senderBankName = resolveBankLabel(
        bankTransfer.bank,
        bankTransfer.bankOther,
      );
      const senderAccountLast4 = bankTransfer.accountNumber
        .replace(/\D/g, "")
        .slice(-4);
      onComplete({
        paymentReference: bankTransfer.paymentReference.trim(),
        senderBankName: senderBankName || undefined,
        senderAccountLast4: senderAccountLast4 || undefined,
        notes: bankTransfer.notes,
        evidence: proofFile,
        amount,
      });
      return;
    }

    if (payment.method === "card") {
      onComplete({ amount });
      return;
    }

    if (payment.method === "managers_check") {
      onComplete({
        checkNumber: check.number.trim(),
        collectionSlotId: resolvedSlotId,
        pickupAddress: check.pickupAddress.trim(),
        notes: check.notes,
        amount,
      });
      return;
    }

    onComplete({
      collectionSlotId: resolvedSlotId,
      pickupAddress: cash.pickupAddress.trim(),
      notes: cash.notes,
      amount,
    });
  };

  const ctaLabel =
    payment.method === "card"
      ? t("private-deal.continue")
      : payment.method === "bank"
        ? t("private-deal.transfer_completed")
        : t("private-deal.pay_now");

  const showManagedCardForm =
    payment.method === "card" &&
    paytabs.managedFormEnabled &&
    Boolean(paytabs.clientKey) &&
    Boolean(onCardPay);

  return (
    <div
      className="rounded-[20px] border shadow-[0_20px_50px_-24px_rgba(1,15,81,0.25)] p-5 sm:p-6 md:p-8"
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
          className="flex items-center gap-3 px-4 py-3.5 border-b"
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
          <div className="min-w-0 text-start">
            <div
              className="font-medium"
              style={{ color: getColor("primaryText") }}
            >
              {payment.method === "wallet"
                ? t("wallet.pay_from_wallet")
                : t(`private-deal.${meta.titleKey}`)}
            </div>
            <div className="text-sm" style={{ color: getColor("mutedText") }}>
              {t("private-deal.secure_online")}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-5 space-y-4">
          {payment.method === "bank" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {amountField(t("private-deal.amount"))}
                <BankSelect
                  label={t("private-deal.select_bank")}
                  value={bankTransfer.bank}
                  otherValue={bankTransfer.bankOther}
                  onChange={(v) =>
                    setBankTransfer((prev) => ({ ...prev, bank: v }))
                  }
                  onOtherChange={(v) =>
                    setBankTransfer((prev) => ({ ...prev, bankOther: v }))
                  }
                  placeholder={t("private-deal.select_bank")}
                />
              </div>
              <Input
                label={t("private-deal.account_number")}
                value={bankTransfer.accountNumber}
                onChange={(e) =>
                  setBankTransfer((prev) => ({
                    ...prev,
                    accountNumber: e.target.value,
                  }))
                }
                placeholder="100,000"
                error={fieldErrors.accountNumber}
              />
              <ReadOnlyField
                label={t("private-deal.iban")}
                value={custodyIban}
                getColor={getColor}
              />
              {!custodyIban && custodyBankName ? (
                <ReadOnlyField
                  label={t("private-deal.select_bank")}
                  value={custodyBankName}
                  getColor={getColor}
                />
              ) : null}
              <Input
                label={t("private-deal.payment_reference")}
                value={bankTransfer.paymentReference}
                onChange={(e) => {
                  setBankTransfer((prev) => ({
                    ...prev,
                    paymentReference: e.target.value,
                  }));
                  if (fieldErrors.paymentReference) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.paymentReference;
                      return next;
                    });
                  }
                }}
                placeholder="BANK-TRANSFER-REFERENCE-001"
                error={fieldErrors.paymentReference}
              />
              <div>
                <label
                  className="block text-[11px] font-medium mb-1.5 text-start"
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.notes")}
                </label>
                <textarea
                  value={bankTransfer.notes}
                  onChange={(e) =>
                    setBankTransfer((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder={t("private-deal.notes_placeholder")}
                  className="w-full rounded-xl border py-3 px-4 text-sm focus:outline-none focus:ring-2 text-start"
                  style={{
                    borderColor: getColor("border"),
                    backgroundColor: getColor("surface"),
                    color: getColor("primaryText"),
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-[11px] font-medium mb-1.5 text-start"
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.upload_payment_proof")}
                </label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-xl border border-dashed py-10 px-4 text-center transition-colors"
                  style={{
                    borderColor: fieldErrors.evidence
                      ? "#FCA5A5"
                      : getColor("border"),
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
                {fieldErrors.evidence ? (
                  <p className="mt-1.5 text-xs text-red-500 text-start">
                    {fieldErrors.evidence}
                  </p>
                ) : null}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProofName(file.name);
                      setProofFile(file);
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.evidence;
                        return next;
                      });
                    }
                  }}
                />
              </div>
            </>
          )}

          {payment.method === "card" && amountEditable
            ? amountField(t("private-deal.amount"))
            : null}

          {payment.method === "card" && showManagedCardForm && (
            <PayTabsManagedForm
              clientKey={paytabs.clientKey!}
              submitLabel={
                t("private-deal.pay_now") || t("listings.pay_with_paytabs")
              }
              loading={submitting}
              onToken={(token) => {
                commitAmount();
                void onCardPay!(token);
              }}
            />
          )}

          {payment.method === "card" && !showManagedCardForm && (
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: `${getColor("primary")}26`,
                backgroundColor: `${getColor("primary")}0D`,
              }}
            >
              <p
                className="text-sm leading-relaxed text-start"
                style={{ color: getColor("secondaryText") }}
              >
                {paytabs.loading
                  ? t("listings.loading_payment_form") ||
                    "Loading secure payment form…"
                  : t("private-deal.card_redirect_notice")}
              </p>
            </div>
          )}

          {payment.method === "managers_check" && (
            <>
              {amountField(t("private-deal.check_amount"))}
              <InstructionsBox
                title={t("private-deal.instructions")}
                body={t("private-deal.managers_check_instructions")}
                getColor={getColor}
              />
              <Input
                label={t("private-deal.check_number")}
                value={check.number}
                onChange={(e) => setCheck({ ...check, number: e.target.value })}
                placeholder="eg. 000123"
                error={fieldErrors.checkNumber}
              />
              <div>
                <label
                  className="block text-[11px] font-medium mb-1.5 text-start"
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.collection_address")}
                </label>
                <textarea
                  value={check.pickupAddress}
                  onChange={(e) =>
                    setCheck({ ...check, pickupAddress: e.target.value })
                  }
                  rows={3}
                  placeholder={
                    custodyAddress || t("private-deal.full_street_address")
                  }
                  className="w-full rounded-xl border py-3 px-4 text-sm focus:outline-none focus:ring-2 text-start"
                  style={{
                    borderColor: fieldErrors.pickupAddress
                      ? getColor("error")
                      : getColor("border"),
                    backgroundColor: getColor("surface"),
                    color: getColor("primaryText"),
                  }}
                />
                {fieldErrors.pickupAddress && (
                  <p
                    className="text-[10px] mt-1.5 text-start"
                    style={{ color: getColor("error") }}
                  >
                    {fieldErrors.pickupAddress}
                  </p>
                )}
              </div>
              <CollectionSlotPicker
                slots={slots}
                date={collectionDate}
                time={collectionTime}
                onDateChange={setCollectionDate}
                onTimeChange={setCollectionTime}
                dateLabel={t("private-deal.collection_date")}
                timeLabel={t("private-deal.collection_time")}
                timePlaceholder={
                  t("private-deal.collection_time_placeholder") || "--:--"
                }
                pickDateFirstLabel={
                  t("private-deal.collection_time_pick_date") ||
                  "Select a date first"
                }
                loadError={slotsError}
                error={fieldErrors.collectionSlot}
              />
              <div>
                <label
                  className="block text-[11px] font-medium mb-1.5 text-start"
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.notes")}
                </label>
                <textarea
                  value={check.notes}
                  onChange={(e) =>
                    setCheck({ ...check, notes: e.target.value })
                  }
                  rows={3}
                  placeholder={t("private-deal.notes_placeholder")}
                  className="w-full rounded-xl border py-3 px-4 text-sm focus:outline-none focus:ring-2 text-start"
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
              {amountField(t("private-deal.amount"))}
              <InstructionsBox
                title={t("private-deal.instructions")}
                body={t("private-deal.cash_collection_instructions")}
                getColor={getColor}
              />
              <div>
                <label
                  className="block text-[11px] font-medium mb-1.5 text-start"
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.collection_address")}
                </label>
                <textarea
                  value={cash.pickupAddress}
                  onChange={(e) =>
                    setCash({ ...cash, pickupAddress: e.target.value })
                  }
                  rows={3}
                  placeholder={
                    custodyAddress || t("private-deal.full_street_address")
                  }
                  className="w-full rounded-xl border py-3 px-4 text-sm focus:outline-none focus:ring-2 text-start"
                  style={{
                    borderColor: fieldErrors.pickupAddress
                      ? getColor("error")
                      : getColor("border"),
                    backgroundColor: getColor("surface"),
                    color: getColor("primaryText"),
                  }}
                />
                {fieldErrors.pickupAddress && (
                  <p
                    className="text-[10px] mt-1.5 text-start"
                    style={{ color: getColor("error") }}
                  >
                    {fieldErrors.pickupAddress}
                  </p>
                )}
              </div>
              <CollectionSlotPicker
                slots={slots}
                date={collectionDate}
                time={collectionTime}
                onDateChange={setCollectionDate}
                onTimeChange={setCollectionTime}
                dateLabel={t("private-deal.collection_date")}
                timeLabel={t("private-deal.collection_time")}
                timePlaceholder={
                  t("private-deal.collection_time_placeholder") || "--:--"
                }
                pickDateFirstLabel={
                  t("private-deal.collection_time_pick_date") ||
                  "Select a date first"
                }
                loadError={slotsError}
                error={fieldErrors.collectionSlot}
              />
              <div>
                <label
                  className="block text-[11px] font-medium mb-1.5 text-start"
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("private-deal.notes")}
                </label>
                <textarea
                  value={cash.notes}
                  onChange={(e) => setCash({ ...cash, notes: e.target.value })}
                  rows={3}
                  placeholder={t("private-deal.notes_placeholder")}
                  className="w-full rounded-xl border py-3 px-4 text-sm focus:outline-none focus:ring-2 text-start"
                  style={{
                    borderColor: getColor("border"),
                    backgroundColor: getColor("surface"),
                    color: getColor("primaryText"),
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t pt-6 mt-6"
        style={{ borderColor: getColor("border") }}
      >
        <Button
          variant="outline"
          size="md"
          onClick={onBack}
          leftIcon={<BackIcon className="w-4 h-4" />}
          disabled={submitting}
          className="w-full sm:w-auto"
        >
          {t("private-deal.back")}
        </Button>
        {!showManagedCardForm && (
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={submitting || (payment.method === "card" && paytabs.loading)}
            rightIcon={<NextIcon className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            {submitting ? t("private-deal.processing") : ctaLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
