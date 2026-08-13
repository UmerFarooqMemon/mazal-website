"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { CountryPhoneInput, DirhamAmount, Input } from "@/components/ui";
import {
  GIFT_PACKAGE_IMAGE,
} from "@/components/private-deal/giftPackages";
import { resolveMediaUrl } from "@/lib/api-config";
import { giftProductAmount, type GiftPackageId } from "@/lib/gift-box";
import type { GiftProduct } from "@/services/products";

export type GiftFlowStep = "package" | "recipient";

export interface GiftFlowData {
  giftPackageId?: GiftPackageId;
  giftRecipientName?: string;
  giftRecipientPhone?: string;
  giftRecipientPhoneCountryIso?: string;
  giftRecipientPhoneDialCode?: string;
  giftRecipientAddress?: string;
  giftRecipientNotes?: string;
}

interface GiftFlowPanelProps {
  data: GiftFlowData;
  step: GiftFlowStep;
  products: GiftProduct[];
  onChange: (patch: Partial<GiftFlowData>) => void;
  phoneError?: string;
  onPhoneErrorClear?: () => void;
}

export default function GiftFlowPanel({
  data,
  step,
  products,
  onChange,
  phoneError,
  onPhoneErrorClear,
}: GiftFlowPanelProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();
  const selectedId = data.giftPackageId || "";
  const accent = "#0F6646";
  const borderMuted = getColor("border");

  if (step === "recipient") {
    return (
      <div className="space-y-4 mb-6">
        <Input
          label={t("private-deal.gift_recipient_name")}
          value={data.giftRecipientName || ""}
          onChange={(e) => onChange({ giftRecipientName: e.target.value })}
          placeholder={t("private-deal.gift_recipient_name_placeholder")}
        />
        <CountryPhoneInput
          label={t("private-deal.gift_recipient_phone")}
          country={data.giftRecipientPhoneCountryIso || "ae"}
          value={data.giftRecipientPhone || ""}
          onChange={(giftRecipientPhone, meta) => {
            onChange({
              giftRecipientPhone,
              giftRecipientPhoneCountryIso: meta.countryIso,
              giftRecipientPhoneDialCode: meta.dialCode,
            });
            onPhoneErrorClear?.();
          }}
          error={phoneError}
          required
        />
        <Input
          label={t("private-deal.gift_recipient_address")}
          value={data.giftRecipientAddress || ""}
          onChange={(e) => onChange({ giftRecipientAddress: e.target.value })}
          placeholder={t("private-deal.gift_recipient_address_placeholder")}
        />
        <div>
          <label
            className="block text-[11px] font-medium mb-1.5 text-start"
            style={{ color: getColor("secondaryText") }}
          >
            {t("private-deal.gift_recipient_notes")}
          </label>
          <textarea
            value={data.giftRecipientNotes || ""}
            onChange={(e) =>
              onChange({ giftRecipientNotes: e.target.value.slice(0, 1000) })
            }
            rows={4}
            maxLength={1000}
            placeholder={t("private-deal.gift_recipient_notes_placeholder")}
            className="w-full rounded-xl border py-3 px-4 text-sm focus:outline-none text-start resize-none"
            style={{
              borderColor: getColor("border"),
              backgroundColor: getColor("surface"),
              color: getColor("primaryText"),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3
        className="text-lg font-serif mb-1 text-start"
        style={{ color: getColor("primaryText") }}
      >
        {t("private-deal.gift_select_package")}
      </h3>
      <p
        className="text-sm mb-4 text-start"
        style={{ color: getColor("secondaryText") }}
      >
        {t("private-deal.gift_select_package_desc")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map((pkg) => {
          const selected = selectedId === pkg.id;
          const ink = selected ? "#FFFFFF" : accent;
          const imageSrc =
            resolveMediaUrl(pkg.image_url) || GIFT_PACKAGE_IMAGE;
          const themeLines = [
            t("private-deal.gift_pkg_theme_floral"),
            pkg.floral_theme,
            pkg.flowers
              ? `${t("private-deal.gift_pkg_flowers_prefix") || "Flowers:"} ${pkg.flowers}`
              : null,
          ].filter(Boolean) as string[];

          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onChange({ giftPackageId: pkg.id })}
              className="rounded-[20px] border p-2.5 text-start transition-colors focus:outline-none focus-visible:ring-2"
              style={{
                borderColor: selected ? accent : borderMuted,
                backgroundColor: selected ? accent : "transparent",
              }}
            >
              <div
                className="rounded-[14px] border px-3 py-2.5 mb-2.5"
                style={{ borderColor: ink }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 shrink-0">
                    <div
                      className="text-[15px] sm:text-base font-bold leading-tight [&_*]:!text-inherit"
                      style={{ color: ink }}
                    >
                      <DirhamAmount amount={giftProductAmount(pkg.price)} />
                    </div>
                    <div
                      className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wide mt-0.5"
                      style={{ color: ink }}
                    >
                      {pkg.name}
                    </div>
                  </div>
                  <div
                    className="text-[8px] sm:text-[9px] leading-[1.35] text-end max-w-[52%]"
                    style={{ color: ink, opacity: selected ? 0.95 : 0.9 }}
                  >
                    {themeLines.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[14px] aspect-[229/149] bg-[#E8DFD0]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt={pkg.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
