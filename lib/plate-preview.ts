import type { PlatePreviewConfig } from "@/components/certificates/VerifiedCertificateCard";

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
