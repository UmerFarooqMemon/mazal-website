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
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, Input } from "@/components/ui";
import Select from "@/components/ui/Select";
import type { PaymentMethod, SplitPaymentEntry } from "./PaymentMethodStep";

interface SplitPaymentProcessStepProps {
  payment: SplitPaymentEntry;
  onBack: () => void;
  onComplete: () => void;
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

const CARD_TYPES = [
  { key: "visa", label: "Visa" },
  { key: "mastercard", label: "Mastercard" },
  { key: "amex", label: "American Express" },
];

function formatAed(amount: number) {
  return `AED ${amount.toLocaleString("en-AE")}`;
}

export default function SplitPaymentProcessStep({
  payment,
  onBack,
  onComplete,
}: SplitPaymentProcessStepProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const meta = METHOD_META[payment.method];
  const Icon = meta.icon;
  const fileRef = useRef<HTMLInputElement>(null);

  const [proofName, setProofName] = useState("");
  const [card, setCard] = useState({
    type: "",
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [check, setCheck] = useState({
    number: "",
    location: "",
    address: "",
    date: "",
    time: "",
  });
  const [cash, setCash] = useState({
    location: "",
    address: "",
    date: "",
    time: "",
  });

  const ctaLabel =
    payment.method === "bank"
      ? t("private-deal.transfer_completed")
      : t("private-deal.pay_now");

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
          {payment.method === "bank" && (
            <>
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
                    if (file) setProofName(file.name);
                  }}
                />
              </div>
            </>
          )}

          {payment.method === "card" && (
            <>
              <Select
                label={t("private-deal.card_type")}
                options={CARD_TYPES}
                value={card.type}
                onChange={(v) => setCard({ ...card, type: v })}
                placeholder={t("private-deal.select_card_type")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t("private-deal.card_holder_name")}
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  placeholder={t("private-deal.name_on_card")}
                />
                <Input
                  label={t("private-deal.card_number")}
                  value={card.number}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      number: e.target.value
                        .replace(/[^\d\s]/g, "")
                        .slice(0, 19),
                    })
                  }
                  placeholder="1234 1234 1234 1234"
                />
                <Input
                  label={t("private-deal.expiry")}
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  placeholder="MM/YY"
                />
                <Input
                  label={t("private-deal.cvv")}
                  value={card.cvv}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                    })
                  }
                  placeholder="***"
                />
              </div>
            </>
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
              <Input
                label={t("private-deal.collection_location")}
                value={check.location}
                onChange={(e) =>
                  setCheck({ ...check, location: e.target.value })
                }
                placeholder="eg. Dubai Marina"
                icon={<MapPin className="w-4 h-4" />}
              />
              <Input
                label={t("private-deal.collection_address")}
                value={check.address}
                onChange={(e) =>
                  setCheck({ ...check, address: e.target.value })
                }
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
              <Input
                label={t("private-deal.collection_location")}
                value={cash.location}
                onChange={(e) =>
                  setCash({ ...cash, location: e.target.value })
                }
                placeholder="eg. Dubai Marina"
                icon={<MapPin className="w-4 h-4" />}
              />
              <Input
                label={t("private-deal.collection_address")}
                value={cash.address}
                onChange={(e) => setCash({ ...cash, address: e.target.value })}
                placeholder={t("private-deal.full_street_address")}
              />
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
            </>
          )}

          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={onComplete}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {ctaLabel}
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
