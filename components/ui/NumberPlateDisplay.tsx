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
  | "private-deal"
  | "deal-summary";

const CROP_CLASS: Record<PlateCropVariant, string> = {
  form: "plate-crop--form",
  "live-preview": "plate-crop--live-preview",
  card: "plate-crop--card",
  certificate: "plate-crop--certificate",
  hero: "plate-crop--hero",
  compact: "plate-crop--compact",
  "private-deal": "plate-crop--private-deal",
  "deal-summary": "plate-crop--deal-summary",
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
  const showCodeField =
    showCode !== undefined
      ? showCode
      : (variantMeta?.fields?.includes("plate_code") ?? true) &&
        (variantMeta?.has_code ?? Boolean(plate_code));

  return (
    <div dir="ltr" lang="en" className={wrapperClassName}>
      <div className={`plate-crop ${CROP_CLASS[crop]}`}>
        <PlateWithOverlay
          plate_code={showCodeField ? plate_code : ""}
          plate_digits={plate_digits}
          emirate={emirate}
          preview={resolvedPreview || undefined}
          hideCode={showCodeField && hideCode}
          width={width}
          className={className}
          scaleFontToWidth={scaleFontToWidth || crop === "deal-summary"}
          fontScaleMultiplier={
            crop === "deal-summary" ? DEAL_SUMMARY_FONT_SCALE : 1
          }
        />
      </div>
    </div>
  );
}
