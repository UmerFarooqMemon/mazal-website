"use client";

import PlateWithOverlay from "@/components/ui/PlateWithOverlay";
import { useLocale } from "@/context/LocaleContext";
import {
  getDefaultPlatePreview,
  resolvePreviewFromLookup,
  usePlatePreviewLookup,
} from "@/hooks/usePlatePreviewLookup";
import { DEAL_SUMMARY_FONT_SCALE } from "@/lib/number-plate-preview-render";
import type { PlatePreviewConfig } from "@/lib/plate-preview";

export type PlateCropVariant =
  | "form"
  | "live-preview"
  | "card"
  | "certificate"
  | "hero"
  | "compact"
  | "deal-summary"
  | "auction-preview";

const CROP_CLASS: Record<PlateCropVariant, string> = {
  form: "plate-crop--form",
  "live-preview": "plate-crop--live-preview",
  card: "plate-crop--card",
  certificate: "plate-crop--certificate",
  hero: "plate-crop--hero",
  compact: "plate-crop--compact",
  "deal-summary": "plate-crop--deal-summary",
  "auction-preview": "plate-crop--auction-preview",
};

interface NumberPlateDisplayProps {
  plate_code?: string;
  plate_digits: string;
  emirate?: string;
  preview?: PlatePreviewConfig | null;
  plateVariant?: string;
  plateType?: string;
  plateDesign?: string;
  crop?: PlateCropVariant;
  hideCode?: boolean;
  showCode?: boolean;
  className?: string;
  wrapperClassName?: string;
  width?: number;
  scaleFontToWidth?: boolean;
  fontScaleMultiplier?: number;
  /** Old plate only: scale for letter code (default from OLD_PLATE_ALPHABET_FONT_SCALE). */
  oldPlateAlphabetScale?: number;
  /** Old plate only: scale for digits (default from OLD_PLATE_DIGITS_FONT_SCALE). */
  oldPlateDigitsScale?: number;
}

export default function NumberPlateDisplay({
  plate_code = "",
  plate_digits,
  emirate,
  preview,
  plateVariant,
  plateType,
  plateDesign,
  crop = "form",
  hideCode = false,
  showCode,
  className = "",
  wrapperClassName = "w-full overflow-hidden",
  width,
  scaleFontToWidth = false,
  fontScaleMultiplier: fontScaleMultiplierProp,
  oldPlateAlphabetScale,
  oldPlateDigitsScale,
}: NumberPlateDisplayProps) {
  const { locale } = useLocale();
  const { lookup, variantsByKey } = usePlatePreviewLookup(locale);

  const resolvedPreview =
    preview ||
    resolvePreviewFromLookup(lookup, {
      plateVariant,
      plateType,
      plateDesign,
    }) ||
    getDefaultPlatePreview(lookup);

  const variantMeta = plateVariant ? variantsByKey[plateVariant] : undefined;
  // When code is hidden, API often strips plate_code — still show a blurred letter unless
  // the variant explicitly has no code field. Listing payloads carry overlays but
  // no variant key, so there the overlay config decides whether a code exists.
  const showCodeField =
    showCode !== undefined
      ? showCode
      : !variantMeta && preview?.overlays
        ? Boolean(preview.overlays.plate_code)
        : (variantMeta?.fields?.includes("plate_code") ?? true) &&
          (variantMeta?.has_code ?? (Boolean(plate_code) || hideCode));

  const usesPlateWidthFont = crop === "deal-summary";
  const fontScaleMultiplier =
    fontScaleMultiplierProp ??
    (crop === "deal-summary" ? DEAL_SUMMARY_FONT_SCALE : 1);

  return (
    <div dir="ltr" lang="en" className={wrapperClassName}>
      <div className={`plate-crop ${CROP_CLASS[crop]}`}>
        <PlateWithOverlay
          plate_code={showCodeField ? plate_code : ""}
          plate_digits={plate_digits}
          emirate={emirate}
          preview={resolvedPreview || undefined}
          plateVariant={plateVariant}
          plateType={plateType || resolvedPreview?.plate_type}
          plateDesign={plateDesign || resolvedPreview?.design_key}
          hideCode={hideCode}
          allowCodePlaceholder={showCodeField}
          width={width}
          className={className}
          scaleFontToWidth={scaleFontToWidth || usesPlateWidthFont}
          fontScaleMultiplier={fontScaleMultiplier}
          oldPlateAlphabetScale={oldPlateAlphabetScale}
          oldPlateDigitsScale={oldPlateDigitsScale}
        />
      </div>
    </div>
  );
}
