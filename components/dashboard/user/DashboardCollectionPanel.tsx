"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MoreVertical, Plus, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input } from "@/components/ui";
import { formatCardExpiry, formatCardNumber, cardNumberMaxLength } from "@/lib/card-input";
import Select from "@/components/ui/Select";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import { normalizeAcceptLanguage } from "@/lib/api-config";
import type { CollectionMode } from "./types";
import { dashPanel, useDashTheme } from "./theme";

export type CollectionRow = {
  id: string | number;
  plate_code?: string;
  plate_digits: string;
  emirate?: string;
  plateType?: string;
  plateDesign?: string;
  preview?: unknown;
  addedAt?: string;
  valuatedAt?: string;
  valueMin?: number;
  valueMax?: number;
};

function formatStamp(value?: string) {
  if (!value) return "02 June, 2026 10:00 PM";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function DashboardCollectionPanel({
  mode,
  onModeChange,
  rows,
}: {
  mode: CollectionMode;
  onModeChange: (mode: CollectionMode) => void;
  rows: CollectionRow[];
}) {
  const { t, locale } = useLocale();
  const {
    DASH_BORDER,
    DASH_BTN,
    DASH_MUTED,
    DASH_TEXT,
    DASH_SURFACE,
    DASH_GREEN,
  } = useDashTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const { token, isAuthenticated } = useAuth();

  if (mode === "subscribe") {
    return (
      <SubscribeView
        onBack={() => onModeChange("list")}
        BackIcon={BackIcon}
      />
    );
  }

  if (mode === "add") {
    return (
      <AddPlateView
        onBack={() => onModeChange("list")}
        onSuccess={() => onModeChange("list")}
        BackIcon={BackIcon}
        token={token}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  return (
    <section
      className={dashPanel}
      style={{ borderColor: DASH_BORDER, backgroundColor: DASH_SURFACE }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-6"
        style={{ borderColor: DASH_BORDER }}
      >
        <div className="text-start">
          <h2 className="font-serif text-2xl font-normal" style={{ color: DASH_TEXT }}>
            {t("dashboard.collection_title")}
          </h2>
          <p className="mt-1 text-sm" style={{ color: DASH_MUTED }}>
            {t("dashboard.edit_reflected")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="primary"
            size="md"
            className="h-[38px] rounded-full px-5 text-sm font-medium"
            style={{ background: DASH_BTN }}
            onClick={() => onModeChange("subscribe")}
          >
            {t("dashboard.subscribe")}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            className="h-[38px] rounded-full px-5 text-sm font-medium"
            style={{ background: DASH_BTN }}
            onClick={() => onModeChange("add")}
          >
            {t("dashboard.add_new")}
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm" style={{ color: DASH_MUTED }}>
          {t("dashboard.no_collection")}
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: DASH_BORDER }}>
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-6 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8"
            >
              <div className="w-full max-w-[345px] text-start">
                <NumberPlateDisplay
                  plate_code={row.plate_code}
                  plate_digits={row.plate_digits}
                  emirate={row.emirate}
                  preview={row.preview as never}
                  plateType={row.plateType}
                  plateDesign={row.plateDesign}
                  crop="card"
                  wrapperClassName="w-full overflow-hidden"
                />
                <p className="mt-2 text-base text-black">
                  {t("dashboard.added_to_collection")}: {formatStamp(row.addedAt)}
                </p>
              </div>

              <div className="flex min-w-[172px] flex-col text-start">
                <p className="text-xs font-semibold uppercase tracking-wide text-black">
                  {t("dashboard.assessed_market_value")}
                </p>
                <p className="mt-1 text-base text-black">
                  {(row.valueMin ?? 4_000_000).toLocaleString("en-AE")} -{" "}
                  {(row.valueMax ?? 4_250_000).toLocaleString("en-AE")}
                </p>
              </div>

              <div className="flex min-w-[185px] flex-col text-start">
                <p className="text-xs font-semibold uppercase tracking-wide text-black">
                  {t("dashboard.valuated_on")}
                </p>
                <p className="mt-1 text-base text-black">
                  {formatStamp(row.valuatedAt)}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/${locale}/certificates/request`}
                  className="inline-flex h-[38px] items-center rounded-full px-5 text-sm font-medium text-white"
                  style={{ background: DASH_BTN }}
                >
                  {t("dashboard.order_certificate")}
                </Link>
                <button
                  type="button"
                  className="inline-flex h-[35px] w-[35px] items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(1,92,20,0.05)" }}
                  aria-label={t("common.more") || "More"}
                >
                  <MoreVertical className="h-4 w-4 text-[var(--color-primary)]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SubscribeView({
  onBack,
  BackIcon,
}: {
  onBack: () => void;
  BackIcon: typeof ArrowLeft;
}) {
  const { t } = useLocale();
  const {
    DASH_BORDER,
    DASH_BTN,
    DASH_GREEN,
    DASH_GREEN_DARK,
    DASH_MUTED,
    DASH_TEXT,
    DASH_SURFACE,
  } = useDashTheme();
  const [selected, setSelected] = useState(false);
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  return (
    <section
      className={dashPanel}
      style={{ borderColor: DASH_BORDER, backgroundColor: DASH_SURFACE }}
    >
      <div
        className="border-b px-6 py-6 text-start"
        style={{ borderColor: DASH_BORDER }}
      >
        <h2 className="font-serif text-2xl font-normal" style={{ color: DASH_TEXT }}>
          {t("dashboard.periodic_title")}
        </h2>
        <p className="mt-1 max-w-xl text-sm" style={{ color: DASH_MUTED }}>
          {t("dashboard.periodic_subtitle")}
        </p>
      </div>

      <div className="grid gap-8 px-6 py-8 lg:grid-cols-[340px_1fr]">
        <div
          className="rounded-[18px] border p-6"
          style={{
            borderColor: selected ? DASH_GREEN : DASH_BORDER,
          }}
        >
          <div
            className="mb-4 flex h-[53px] w-[53px] items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(15,102,70,0.08)" }}
          >
            <span className="text-xl text-[var(--color-primary)]">★</span>
          </div>
          <p className="font-serif text-[28px] text-[var(--color-primary)]">
            {t("dashboard.standard_plan")}
          </p>
          <p className="mt-1 font-serif text-[28px] leading-9 text-[var(--color-primary)]">
            AED 89{" "}
            <span className="text-lg font-normal">
              {t("dashboard.per_valuation")}
            </span>
          </p>
          <ul className="mt-5 space-y-3 border-t pt-4 text-sm" style={{ borderColor: DASH_BORDER, color: DASH_GREEN_DARK }}>
            <li>{t("dashboard.periodic_feature_1")}</li>
            <li>{t("dashboard.periodic_feature_2")}</li>
            <li>{t("dashboard.periodic_feature_3")}</li>
          </ul>
          <button
            type="button"
            onClick={() => setSelected(true)}
            className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full text-xs font-medium text-white"
            style={{ background: DASH_BTN }}
          >
            {t("dashboard.select_plan")}
          </button>
        </div>

        <div className="space-y-4">
          <Input
            label={t("dashboard.card_number")}
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
            autoComplete="cc-number"
            maxLength={cardNumberMaxLength()}
            value={card.number}
            onChange={(e) =>
              setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("dashboard.expiration")}
              placeholder="MM / YY"
              inputMode="numeric"
              maxLength={7}
              value={card.expiry}
              onChange={(e) =>
                setCard((c) => ({
                  ...c,
                  expiry: formatCardExpiry(e.target.value),
                }))
              }
            />
            <Input
              label={t("dashboard.security_code")}
              placeholder="CVC"
              inputMode="numeric"
              maxLength={4}
              value={card.cvc}
              onChange={(e) =>
                setCard((c) => ({
                  ...c,
                  cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                }))
              }
            />
          </div>
          <Input
            label={t("dashboard.card_holder")}
            placeholder={t("dashboard.card_holder")}
            value={card.name}
            onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
          />
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              leftIcon={<BackIcon className="h-4 w-4" />}
            >
              {t("common.back")}
            </Button>
            <Button
              type="button"
              variant="primary"
              style={{ background: DASH_BTN }}
              onClick={() => {
                toast.success(
                  t("dashboard.subscribe_thanks") || "Plan selected.",
                );
                onBack();
              }}
            >
              {t("dashboard.proceed")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AddPlateView({
  onBack,
  onSuccess,
  BackIcon,
  token,
  isAuthenticated,
}: {
  onBack: () => void;
  onSuccess: () => void;
  BackIcon: typeof ArrowLeft;
  token?: string | null;
  isAuthenticated: boolean;
}) {
  const { t, locale } = useLocale();
  const { DASH_BORDER, DASH_BTN, DASH_MUTED, DASH_TEXT, DASH_SURFACE, DASH_BG } =
    useDashTheme();
  const [options, setOptions] = useState<{
    emirates?: { key: string; label: string }[];
  } | null>(null);
  const [emirate, setEmirate] = useState("dubai");
  const [code, setCode] = useState("");
  const [digits, setDigits] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/number-plates/options?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => setOptions(data.data))
      .catch(() => setOptions(null));
  }, [locale]);

  const emirates = useMemo(
    () =>
      (options?.emirates || []).map((item) => ({
        key: item.key,
        label: item.label,
      })),
    [options],
  );

  const submit = async () => {
    if (!isAuthenticated || !token) {
      toast.error(t("common.login_required"));
      return;
    }
    if (!digits.trim()) {
      toast.error(t("portfolio.add_plate_digits_required") || "Digits required");
      return;
    }
    if (!file) {
      toast.error(t("portfolio.add_plate_mulkiya_required"));
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("title", `${emirate} ${code} ${digits}`.trim());
      form.append("contact_number", "0501234567");
      form.append("emirate", emirate);
      form.append("plate_variant", "private_new_colorful");
      if (code) form.append("plate_code", code);
      form.append("plate_digits", digits);
      form.append("price", "0");
      form.append("mulkiya", file, file.name);
      const response = await fetch("/api/number-plates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": normalizeAcceptLanguage(locale),
        },
        body: form,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Submission failed");
      toast.success(t("portfolio.add_plate_success"));
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("common.error_submission"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className={`${dashPanel} p-6 md:p-8`}
      style={{ borderColor: DASH_BORDER, backgroundColor: DASH_SURFACE }}
    >
      <p className="text-xs" style={{ color: DASH_MUTED }}>
        {t("dashboard.collection_crumb")}
      </p>
      <h2 className="mt-1 font-serif text-2xl font-normal" style={{ color: DASH_TEXT }}>
        {t("dashboard.add_plate_title")}
      </h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-[475px_1fr]">
        <div className="space-y-4">
          <Select
            label={t("listings.emirate")}
            options={emirates.length ? emirates : [{ key: "dubai", label: "Dubai" }]}
            value={emirate}
            onChange={setEmirate}
          />
          <Input
            label={t("listings.code")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="K"
          />
          <Input
            label={t("listings.digits")}
            value={digits}
            onChange={(e) => setDigits(e.target.value)}
            placeholder="55"
          />
          <div>
            <p className="mb-1.5 text-xs" style={{ color: DASH_MUTED }}>
              {t("dashboard.mulkiya_label")}
            </p>
            <label
              className="flex h-[38px] cursor-pointer items-center gap-2 rounded-lg border bg-[var(--color-surface)] px-3 text-sm"
              style={{ borderColor: DASH_BORDER, color: DASH_MUTED }}
            >
              <Upload className="h-4 w-4" />
              {file ? file.name : t("dashboard.upload_document")}
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs" style={{ color: DASH_MUTED }}>
            {t("listings.preview")}
          </p>
          <div
            className="overflow-hidden rounded-xl border p-4"
            style={{ borderColor: DASH_BORDER, backgroundColor: DASH_BG }}
          >
            <NumberPlateDisplay
              plate_code={code}
              plate_digits={digits || "55"}
              emirate={emirate}
              crop="card"
              wrapperClassName="w-full overflow-hidden"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          leftIcon={<BackIcon className="h-4 w-4" />}
          className="h-[43px] min-w-[229px]"
        >
          {t("common.back")}
        </Button>
        <Button
          type="button"
          variant="primary"
          loading={submitting}
          onClick={submit}
          style={{ background: DASH_BTN }}
          className="h-[43px]"
        >
          {t("dashboard.order_certificate")}
        </Button>
      </div>
    </section>
  );
}
