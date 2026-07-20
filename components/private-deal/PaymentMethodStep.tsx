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
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, Input } from "@/components/ui";
import Select from "@/components/ui/Select";

export type PaymentMethod =
  | "bank"
  | "card"
  | "managers_check"
  | "cash";

export type PaymentMode = "single" | "split";

export type SplitPaymentStatus = "awaiting" | "completed";

export interface SplitPaymentEntry {
  id: string;
  method: PaymentMethod;
  amount: number;
  notes: string;
  bank?: string;
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
  saving?: boolean;
}

const METHODS: {
  key: PaymentMethod;
  titleKey: string;
  icon: typeof Building2;
}[] = [
  { key: "bank", titleKey: "bank_transfer", icon: Building2 },
  { key: "card", titleKey: "card_payment", icon: CreditCard },
  { key: "managers_check", titleKey: "managers_check", icon: FileCheck },
  { key: "cash", titleKey: "cash_collection", icon: Banknote },
];

const BANKS = [
  { key: "emirates_nbd", label: "Emirates NBD" },
  { key: "fab", label: "First Abu Dhabi Bank" },
  { key: "adcb", label: "ADCB" },
  { key: "mashreq", label: "Mashreq" },
  { key: "dubai_islamic", label: "Dubai Islamic Bank" },
];

function formatAed(amount: number) {
  return `AED ${amount.toLocaleString("en-AE")}`;
}

function parseAmount(value: string) {
  const n = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function createDraft(method: PaymentMethod, remaining: number): DraftSplit {
  return {
    id: `draft-${method}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    method,
    amount: remaining > 0 ? String(remaining) : "",
    notes: "",
    bank: "emirates_nbd",
    accountNumber: "",
    iban: "",
    expanded: true,
  };
}

function methodMeta(method: PaymentMethod) {
  return METHODS.find((m) => m.key === method)!;
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
  saving = false,
}: PaymentMethodStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
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

  useEffect(() => {
    if (mode === "split") {
      onAllocatedChange?.(allocated);
    }
  }, [mode, allocated, onAllocatedChange]);
  const canSave =
    drafts.length > 0 &&
    drafts.every((d) => parseAmount(d.amount) > 0) &&
    Math.abs(draftAllocated - totalAmount) < 0.5;

  const patchDraft = (id: string, patch: Partial<DraftSplit>) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => {
      const next = prev.filter((d) => d.id !== id);
      return next.length ? next : [createDraft("bank", totalAmount)];
    });
  };

  const addMethod = (key: PaymentMethod) => {
    setDrafts((prev) => {
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
        setDrafts([createDraft("bank", totalAmount)]);
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
        className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 ${isRTL ? "sm:flex-row-reverse" : ""}`}
      >
        <div className={isRTL ? "text-right" : "text-left"}>
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
      </div>

      {mode === "single" ? (
        <>
          <div className="space-y-3 mb-8">
            {METHODS.map((item) => {
              const Icon = item.icon;
              const selected = method === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onMethodChange(item.key)}
                  className={`w-full flex items-center gap-4 rounded-2xl border px-4 py-4 transition-all ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
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
                      {t("private-deal.secure_online")}
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
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex items-start gap-3 flex-1 min-w-0 ${isRTL ? "flex-row-reverse text-right" : ""}`}
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
                          {t(`private-deal.${meta.titleKey}`)}
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
                      className={`flex items-center gap-2 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <span
                        className="text-sm font-semibold min-w-[96px]"
                        style={{ color: getColor("primaryText") }}
                      >
                        {formatAed(payment.amount)}
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
                      <button
                        type="button"
                        onClick={() => deleteSaved(payment.id)}
                        className="p-2 rounded-lg hover:text-red-600 hover:bg-red-50"
                        style={{ color: getColor("mutedText") }}
                        aria-label={t("private-deal.delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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
                  bank: p.bank || "emirates_nbd",
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
                    className={`flex items-center gap-3 px-4 py-3.5 ${isRTL ? "flex-row-reverse" : ""}`}
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
                      className={`flex-1 min-w-0 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      <div
                        className="font-medium"
                        style={{ color: getColor("primaryText") }}
                      >
                        {t(`private-deal.${meta.titleKey}`)}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: getColor("mutedText") }}
                      >
                        {t("private-deal.secure_online")}
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
                              value={draft.amount}
                              onChange={(e) =>
                                patchDraft(draft.id, {
                                  amount: e.target.value.replace(/[^\d.]/g, ""),
                                })
                              }
                              placeholder="AED 100,000"
                            />
                            <Select
                              label={t("private-deal.select_bank")}
                              options={BANKS}
                              value={draft.bank}
                              onChange={(v) =>
                                patchDraft(draft.id, { bank: v })
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
                              className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
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
                              className={`w-full rounded-xl border py-3 px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${isRTL ? "text-right" : "text-left"}`}
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
                            value={draft.amount}
                            onChange={(e) =>
                              patchDraft(draft.id, {
                                amount: e.target.value.replace(/[^\d.]/g, ""),
                              })
                            }
                            placeholder="AED 100,000"
                          />
                          <div>
                            <label
                              className={`block text-[11px] font-medium mb-1.5 ${isRTL ? "text-right" : "text-left"}`}
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
                              className={`w-full rounded-xl border py-3 px-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${isRTL ? "text-right" : "text-left"}`}
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

          <div className={`mb-2 ${isRTL ? "text-right" : "text-left"}`}>
            <div
              className="text-sm font-medium mb-2.5"
              style={{ color: getColor("primaryText") }}
            >
              {t("private-deal.add_payment_method")}
            </div>
            <div className="flex flex-wrap gap-2">
              {METHODS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => addMethod(item.key)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
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
                    {t(`private-deal.${item.titleKey}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {!canSave && drafts.length > 0 && (
            <p
              className={`text-xs mt-3 mb-1 ${isRTL ? "text-right" : "text-left"}`}
              style={{ color: getColor("mutedText") }}
            >
              {t("private-deal.split_allocate_hint")} {formatAed(remaining)}
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
            className={`flex items-center border-t pt-6 ${isRTL ? "flex-row-reverse" : ""}`}
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
