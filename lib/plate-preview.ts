export type PlateOverlayConfig = {
  left?: string;
  right?: string;
  top?: string;
  height?: string;
  transform?: string;
  font_size?: string;
  font_weight?: string;
  color?: string;
  font_family?: string;
  layout_mode?: "point_center" | "flex_cell" | string;
  hide_when_code?: string[];
  metal_plate_text?: boolean;
  text_shadow?: string;
  letter_spacing?: string;
};

export type PlatePreviewConfig = {
  emirate?: string;
  emirate_label?: string;
  plate_type?: string;
  plate_type_label?: string;
  design_key?: string;
  design_label?: string;
  background_image?: {
    url?: string;
    path?: string;
    width?: number;
    height?: number;
    aspect_ratio?: string;
  };
  background_image_url?: string;
  background_image_path?: string;
  width?: number;
  height?: number;
  aspect_ratio?: string;
  overlay_layout?: string;
  overlays?: {
    plate_code?: PlateOverlayConfig;
    plate_digits?: PlateOverlayConfig;
    plate_digits_ar?: PlateOverlayConfig;
  };
};

type VariantLike = {
  key?: string;
  plate_type?: string;
  plate_design?: string;
  preview?: PlatePreviewConfig;
};

type OptionsLike = {
  emirates?: { variants?: VariantLike[] }[];
};

export type PlatePreviewLookup = {
  byKey: Record<string, PlatePreviewConfig>;
  byTypeDesign: Record<string, PlatePreviewConfig>;
  byType: Record<string, VariantLike[]>;
};

/** Score variants so ambiguous plate_type-only lookups prefer new/colorful over old. */
function variantPreferenceScore(v: VariantLike): number {
  const design = (v.plate_design || "").toLowerCase();
  const key = (v.key || "").toLowerCase();
  if (design === "new_colorful" || key.includes("new_colorful")) return 300;
  if (design.includes("new") || key.includes("new")) return 200;
  if (design.includes("colorful") || key.includes("colorful")) return 150;
  if (design === "old" || key.includes("_old") || key.endsWith("old")) return 0;
  return 100;
}

export function buildPlatePreviewLookup(
  optionsData: OptionsLike,
): PlatePreviewLookup {
  const byKey: Record<string, PlatePreviewConfig> = {};
  const byTypeDesign: Record<string, PlatePreviewConfig> = {};
  const byType: Record<string, VariantLike[]> = {};

  for (const em of optionsData?.emirates || []) {
    for (const v of em?.variants || []) {
      if (!v?.preview) continue;
      if (v.key) byKey[v.key] = v.preview;
      if (v.plate_type && v.plate_design) {
        byTypeDesign[`${v.plate_type}_${v.plate_design}`] = v.preview;
      }
      if (v.plate_type) {
        (byType[v.plate_type] ||= []).push(v);
      }
    }
  }

  return { byKey, byTypeDesign, byType };
}

/**
 * Dubai/private "old" metal plates (white plate with raised letter + digits).
 * Detected from design key, variant key, or old-plate background artwork.
 * Does not match Abu Dhabi "classic" or other non-old templates.
 */
export function isOldPlateStyle(data: {
  plateDesign?: string | null;
  plateVariant?: string | null;
  preview?: PlatePreviewConfig | null;
}): boolean {
  const design = String(
    data.plateDesign || data.preview?.design_key || "",
  ).toLowerCase();
  const variant = String(data.plateVariant || "").toLowerCase();
  const bg = [
    data.preview?.background_image?.url,
    data.preview?.background_image?.path,
    data.preview?.background_image_url,
    data.preview?.background_image_path,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (design === "old") return true;
  if (variant.includes("_old") || /(^|_)old$/.test(variant)) return true;
  if (bg.includes("private-old") || bg.includes("old-plate")) return true;
  // Dubai private "classic" reuses the same old-plate PNG as design "old"
  if (design === "classic" && (bg.includes("private-old") || bg.includes("old-plate"))) {
    return true;
  }
  return false;
}

/** Old motorcycle / left-crest plates — letter sits under the top-left Dubai logo. */
export function isOldMotorcyclePlateStyle(data: {
  plateVariant?: string | null;
  plateType?: string | null;
  preview?: PlatePreviewConfig | null;
}): boolean {
  const layout = String(data.preview?.overlay_layout || "").toLowerCase();
  const variant = String(data.plateVariant || "").toLowerCase();
  const type = String(
    data.plateType || data.preview?.plate_type || "",
  ).toLowerCase();
  const typeLabel = String(data.preview?.plate_type_label || "").toLowerCase();
  const bg = [
    data.preview?.background_image?.url,
    data.preview?.background_image?.path,
    data.preview?.background_image_url,
    data.preview?.background_image_path,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const haystack = [layout, variant, type, typeLabel, bg].join(" ");
  if (/(motor|moto|bike|cycle|scoot)/.test(haystack)) return true;

  // API already places the letter in the lower-left bay under the crest.
  const codeTop = String(data.preview?.overlays?.plate_code?.top || "");
  if (codeTop.includes("%")) {
    const top = parseFloat(codeTop);
    if (!Number.isNaN(top) && top >= 55) return true;
  }

  // flex_cell starting mid-plate with tall height → under-logo bay.
  const code = data.preview?.overlays?.plate_code;
  if (code?.layout_mode === "flex_cell" && code.top && code.height) {
    const top = parseFloat(String(code.top));
    const height = parseFloat(String(code.height));
    if (
      !Number.isNaN(top) &&
      !Number.isNaN(height) &&
      top >= 38 &&
      top + height >= 80
    ) {
      return true;
    }
  }

  // Wide digit bay starting left of center → left crest + under-logo letter.
  const digitsLeftRaw = String(
    data.preview?.overlays?.plate_digits?.left || "",
  );
  if (digitsLeftRaw.includes("%")) {
    const digitsLeft = parseFloat(digitsLeftRaw);
    if (!Number.isNaN(digitsLeft) && digitsLeft > 0 && digitsLeft <= 48) {
      return true;
    }
  }

  // Wide short canvas (≈ motorcycle plate) vs taller car private plates (~1.4:1).
  const width =
    data.preview?.background_image?.width || data.preview?.width || 0;
  const height =
    data.preview?.background_image?.height || data.preview?.height || 0;
  if (width > 0 && height > 0 && width / height >= 1.85) {
    return true;
  }
  const ratio = String(
    data.preview?.background_image?.aspect_ratio ||
      data.preview?.aspect_ratio ||
      "",
  );
  const ratioMatch = ratio.match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (ratioMatch) {
    const rw = parseFloat(ratioMatch[1]);
    const rh = parseFloat(ratioMatch[2]);
    if (!Number.isNaN(rw) && !Number.isNaN(rh) && rh > 0 && rw / rh >= 1.85) {
      return true;
    }
  }

  return false;
}

export function resolvePlatePreview(
  lookup: PlatePreviewLookup,
  data: {
    plateVariant?: string;
    plateType?: string;
    plateDesign?: string;
  },
): PlatePreviewConfig | null {
  if (data.plateVariant && lookup.byKey[data.plateVariant]) {
    return lookup.byKey[data.plateVariant];
  }

  if (data.plateType && data.plateDesign) {
    const combo = lookup.byTypeDesign[`${data.plateType}_${data.plateDesign}`];
    if (combo) return combo;
  }

  // Verify API often returns plate_type only — do not pick the first variant
  // (API lists private_old first; dashboard/request default is private_new_colorful).
  if (data.plateType) {
    const candidates = lookup.byType[data.plateType] || [];
    if (candidates.length === 1) return candidates[0].preview || null;
    if (candidates.length > 1) {
      const best = [...candidates].sort(
        (a, b) => variantPreferenceScore(b) - variantPreferenceScore(a),
      )[0];
      return best?.preview || null;
    }
  }

  return null;
}
