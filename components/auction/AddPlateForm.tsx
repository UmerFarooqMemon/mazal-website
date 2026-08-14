"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Search,
  Upload,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button, DirhamAmount, Input } from "@/components/ui";
import Select from "@/components/ui/Select";
import NumberPlateDisplay from "@/components/ui/NumberPlateDisplay";
import type { PlatePreviewConfig } from "@/lib/plate-preview";
import { formatPriceInput } from "@/lib/card-input";

interface AddPlateFormProps {
  onBack: () => void;
  onContinue: (draft: AuctionPlateDraft) => void;
  submitting?: boolean;
}

export interface AuctionPlateDraft {
  title: string;
  emirate: string;
  plate_variant?: string;
  plate_type?: string;
  plate_design?: string;
  plate_code?: string;
  plate_digits: string;
  asking_price: number;
  description?: string;
  ownership_document: File;
}

interface PlateCodeItem {
  code: string;
  label: string;
  show_on_preview: boolean;
}

interface Variant {
  key: string;
  label: string;
  plate_type: string;
  plate_design: string;
  has_code: boolean;
  fields?: string[];
  plate_codes?: (string | PlateCodeItem)[] | null;
  digits?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  preview?: PlatePreviewConfig;
}

export default function AddPlateForm({
  onBack,
  onContinue,
  submitting = false,
}: AddPlateFormProps) {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const isRTL = locale === "ar";
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const [form, setForm] = useState({
    emirate: "dubai",
    plateVariant: "private_new_colorful",
    code: "",
    digits: "",
    notes: "",
    price: 0,
  });
  const [ownershipFile, setOwnershipFile] = useState<File | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);
  const [codeSearch, setCodeSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const codeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/number-plates/options?locale=${locale}`)
      .then((r) => r.json())
      .then((res) => {
        const emirates = res?.data?.emirates || [];
        const dubai = emirates.find(
          (e: { key: string }) => e.key === "dubai",
        );
        const nextVariants: Variant[] = dubai?.variants || [];
        setVariants(nextVariants);

        if (
          nextVariants.length > 0 &&
          !nextVariants.some((v) => v.key === form.plateVariant)
        ) {
          const first = nextVariants[0];
          setForm((prev) => ({
            ...prev,
            plateVariant: first.key,
            emirate: "dubai",
          }));
        }
      })
      .catch(console.error);
    // Intentionally only re-fetch when locale changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        codeDropdownRef.current &&
        !codeDropdownRef.current.contains(e.target as Node)
      ) {
        setCodeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedVariant =
    variants.find((v) => v.key === form.plateVariant) || variants[0];
  const variantFields = selectedVariant?.fields || [
    "plate_code",
    "plate_digits",
  ];
  const showCodeField =
    variantFields.includes("plate_code") &&
    (selectedVariant?.has_code ?? true);
  const variantDigits = selectedVariant?.digits;
  const rawPlateCodes = selectedVariant?.plate_codes || [];

  const variantPlateCodes: PlateCodeItem[] = Array.isArray(rawPlateCodes)
    ? rawPlateCodes.map((item) =>
        typeof item === "string"
          ? { code: item, label: item, show_on_preview: true }
          : item && typeof item === "object" && "code" in item
            ? item
            : {
                code: String(item),
                label: String(item),
                show_on_preview: true,
              },
      )
    : [];

  const filteredCodes = variantPlateCodes.filter((c) =>
    String(c.code || "")
      .toLowerCase()
      .includes(String(codeSearch || "").toLowerCase()),
  );

  const handleCodeSelect = (code: string) => {
    setForm((prev) => ({ ...prev, code }));
    setCodeDropdownOpen(false);
    setCodeSearch("");
  };

  const canContinue =
    Boolean(form.plateVariant) &&
    Boolean(form.digits.trim()) &&
    (!showCodeField || Boolean(form.code.trim())) &&
    Boolean(ownershipFile) &&
    form.price > 0;

  const handleSubmit = () => {
    if (!canContinue || !ownershipFile) return;

    setError(null);
    const title =
      `${form.emirate} ${form.code ? `${form.code} ` : ""}${form.digits}`.trim();
    const plateType = selectedVariant?.plate_type;
    const plateDesign = selectedVariant?.plate_design;

    onContinue({
      title,
      emirate: form.emirate,
      plate_variant: form.plateVariant || undefined,
      plate_type: plateType || undefined,
      plate_design: plateDesign || undefined,
      plate_code: showCodeField ? form.code || undefined : undefined,
      plate_digits: form.digits,
      asking_price: form.price,
      description: form.notes || undefined,
      ownership_document: ownershipFile,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.9fr] gap-5 lg:gap-6 items-start">
      <div
        className="rounded-[20px] border shadow-[0_20px_50px_-24px_rgba(0,0,0,0.16)] p-6 md:p-8"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <h2
          className={`text-2xl font-serif mb-6 text-start`}
          style={{ color: getColor("primaryText") }}
        >
          {t("auctions.add_plate_title")}
        </h2>

        <div className="space-y-5 mb-4">
          <div>
            <label
              className={`block text-[11px] font-medium mb-1.5 text-start`}
              style={{ color: getColor("secondaryText") }}
            >
              {t("listings.emirate")}
            </label>
            <div
              className={`w-full rounded-xl border py-3 px-4 text-sm text-start`}
              style={{
                backgroundColor: `${getColor("background")}80`,
                borderColor: getColor("border"),
                color: getColor("primaryText"),
              }}
            >
              {t("listings.emirate_dubai")}
            </div>
          </div>

          <Select
            label={t("private-deal.plate_variant")}
            options={variants}
            value={form.plateVariant}
            onChange={(value) => {
              const newVariant = variants.find((v) => v.key === value);
              const newFields = newVariant?.fields || [
                "plate_code",
                "plate_digits",
              ];
              setForm((prev) => ({
                ...prev,
                plateVariant: value,
                code: newFields.includes("plate_code") ? prev.code : "",
                digits: "",
              }));
            }}
            placeholder={t("common.select")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {showCodeField ? (
              variantPlateCodes.length > 0 ? (
                <div ref={codeDropdownRef}>
                  <label
                    className={`block text-[11px] font-medium mb-1.5 text-start`}
                    style={{ color: getColor("secondaryText") }}
                  >
                    {t("listings.code")}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCodeDropdownOpen(!codeDropdownOpen)}
                      className={`w-full rounded-xl border bg-white py-3 px-4 text-sm flex items-center justify-between transition-all text-start`}
                      style={{
                        borderColor: getColor("border"),
                        color: form.code
                          ? getColor("primaryText")
                          : getColor("mutedText"),
                      }}
                    >
                      <span>
                        {form.code || t("private-deal.select_code")}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${codeDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {codeDropdownOpen && (
                      <div
                        className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border overflow-hidden"
                        style={{ borderColor: getColor("border") }}
                      >
                        <div
                          className="p-2 border-b"
                          style={{ borderColor: getColor("border") }}
                        >
                          <div className="relative">
                            <Search
                              className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 start-3`}
                              style={{ color: getColor("mutedText") }}
                            />
                            <input
                              type="text"
                              placeholder={t("common.search")}
                              value={codeSearch}
                              onChange={(e) => setCodeSearch(e.target.value)}
                              className={`w-full py-2 text-sm bg-transparent focus:outline-none ps-8 pe-3 text-start`}
                              style={{ color: getColor("primaryText") }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto">
                          {filteredCodes.length > 0 ? (
                            filteredCodes.map((item) => (
                              <button
                                key={item.code}
                                type="button"
                                onClick={() => handleCodeSelect(item.code)}
                                className={`w-full px-4 py-2.5 text-sm transition-colors text-start`}
                                style={{
                                  color:
                                    item.code === form.code
                                      ? getColor("primary")
                                      : getColor("primaryText"),
                                  backgroundColor:
                                    item.code === form.code
                                      ? `${getColor("primary")}10`
                                      : "transparent",
                                }}
                              >
                                {item.label}
                              </button>
                            ))
                          ) : (
                            <div
                              className="px-4 py-3 text-xs"
                              style={{ color: getColor("mutedText") }}
                            >
                              {t("common.no_results")}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Input
                  name="code"
                  label={t("listings.code")}
                  type="text"
                  placeholder="M"
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                />
              )
            ) : (
              <div>
                <label
                  className={`block text-[11px] font-medium mb-1.5 text-start`}
                  style={{ color: getColor("secondaryText") }}
                >
                  {t("listings.code")}
                </label>
                <div
                  className={`w-full rounded-xl border py-3 px-4 text-sm text-start`}
                  style={{
                    backgroundColor: `${getColor("background")}80`,
                    borderColor: getColor("border"),
                    color: getColor("mutedText"),
                  }}
                >
                  {t("private-deal.digits_only")}
                </div>
              </div>
            )}

            <Input
              name="digits"
              label={t("listings.digits")}
              type="text"
              placeholder={
                variantDigits?.min
                  ? `${variantDigits.min}-${variantDigits.max || ""} digits`
                  : "1234"
              }
              maxLength={variantDigits?.max}
              value={form.digits}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  digits: e.target.value.replace(/\D/g, ""),
                }))
              }
            />
          </div>

          <Input
            name="price"
            label={t("auctions.field_amount")}
            type="text"
            inputMode="numeric"
            value={form.price ? formatPriceInput(String(form.price)) : ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                price: Number(e.target.value.replace(/\D/g, "")) || 0,
              }))
            }
            placeholder="0"
          />
        </div>

        <div className="mb-4">
          <label
            className={`block text-[11px] font-medium mb-2 text-start`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("auctions.field_seller_notes")}
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder={t("auctions.field_notes_short")}
            rows={3}
            className="w-full rounded-xl border bg-white py-3 px-4 text-sm resize-none outline-none"
            style={{
              borderColor: getColor("border"),
              color: getColor("primaryText"),
            }}
          />
        </div>

        <div className="mb-8">
          <label
            className={`block text-[11px] font-medium mb-2 text-start`}
            style={{ color: getColor("secondaryText") }}
          >
            {t("auctions.field_ownership")}
          </label>
          <label
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 cursor-pointer`}
            style={{
              borderColor: getColor("border"),
              backgroundColor: getColor("surface"),
              color: getColor("mutedText"),
            }}
          >
            <span className="text-sm truncate">
              {ownershipFile?.name || t("auctions.upload_document")}
            </span>
            <Upload className="w-4 h-4 shrink-0" style={{ color: getColor("primary") }} />
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file && file.size > 5 * 1024 * 1024) {
                  setError(
                    t("auctions.ownership_too_large") ||
                      "Ownership document must be 5MB or less.",
                  );
                  setOwnershipFile(null);
                  return;
                }
                setError(null);
                setOwnershipFile(file);
              }}
            />
          </label>
        </div>

        {error && (
          <p className="text-sm mb-4" style={{ color: "#DC2626" }}>
            {error}
          </p>
        )}

        <div
          className={`flex items-center justify-between border-t pt-6`}
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
            onClick={handleSubmit}
            disabled={!canContinue || submitting}
            rightIcon={<NextIcon className="w-4 h-4" />}
          >
            {submitting
              ? t("common.loading") || "Loading..."
              : t("auctions.continue")}
          </Button>
        </div>
      </div>

      <div
        className="rounded-[20px] border shadow-[0_20px_50px_-24px_rgba(0,0,0,0.16)] p-6 md:p-8 lg:sticky lg:top-24"
        style={{
          backgroundColor: getColor("surface"),
          borderColor: getColor("border"),
        }}
      >
        <div
          className={`text-[10px] font-bold uppercase tracking-[0.12em] mb-4 text-start`}
          style={{ color: getColor("mutedText") }}
        >
          {t("auctions.live_preview")}
        </div>

        <div className="mb-5 px-1">
          <NumberPlateDisplay
            plate_code={showCodeField ? form.code : ""}
            plate_digits={form.digits}
            emirate={t("listings.emirate_dubai")}
            plateVariant={form.plateVariant}
            preview={selectedVariant?.preview}
            crop="auction-preview"
            wrapperClassName="w-full overflow-hidden rounded-lg"
            showCode={showCodeField}
          />
        </div>

        <div
          className={`flex items-end justify-between gap-3 border-t pt-5 text-start`}
          style={{ borderColor: getColor("border") }}
        >
          <span
            className="font-serif text-[18px]"
            style={{ color: getColor("primaryText") }}
          >
            {t("auctions.total_amount")}
          </span>
          <span
            className="font-serif text-[28px] font-bold"
            style={{ color: getColor("primary") }}
          >
            <DirhamAmount amount={form.price} weight="bold" />
          </span>
        </div>
      </div>
    </div>
  );
}
