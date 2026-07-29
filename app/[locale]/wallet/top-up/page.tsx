"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamSymbolIcon, Input } from "@/components/ui";
import type { StepItem } from "@/components/private-deal/Stepper";
import WalletFlowHeader from "@/components/wallet/WalletFlowHeader";
import { WALLET_PAGE_BG } from "@/components/wallet/theme";
import { useWallet } from "@/hooks/useWallet";
import type { WalletFundingSource } from "@/components/wallet/types";

type TopUpStep = 0 | 1 | 2;

export default function WalletTopUpPage() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();
  const wallet = useWallet();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const [step, setStep] = useState<TopUpStep>(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<WalletFundingSource>("card");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [notes, setNotes] = useState("");
  const [proofName, setProofName] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const steps: StepItem[] = useMemo(() => {
    const labels = [
      t("wallet.step_select_payment"),
      t("wallet.step_payment_details"),
      t("wallet.step_submit_request"),
    ];
    return labels.map((label, index) => ({
      key: `topup-${index}`,
      label,
      status:
        done || step > index
          ? "completed"
          : step === index
            ? "current"
            : "upcoming",
    }));
  }, [done, step, t]);

  const parsedAmount = Number(amount);

  const goBack = () => {
    if (done) {
      router.push(`/${locale}/wallet`);
      return;
    }
    if (step === 0) {
      router.push(`/${locale}/wallet`);
      return;
    }
    setStep((prev) => (prev - 1) as TopUpStep);
    setError("");
  };

  const goNext = () => {
    setError("");
    if (step === 0) {
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        setError(t("wallet.topup_invalid_amount"));
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      if (method === "card") {
        if (!cardHolder.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
          setError(t("wallet.cash_out_missing_bank"));
          return;
        }
      }
      setStep(2);
      return;
    }

    const reference =
      method === "card"
        ? cardNumber.replace(/\s/g, "").slice(-4) || "4242"
        : "Bank transfer";
    wallet.topUp(parsedAmount, method, reference);
    setDone(true);
    toast.success(t("wallet.topup_success_title"));
  };

  const methodTile = (key: WalletFundingSource, title: string, Icon: typeof CreditCard) => {
    const selected = method === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => setMethod(key)}
        className="w-full flex items-center gap-4 rounded-2xl border px-4 py-4 transition-all text-start"
        style={
          selected
            ? {
                borderColor: getColor("primary"),
                backgroundColor: `${getColor("primary")}0D`,
              }
            : {
                borderColor: getColor("border"),
                backgroundColor: getColor("surface"),
              }
        }
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
        <div className="flex-1 min-w-0">
          <div className="font-medium" style={{ color: getColor("primaryText") }}>
            {title}
          </div>
          <div className="text-sm" style={{ color: getColor("mutedText") }}>
            {t("wallet.secure_online")}
          </div>
        </div>
        <div
          className="size-5 rounded-full border-2 flex items-center justify-center shrink-0"
          style={{
            borderColor: selected ? getColor("primary") : getColor("border"),
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
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: WALLET_PAGE_BG }}>
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <WalletFlowHeader
          badge={t("wallet.topup_badge")}
          title={t("wallet.topup_title")}
          subtitle={t("wallet.topup_subtitle")}
          steps={steps}
        />
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-[20px] border shadow-[0_20px_50px_-24px_rgba(0,0,0,0.18)] p-6 md:p-8"
            style={{
              backgroundColor: getColor("surface"),
              borderColor: getColor("border"),
            }}
          >
            {done ? (
              <div className="text-center py-6">
                <div
                  className="size-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{
                    backgroundColor: `${getColor("primary")}14`,
                    color: getColor("primary"),
                  }}
                >
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2
                  className="text-2xl font-serif mb-2"
                  style={{ color: getColor("primaryText") }}
                >
                  {t("wallet.topup_success_title")}
                </h2>
                <p
                  className="text-sm mb-8"
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("wallet.topup_success_desc")}
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push(`/${locale}/wallet`)}
                >
                  {t("wallet.back_to_wallet")}
                </Button>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <>
                    <h2
                      className="text-2xl font-serif mb-1"
                      style={{ color: getColor("primaryText") }}
                    >
                      {t("wallet.topup_amount_title")}
                    </h2>
                    <p
                      className="text-sm mb-6"
                      style={{ color: getColor("secondaryText") }}
                    >
                      {t("wallet.topup_amount_subtitle")}
                    </p>

                    <Input
                      label={t("wallet.amount")}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={amount}
                      onChange={(event) => {
                        setAmount(event.target.value);
                        setError("");
                      }}
                      placeholder="0.00"
                      icon={<DirhamSymbolIcon className="w-3.5 h-3.5" />}
                      className="mb-5"
                    />

                    <div className="space-y-3 mb-2">
                      <p
                        className="text-sm font-medium"
                        style={{ color: getColor("primaryText") }}
                      >
                        {t("wallet.topup_method_title")}
                      </p>
                      {methodTile("card", t("wallet.method_card"), CreditCard)}
                      {methodTile("bank", t("wallet.method_bank"), Building2)}
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <h2
                      className="text-2xl font-serif mb-1"
                      style={{ color: getColor("primaryText") }}
                    >
                      {t("wallet.topup_details_title")}
                    </h2>
                    <p
                      className="text-sm mb-6"
                      style={{ color: getColor("secondaryText") }}
                    >
                      {t("wallet.topup_details_subtitle")}
                    </p>

                    {method === "card" ? (
                      <div className="space-y-3.5">
                        <Input
                          label={t("wallet.field_card_holder")}
                          value={cardHolder}
                          onChange={(event) => setCardHolder(event.target.value)}
                        />
                        <Input
                          label={t("wallet.field_card_number")}
                          value={cardNumber}
                          onChange={(event) => setCardNumber(event.target.value)}
                          placeholder="**** **** **** ****"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label={t("wallet.field_expiry")}
                            value={expiry}
                            onChange={(event) => setExpiry(event.target.value)}
                            placeholder="MM/YY"
                          />
                          <Input
                            label={t("wallet.field_cvv")}
                            value={cvv}
                            onChange={(event) => setCvv(event.target.value)}
                            placeholder="***"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div>
                          <label
                            className="block text-[11px] font-medium mb-2"
                            style={{ color: getColor("secondaryText") }}
                          >
                            {t("wallet.field_notes")}
                          </label>
                          <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder={t("wallet.field_notes_placeholder")}
                            rows={3}
                            className="w-full rounded-xl border bg-white py-3 px-4 text-sm resize-none outline-none"
                            style={{
                              borderColor: getColor("border"),
                              color: getColor("primaryText"),
                            }}
                          />
                        </div>
                        <label
                          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 cursor-pointer text-center"
                          style={{
                            borderColor: getColor("border"),
                            backgroundColor: getColor("primaryLight"),
                            color: getColor("secondaryText"),
                          }}
                        >
                          <Upload
                            className="w-5 h-5"
                            style={{ color: getColor("primary") }}
                          />
                          <span className="text-sm font-medium">
                            {proofName || t("wallet.upload_payment_proof")}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            onChange={(event) =>
                              setProofName(event.target.files?.[0]?.name || "")
                            }
                          />
                        </label>
                      </div>
                    )}
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2
                      className="text-2xl font-serif mb-1"
                      style={{ color: getColor("primaryText") }}
                    >
                      {t("wallet.step_submit_request")}
                    </h2>
                    <p
                      className="text-sm mb-6"
                      style={{ color: getColor("secondaryText") }}
                    >
                      {t("wallet.topup_success_desc")}
                    </p>

                    <div
                      className="rounded-2xl border px-4 py-4 space-y-3"
                      style={{ borderColor: getColor("border") }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm"
                          style={{ color: getColor("mutedText") }}
                        >
                          {t("wallet.amount")}
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: getColor("primaryText") }}
                        >
                          {parsedAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm"
                          style={{ color: getColor("mutedText") }}
                        >
                          {t("wallet.step_select_payment")}
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: getColor("primaryText") }}
                        >
                          {method === "card"
                            ? t("wallet.method_card")
                            : t("wallet.method_bank")}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <p className="text-xs mt-4" style={{ color: getColor("error") }}>
                    {error}
                  </p>
                )}

                <div
                  className="flex items-center justify-between border-t pt-6 mt-6"
                  style={{ borderColor: getColor("border") }}
                >
                  <Button
                    variant="outline"
                    size="md"
                    onClick={goBack}
                    leftIcon={<BackIcon className="w-4 h-4" />}
                  >
                    {t("wallet.back")}
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={goNext}
                    rightIcon={<NextIcon className="w-4 h-4" />}
                  >
                    {step === 2
                      ? t("wallet.submit_topup")
                      : t("wallet.continue")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
