"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  FileCheck,
  Banknote,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  Play,
  Wallet,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount, Input } from "@/components/ui";
import BankSelect from "@/components/ui/BankSelect";
import WalletMethodOption from "@/components/wallet/WalletMethodOption";
import CollectionFeeLabel from "@/components/payments/CollectionFeeLabel";
import { formatPriceInput } from "@/lib/card-input";
import {
  resolveMethodCollectionFeeAmount,
  type CollectionFeeMethodOption,
} from "@/lib/collection-fee";
import {
  useWalletPaymentChoice,
  walletCoversAmount,
} from "@/hooks/useWalletPaymentChoice";

export type PaymentMethod =
  | "bank"
  | "card"
  | "managers_check"
  | "cash"
  | "wallet";

export type PaymentMode = "single" | "split";

export type SplitPaymentStatus = "awaiting" | "completed";

export interface SplitPaymentEntry {
  id: string;
  method: PaymentMethod;
  amount: number;
  notes: string;
  bank?: string;
  bankOther?: string;
  accountNumber?: string;
  iban?: string;
  backendPaymentId?: number;
  status: SplitPaymentStatus;
  createdAt: string;
}

interface DraftSplit {
  id: string;
  method: PaymentMethod;
  amount: string;
  notes: string;
  bank: string;
  bankOther: string;
  accountNumber: string;
  iban: string;
  expanded: boolean;
}

interface PaymentMethodStepProps {
  method: PaymentMethod;
  mode: PaymentMode;
  totalAmount: number;
  splitPayments: SplitPaymentEntry[];
  onMethodChange: (method: PaymentMethod) => void;
  onModeChange: (mode: PaymentMode) => void;
  onSplitPaymentsChange: (payments: SplitPaymentEntry[]) => void | Promise<void>;
  onAllocatedChange?: (allocated: number) => void;
  onBack: () => void;
  onContinue: () => void;
  onProcessSplit: (paymentId: string) => void;
  /** Opens the wallet module when Wallet is selected / continued. */
  onOpenWallet?: () => void;
  /** When provided, Wallet click uses this instead of select + onOpenWallet. */
  onWalletClick?: () => void;
  /** Hide the wallet method tile (e.g. when available balance is 0). */
  showWallet?: boolean;
  saving?: boolean;
  /** When false, hides single/split toggle and forces single-payment UI. */
  allowSplit?: boolean;
  /** Allow wallet as an installment method in split mode. */
  allowWalletSplit?: boolean;
  /** Split rows must match totalAmount to the fils (2 decimals). */
  requireExactSum?: boolean;
  minSplitEntries?: number;
  maxSplitEntries?: number;
  /** When false, hide edit/delete on saved installments. */
  allowEditSplits?: boolean;
  /** Top-level cash/cheque collection fee from the flow API. */
  collectionFeeAmount?: string | null;
  /** Per-method fee entries when provided by the API. */
  paymentMethodFees?: CollectionFeeMethodOption[];
}

const METHODS: {
  key: Exclude<PaymentMethod, "wallet">;
  titleKey: string;
  icon: typeof Building2;
}[] = [
  { key: "bank", titleKey: "bank_transfer", icon: Building2 },
  { key: "card", titleKey: "card_payment", icon: CreditCard },
  { key: "managers_check", titleKey: "managers_check", icon: FileCheck },
  { key: "cash", titleKey: "cash_collection", icon: Banknote },
];

function parseAmount(value: string) {
  const n = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function createDraft(
  method: PaymentMethod,
  remaining: number,
): DraftSplit {
  return {
    id: `draft-${method}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    method,
    amount: remaining > 0 ? String(remaining) : "",
    notes: "",
    bank: "fab",
    bankOther: "",
    accountNumber: "",
    iban: "",
    expanded: true,
  };
}

function methodMeta(method: PaymentMethod) {
  if (method === "wallet") {
    return { key: "wallet" as const, titleKey: "wallet_payment", icon: Wallet };
  }
  return METHODS.find((item) => item.key === method)!;
}

export default function PaymentMethodStep({
  method,
  mode,
  totalAmount,
  splitPayments,
  onMethodChange,
  onModeChange,
  onSplitPaymentsChange,
  onAllocatedChange,
  onBack,
  onContinue,
  onProcessSplit,
  onOpenWallet,
  onWalletClick,
  showWallet = true,
  saving = false,
  allowSplit = true,
  allowWalletSplit = false,
  requireExactSum = false,
  minSplitEntries = 1,
  maxSplitEntries = 10,
  allowEditSplits = true,
  collectionFeeAmount,
  paymentMethodFees,
}: PaymentMethodStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const walletChoice = useWalletPaymentChoice(totalAmount);
  const walletVisible = showWallet && walletChoice.showWallet;
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const [drafts, setDrafts] = useState<DraftSplit[]>([]);
  const [showSavedList, setShowSavedList] = useState(
    () => splitPayments.length > 0,
  );

  const draftAllocated = useMemo(
    () => drafts.reduce((sum, d) => sum + parseAmount(d.amount), 0),
    [drafts],
  );
  const savedAllocated = useMemo(
    () => splitPayments.reduce((sum, p) => sum + p.amount, 0),
    [splitPayments],
  );
  const allocated = showSavedList ? savedAllocated : draftAllocated;
  const remaining = Math.max(0, totalAmount - allocated);
  const splitMethodOptions: Array<{
    key: PaymentMethod;
    titleKey: string;
    icon: typeof Building2;
  }> = allowWalletSplit && walletChoice.showWallet
    ? [{ key: "wallet", titleKey: "wallet_payment", icon: Wallet }, ...METHODS]
    : METHODS;

  const methodTitle = (method: PaymentMethod, titleKey: string) =>
    method === "wallet"
      ? t("wallet.pay_from_wallet")
      : t(`private-deal.${titleKey}`);

  const renderMethodSubtitle = (methodKey: PaymentMethod | string) => {
    if (
      resolveMethodCollectionFeeAmount(
        methodKey,
        paymentMethodFees,
        collectionFeeAmount,
      )
    ) {
      return (
        <CollectionFeeLabel
          methodKey={methodKey}
          collectionFeeAmount={collectionFeeAmount}
          paymentMethodFees={paymentMethodFees}
        />
      );
    }
    return t("private-deal.secure_online");
  };

  useEffect(() => {
    if (mode === "split") {
      onAllocatedChange?.(allocated);
    }
  }, [mode, allocated, onAllocatedChange]);
  const amountsMatch = requireExactSum
    ? Math.round(draftAllocated * 100) === Math.round(totalAmount * 100)
    : Math.abs(draftAllocated - totalAmount) < 0.5;
  const canSave =
    drafts.length >= minSplitEntries &&
    drafts.length <= maxSplitEntries &&
    drafts.every((d) => parseAmount(d.amount) > 0) &&
    amountsMatch;

  const patchDraft = (id: string, patch: Partial<DraftSplit>) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => {
      const next = prev.filter((d) => d.id !== id);
      return next.length ? next : [createDraft("bank", totalAmount)];
    });
  };

  const handleWalletSelect = () => {
    onMethodChange("wallet");
    if (!walletChoice.coversAmount) {
      if (onOpenWallet) {
        onOpenWallet();
        return;
      }
      walletChoice.goToWallet();
      return;
    }
    onWalletClick?.();
  };

  const addMethod = (key: PaymentMethod) => {
    if (key === "wallet") {
      const rem =
        totalAmount -
        drafts.reduce((s, d) => s + parseAmount(d.amount), 0);
      const needed = rem > 0 ? rem : totalAmount;
      if (!walletCoversAmount(walletChoice.availableBalance, needed)) {
        walletChoice.goToWallet();
        return;
      }
    }
    setDrafts((prev) => {
      if (prev.length >= maxSplitEntries) return prev;
      const rem =
        totalAmount - prev.reduce((s, d) => s + parseAmount(d.amount), 0);
      return [
        ...prev.map((d) => ({ ...d, expanded: false })),
        createDraft(key, Math.max(0, rem)),
      ];
    });
    setShowSavedList(false);
  };

  const saveSplits = async () => {
    if (!canSave) return;
    const now = new Date().toISOString();
    const saved: SplitPaymentEntry[] = drafts.map((d) => ({
      id: d.id.replace("draft-", "split-"),
      method: d.method,
      amount: parseAmount(d.amount),
      notes: d.notes,
      bank: d.bank,
      bankOther: d.bankOther,
      accountNumber: d.accountNumber,
      iban: d.iban,
      status: "awaiting",
      createdAt: now,
    }));
    await onSplitPaymentsChange(saved);
    setShowSavedList(true);
  };

  const deleteSaved = (id: string) => {
    const next = splitPayments.filter((p) => p.id !== id);
    onSplitPaymentsChange(next);
    if (next.length === 0) {
      setShowSavedList(false);
      setDrafts([createDraft("bank", totalAmount)]);
    }
  };

  const handleModeChange = (next: PaymentMode) => {
    onModeChange(next);
    if (next === "split") {
      if (splitPayments.length > 0) {
        setShowSavedList(true);
      } else {
        setShowSavedList(false);
        if (minSplitEntries >= 2) {
          const first = Math.round((totalAmount / 2) * 100) / 100;
          const second = Math.round((totalAmount - first) * 100) / 100;
          setDrafts([
            createDraft("card", first),
            createDraft("bank", second),
          ]);
        } else {
          setDrafts([createDraft("bank", totalAmount)]);
        }
      }
    }
  };

  const formatSavedDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(locale === "ar" ? "ar-AE" : "en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const methodCardStyle = (selected: boolean) =>
    selected
      ? {
          borderColor: getColor("primary"),
          backgroundColor: `${getColor("primary")}0D`,
        }
      : {
          borderColor: getColor("border"),
          backgroundColor: getColor("surface"),
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
        className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6`}
      >
        <div className="text-start">
          <h2
            className="text-2xl font-serif mb-1"
            style={{ color: getColor("primaryText") }}
          >
            {t("private-deal.payment_title")}
          </h2>
          <p className="text-sm" style={{ color: getColor("secondaryText") }}>
            {t("private-deal.payment_subtitle")}
          </p>
        </div>

        {allowSplit ? (
          <div
            className="inline-flex rounded-full border p-1 self-start"
            style={{
              borderColor: getColor("border"),
              backgroundColor: getColor("primaryLight"),
            }}
          >
            <button
              type="button"
              onClick={() => handleModeChange("single")}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={
                mode === "single"
                  ? {
                      backgroundColor: getColor("primary"),
                      color: "#FFFFFF",
                    }
                  : { color: getColor("secondaryText") }
              }
            >
              {t("private-deal.single_payment")}
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("split")}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={
                mode === "split"
                  ? {
                      backgroundColor: getColor("primary"),
                      color: "#FFFFFF",
                    }
                  : { color: getColor("secondaryText") }
              }
            >
              {t("private-deal.split_payment")}
            </button>
          </div>
        ) : null}
      </div>

      {!allowSplit || mode === "single" ? (
        <>
          <div className="space-y-3 mb-8">
            {walletVisible ? (
              <WalletMethodOption
                selected={method === "wallet"}
                onSelect={handleWalletSelect}
              />
            ) : null}
            {METHODS.map((item) => {
              const Icon = item.icon;
              const selected = method === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onMethodChange(item.key)}
                  className={`w-full flex items-center gap-4 rounded-2xl border px-4 py-4 transition-all text-start`}
                  style={methodCardStyle(selected)}
                >
                  <div
                    className="size-10 rounded-xl flex items-center justify-center shrink-0"
                    style={
                      selected
                        ? {
                            backgroundColor: `${getColor("primary")}1A`,
                            color: getColor("primary"),
                          }
                        : {
                            backgroundColor: getColor("primaryLight"),
                            color: getColor("secondaryText"),
                          }
                    }
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-medium"
                      style={{ color: getColor("primaryText") }}
                    >
                      {t(`private-deal.${item.titleKey}`)}
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: getColor("mutedText") }}
                    >
                      {renderMethodSubtitle(item.key)}
                    </div>
                  </div>
                  <div
                    className="size-5 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{
                      borderColor: selected
                        ? getColor("primary")
                        : getColor("border"),
                    }}
                  >
                    {selected && (
                      <div
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: getColor("primary") }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            className={`flex items-center justify-between border-t pt-6`}
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
              disabled={saving}
            >
              {saving ? t("private-deal.processing") : t("private-deal.continue")}
            </Button>
          </div>
        </>
      ) : showSavedList ? (
        <>
          <div className="space-y-3 mb-6">
            {splitPayments.map((payment) => {
              const meta = methodMeta(payment.method);
              const Icon = meta.icon;
              return (
                <div
                  key={payment.id}
                  className="rounded-2xl border px-4 py-4"
                  style={{
                    borderColor: getColor("border"),
                    backgroundColor: getColor("primaryLight"),
                  }}
                >
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center gap-4`}
                  >
                    <div
                      className={`flex items-start gap-3 flex-1 min-w-0 text-start`}
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
                      <div className="min-w-0">
                        <div
                          className="font-medium"
                          style={{ color: getColor("primaryText") }}
                        >
                        {methodTitle(payment.method, meta.titleKey)}
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: getColor("mutedText") }}
                        >
                          {t("private-deal.plate_transfer")}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: getColor("mutedText") }}
                        >
                          {formatSavedDate(payment.createdAt)}
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center rounded-full text-[11px] font-medium px-2.5 py-1 shrink-0"
                        style={{
                          backgroundColor: `${getColor("primary")}14`,
                          color: getColor("primary"),
                        }}
                      >
                        {payment.status === "completed"
                          ? t("private-deal.completed")
                          : t("private-deal.awaiting_payment")}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 shrink-0`}
                    >
                      <span
                        className="text-sm font-semibold min-w-[96px]"
                        style={{ color: getColor("primaryText") }}
                      >
                        <DirhamAmount amount={payment.amount} weight="semibold" />
                      </span>
                      {payment.status !== "completed" && (
                        <button
                          type="button"
                          onClick={() => onProcessSplit(payment.id)}
                          className="inline-flex items-center gap-1.5 rounded-full border text-sm font-medium px-3 py-1.5"
                          style={{
                            borderColor: getColor("primary"),
                            color: getColor("primary"),
                          }}
                        >
                          <Play className="w-3.5 h-3.5" />
                          {t("private-deal.process")}
                        </button>
                      )}
                      {allowEditSplits && payment.status !== "completed" && (
                        <button
                          type="button"
                          onClick={() => deleteSaved(payment.id)}
                          className="p-2 rounded-lg hover:text-red-600 hover:bg-red-50"
                          style={{ color: getColor("mutedText") }}
                          aria-label={t("private-deal.delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {allowEditSplits ? (
          <button
            type="button"
            onClick={() => {
              setShowSavedList(false);
              setDrafts(
                splitPayments.map((p) => ({
                  id: `draft-${p.id}`,
                  method: p.method,
                  amount: String(p.amount),
                  notes: p.notes,
                  bank: p.bank || "fab",
                  bankOther: p.bankOther || "",
                  accountNumber: p.accountNumber || "",
                  iban: p.iban || "",
                  expanded: false,
                })),
              );
            }}
            className="text-sm font-medium hover:underline mb-6"
            style={{ color: getColor("primary") }}
          >
            {t("private-deal.edit_split_payments")}
          </button>
          ) : null}

          <div
            className={`flex items-center justify-between border-t pt-6`}
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
        </>
      ) : (
        <>
          <div className="space-y-4 mb-5">
            {drafts.map((draft) => {
              const meta = methodMeta(draft.method);
              const Icon = meta.icon;
              return (
                <div
                  key={draft.id}
                  className="rounded-2xl border overflow-hidden"
                  style={{ borderColor: getColor("border") }}
                >
                  <div
                    className={`flex items-center gap-3 px-4 py-3.5`}
                    style={{ backgroundColor: getColor("primaryLight") }}
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
                    <div
                      className={`flex-1 min-w-0 text-start`}
                    >
                      <div
                        className="font-medium"
                        style={{ color: getColor("primaryText") }}
                      >
                        {methodTitle(draft.method, meta.titleKey)}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: getColor("mutedText") }}
                      >
                        {renderMethodSubtitle(draft.method)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        patchDraft(draft.id, { expanded: !draft.expanded })
                      }
                      className="p-1.5"
                      style={{ color: getColor("secondaryText") }}
                    >
                      {draft.expanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDraft(draft.id)}
                      className="p-1.5 hover:text-red-600"
                      style={{ color: getColor("mutedText") }}
                      aria-label={t("private-deal.delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {draft.expanded && (
                    <div
                      className="px-4 pb-4 pt-3 border-t space-y-3"
                      style={{ borderColor: getColor("border") }}
                    >
                      {draft.method === "bank" ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                              label={t("private-deal.amount")}
                              value={
                                draft.amount
                                  ? formatPriceInput(draft.amount)
                                  : ""
                              }
                              onChange={(e) =>
                                patchDraft(draft.id, {
                                  amount: e.target.value.replace(/\D/g, ""),
                                })
                              }
                              placeholder="100,000"
                              inputMode="numeric"
                            />
                            <BankSelect
                              label={t("private-deal.select_bank")}
                              value={draft.bank}
                              otherValue={draft.bankOther}
                              onChange={(v) =>
                                patchDraft(draft.id, { bank: v })
                              }
                              onOtherChange={(v) =>
                                patchDraft(draft.id, { bankOther: v })
                              }
                              placeholder={t("private-deal.select_bank")}
                            />
                          </div>
                          <Input
                            label={t("private-deal.account_number")}
                            value={draft.accountNumber}
                            onChange={(e) =>
                              patchDraft(draft.id, {
                                accountNumber: e.target.value,
                              })
                            }
                            placeholder="100,000"
                          />
                          <Input
                            label={t("private-deal.iban")}
                            value={draft.iban}
                            onChange={(e) =>
                              patchDraft(draft.id, { iban: e.target.value })
                            }
                            placeholder="AE07 0331 2345 6789 0123 456"
                          />
                          <div>
                            <label
                              className={`block text-[11px] font-medium mb-1.5 text-start`}
                              style={{ color: getColor("secondaryText") }}
                            >
                              {t("private-deal.notes")}
                            </label>
                            <textarea
                              value={draft.notes}
                              onChange={(e) =>
                                patchDraft(draft.id, { notes: e.target.value })
                              }
                              placeholder={t("private-deal.notes_placeholder")}
                              rows={3}
                              className={`w-full rounded-xl border py-3 px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 text-start`}
                              style={{
                                borderColor: getColor("border"),
                                backgroundColor: getColor("surface"),
                                color: getColor("primaryText"),
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <Input
                            label={t("private-deal.amount")}
                            value={
                              draft.amount
                                ? formatPriceInput(draft.amount)
                                : ""
                            }
                            onChange={(e) =>
                              patchDraft(draft.id, {
                                amount: e.target.value.replace(/\D/g, ""),
                              })
                            }
                            placeholder="100,000"
                            inputMode="numeric"
                          />
                          <div>
                            <label
                              className={`block text-[11px] font-medium mb-1.5 text-start`}
                              style={{ color: getColor("secondaryText") }}
                            >
                              {t("private-deal.notes")}
                            </label>
                            <textarea
                              value={draft.notes}
                              onChange={(e) =>
                                patchDraft(draft.id, { notes: e.target.value })
                              }
                              placeholder={t("private-deal.notes_placeholder")}
                              rows={3}
                              className={`w-full rounded-xl border py-3 px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 text-start`}
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
                  )}
                </div>
              );
            })}
          </div>

          <div className={`mb-2 text-start`}>
            <div
              className="text-sm font-medium mb-2.5"
              style={{ color: getColor("primaryText") }}
            >
              {t("private-deal.add_payment_method")}
            </div>
            <div className="flex flex-wrap gap-2">
              {splitMethodOptions.map((item) => {
                const Icon = item.icon;
                const atMax = drafts.length >= maxSplitEntries;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => addMethod(item.key)}
                    disabled={atMax}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors disabled:opacity-40`}
                    style={{
                      borderColor: getColor("border"),
                      backgroundColor: getColor("surface"),
                      color: getColor("secondaryText"),
                    }}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: getColor("primary") }}
                    />
                    <Icon className="w-3.5 h-3.5" />
                    {methodTitle(item.key, item.titleKey)}
                  </button>
                );
              })}
            </div>
          </div>

          {!canSave && drafts.length > 0 && (
            <p
              className={`text-xs mt-3 mb-1 text-start`}
              style={{ color: getColor("mutedText") }}
            >
              {t("private-deal.split_allocate_hint")}{" "}
              <DirhamAmount amount={remaining} />
            </p>
          )}

          <Button
            variant="primary"
            size="md"
            fullWidth
            className="mt-5 mb-6"
            onClick={saveSplits}
            disabled={saving || !canSave}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {saving
              ? t("private-deal.processing")
              : t("private-deal.save_split_payment")}
          </Button>

          <div
            className={`flex items-center border-t pt-6`}
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
        </>
      )}
    </div>
  );
}
