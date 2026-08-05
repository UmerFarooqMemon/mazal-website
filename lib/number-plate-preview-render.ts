import type { CSSProperties } from "react";
import type { PlateOverlayConfig, PlatePreviewConfig } from "@/lib/plate-preview";

const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

const METAL_PLATE_TEXT_CLASS = "metal-plate-text";
const METAL_PLATE_TEXT_LIGHT_CLASS = "metal-plate-text-light";

const METALLIC_COLORS = new Set([
  "#333333",
  "#333",
  "#323232",
  "#2d2d2d",
  "#000000",
  "#000",
  "black",
  "#0a0a0a",
]);

const LIGHT_METALLIC_COLORS = new Set([
  "#f8f4ec",
  "#ffffff",
  "#fff",
  "#f5f5f5",
  "#fafafa",
  "#f8f8f8",
]);

const ABU_DHABI_CLASSIC_CAR_FALLBACK = {
  plate_digits_ar: {
    left: "33.33%",
    right: "0.6%",
    top: "15.53%",
    height: "43.92%",
    layout_mode: "flex_cell" as const,
    font_weight: "700",
    color: "#000000",
    font_family: '"Segoe UI", Arial, Tahoma, sans-serif',
  },
  plate_digits: {
    left: "33.33%",
    right: "0.6%",
    top: "40.21%",
    height: "43.92%",
    layout_mode: "flex_cell" as const,
    font_weight: "700",
    color: "#000000",
    font_family: '"Segoe UI", Arial, Tahoma, sans-serif',
  },
};

export type OverlayRenderState = {
  visible: boolean;
  value: string;
  className: string;
  style: CSSProperties;
  inner?: {
    value: string;
    className: string;
    style: CSSProperties;
  };
};

export type PlateRenderState = {
  rootStyle: CSSProperties;
  code: OverlayRenderState;
  digitsAr: OverlayRenderState;
  digits: OverlayRenderState;
  needsAbuDhabiClassicResize: boolean;
};

function normalizeColor(color?: string): string {
  return String(color || "").trim().toLowerCase();
}

function isLightMetallicColor(color?: string): boolean {
  return LIGHT_METALLIC_COLORS.has(normalizeColor(color));
}

function usesMetallicText(
  config?: PlateOverlayConfig | null,
  options?: { oldPlateStyle?: boolean },
): boolean {
  if (!config) return false;
  // Old Dubai plates use Mazal emboss via CSS — skip Charles Wright metal class.
  if (options?.oldPlateStyle) return false;
  if (config.metal_plate_text === false) return false;
  if (config.metal_plate_text === true) return true;

  const color = normalizeColor(config.color);
  return METALLIC_COLORS.has(color) || LIGHT_METALLIC_COLORS.has(color);
}

function metallicClassName(config?: PlateOverlayConfig | null): string {
  if (!usesMetallicText(config)) return "";
  return isLightMetallicColor(config?.color)
    ? METAL_PLATE_TEXT_LIGHT_CLASS
    : METAL_PLATE_TEXT_CLASS;
}

/**
 * Mask glyphs the API sends instead of digits while a listing code is hidden
 * (e.g. display_plate "A •••"). They render like digits so the plate isn't empty.
 */
const PLATE_DIGIT_MASK_CHARS = "•●·*?#×";

export function sanitizePlateDigits(value: string, maxLength = 5): string {
  const maskClass = PLATE_DIGIT_MASK_CHARS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return String(value || "")
    .replace(new RegExp(`[^\\d${maskClass}]`, "g"), "")
    .slice(0, maxLength);
}

export function toArabicIndicDigits(value: string): string {
  return String(value || "").replace(
    /\d/g,
    (digit) => ARABIC_INDIC_DIGITS[Number(digit)] || digit,
  );
}

function abuDhabiClassicFontSize(rootWidth: number, digits: string): string {
  const width = rootWidth || 420;
  const len = String(digits || "").length || 1;

  if (len >= 5) return `${Math.round(width * 0.082)}px`;
  if (len >= 4) return `${Math.round(width * 0.086)}px`;
  return `${Math.round(width * 0.092)}px`;
}

const PLATE_REFERENCE_WIDTH = 840;

/** Width-based scale for old Dubai metal plate letter (A, B, …). */
export const OLD_PLATE_ALPHABET_FONT_SCALE = 1.5;

/** Width-based scale for old Dubai metal plate digits — same visual row as alphabet. */
export const OLD_PLATE_DIGITS_FONT_SCALE = 1.7;

/** @deprecated Use OLD_PLATE_ALPHABET_FONT_SCALE / OLD_PLATE_DIGITS_FONT_SCALE */
export const OLD_PLATE_FONT_SCALE = OLD_PLATE_ALPHABET_FONT_SCALE;

/** Extra bump for deal-summary sidebar plate (on top of width-based scaling). */
export const DEAL_SUMMARY_FONT_SCALE = 1.7;

function parseLengthToPx(value: string, basisWidth: number): number | null {
  const trimmed = value.trim().toLowerCase();
  const num = parseFloat(trimmed);
  if (Number.isNaN(num)) return null;

  if (trimmed.endsWith("px")) return num;
  if (trimmed.endsWith("rem") || trimmed.endsWith("em")) return num * 16;
  if (trimmed.endsWith("vw") || trimmed.endsWith("%")) {
    return (basisWidth * num) / 100;
  }

  return null;
}

function shouldScaleFontSize(fontSize: string): boolean {
  return /vw|clamp|rem|em/i.test(fontSize);
}

/** Scale API clamp/vw font sizes to the rendered plate width (not viewport). */
function scaleFontSizeForPlateWidth(
  fontSize: string | undefined,
  rootWidth: number,
  referenceWidth = PLATE_REFERENCE_WIDTH,
  fontScaleMultiplier = 1,
): string | undefined {
  if (!fontSize?.trim()) return fontSize;

  const width = Math.max(1, rootWidth || referenceWidth);
  const scale = width / referenceWidth;

  const clampMatch = fontSize.match(
    /^clamp\(\s*([^,]+?)\s*,\s*([^,]+?)\s*,\s*([^)]+?)\s*\)$/i,
  );

  if (clampMatch) {
    const [, minRaw, prefRaw, maxRaw] = clampMatch;
    const prefUsesPlatePercent = /vw/i.test(prefRaw);

    const minPx = parseLengthToPx(minRaw, referenceWidth);
    const prefPx = parseLengthToPx(
      prefRaw,
      prefUsesPlatePercent ? width : referenceWidth,
    );
    const maxPx = parseLengthToPx(maxRaw, referenceWidth);

    if (minPx == null || prefPx == null || maxPx == null) return fontSize;

    const scaledMin = minPx * scale;
    const scaledPref = prefUsesPlatePercent
      ? (width * parseFloat(prefRaw)) / 100
      : prefPx * scale;
    const scaledMax = maxPx * scale;
    const result = Math.min(Math.max(scaledPref, scaledMin), scaledMax);

    return `${Math.max(8, Math.round(result * fontScaleMultiplier))}px`;
  }

  if (/vw/i.test(fontSize)) {
    const px = (width * parseFloat(fontSize)) / 100;
    return `${Math.max(8, Math.round(px * fontScaleMultiplier))}px`;
  }

  const px = parseLengthToPx(fontSize, referenceWidth);
  if (px != null) {
    return `${Math.max(8, Math.round(px * scale * fontScaleMultiplier))}px`;
  }

  return fontSize;
}

function withPlateWidthFontScale(
  config: PlateOverlayConfig | null | undefined,
  rootWidth: number,
  fontScaleMultiplier = 1,
): PlateOverlayConfig | null | undefined {
  if (!config?.font_size || !shouldScaleFontSize(config.font_size)) {
    return config ?? null;
  }

  return {
    ...config,
    font_size: scaleFontSizeForPlateWidth(
      config.font_size,
      rootWidth,
      PLATE_REFERENCE_WIDTH,
      fontScaleMultiplier,
    ),
  };
}

function withAbuDhabiClassicSizing(
  rootWidth: number,
  config: PlateOverlayConfig | null | undefined,
  digits: string,
): PlateOverlayConfig | null {
  if (!config) return null;

  return {
    ...config,
    font_size: abuDhabiClassicFontSize(rootWidth, digits),
  };
}

function scaledDigitsConfig(
  baseConfig: PlateOverlayConfig | null | undefined,
  digits: string,
  layout: string | null,
  code: string,
): PlateOverlayConfig | null {
  if (!baseConfig) return null;

  const config = { ...baseConfig };
  const len = (digits || "").length;
  const hasCode = Boolean(code && String(code).length > 0);

  // Keep API/template font size for these layouts — do not shrink on longer digits.
  if (
    layout === "split_top" ||
    layout === "classic_car_row" ||
    layout === "abu_dhabi_classic_car"
  ) {
    return config;
  }
  if (layout === "rak_private" && hasCode && len >= 5) {
    config.font_size = "clamp(1.2rem, 3.4vw, 2.1rem)";
  } else if (layout === "motorcycle" && len >= 5) {
    config.font_size = "clamp(1.15rem, 3.2vw, 2rem)";
  } else if (len >= 5) {
    config.font_size = "clamp(1.25rem, 4vw, 2.2rem)";
  } else if (len >= 4) {
    config.font_size = "clamp(1.32rem, 4.2vw, 2.35rem)";
  }

  return config;
}

function codeForOverlay(
  code: string,
  config?: PlateOverlayConfig | null,
): string {
  if (!code) return "";
  if (config?.hide_when_code?.includes(code)) return "";
  return code;
}

function resolveOverlays(previewConfig: PlatePreviewConfig) {
  const layout = previewConfig.overlay_layout || null;
  const overlays = { ...(previewConfig.overlays || {}) };

  if (layout === "abu_dhabi_classic_car") {
    return {
      ...ABU_DHABI_CLASSIC_CAR_FALLBACK,
      ...overlays,
      plate_digits_ar: {
        ...ABU_DHABI_CLASSIC_CAR_FALLBACK.plate_digits_ar,
        ...(overlays.plate_digits_ar || {}),
      },
      plate_digits: {
        ...ABU_DHABI_CLASSIC_CAR_FALLBACK.plate_digits,
        ...(overlays.plate_digits || {}),
      },
    };
  }

  return overlays;
}

function adjustOverlaysForCode(
  overlays: ReturnType<typeof resolveOverlays>,
  code: string,
  layout: string | null,
  oldPlateStyle = false,
) {
  if (!overlays) return overlays;

  const adjusted = {
    plate_code: overlays.plate_code ? { ...overlays.plate_code } : null,
    plate_digits: overlays.plate_digits ? { ...overlays.plate_digits } : null,
    plate_digits_ar: overlays.plate_digits_ar
      ? { ...overlays.plate_digits_ar }
      : null,
  };

  const hasCode = Boolean(
    codeForOverlay(code, adjusted.plate_code || undefined),
  );

  // Digits keep their API-configured position when no alphabet is present.
  if (!hasCode) {
    return adjusted;
  }

  if (layout === "split_top" && adjusted.plate_digits) {
    delete adjusted.plate_digits.right;
  }

  if (oldPlateStyle && layout === "split_top") {
    const codeLength = String(code || "").length;
    // Same midline + same font size for letter and digits (one packed row).
    const sharedTop = "50%";
    const sharedTransform = "translate(-50%, -50%)";
    const rowFontSize = "clamp(2.05rem, 8.8vw, 4rem)";

    const unifyOldPlateRow = (overlay: PlateOverlayConfig) => {
      overlay.layout_mode = "point_center";
      overlay.top = sharedTop;
      overlay.transform = sharedTransform;
      overlay.font_size = rowFontSize;
      delete overlay.height;
      delete overlay.right;
    };

    if (adjusted.plate_code) {
      unifyOldPlateRow(adjusted.plate_code);
      // Single letter near left bay center; double stays left of Dubai crest.
      adjusted.plate_code.left = codeLength >= 2 ? "15.5%" : "12%";
      // Almost no gap — wide spacing was pushing 2nd letter onto the logo.
      adjusted.plate_code.letter_spacing =
        codeLength >= 2 ? "0.01em" : "0.02em";
    }
    if (adjusted.plate_digits) {
      unifyOldPlateRow(adjusted.plate_digits);
      // Pull toward Dubai crest (same size as single/double alphabet).
      adjusted.plate_digits.left = "69%";
      adjusted.plate_digits.letter_spacing = "0.09em";
    }
    if (adjusted.plate_digits_ar) {
      unifyOldPlateRow(adjusted.plate_digits_ar);
      adjusted.plate_digits_ar.left = "69%";
      adjusted.plate_digits_ar.letter_spacing = "0.09em";
    }
  }

  if (layout === "sharjah_private" && adjusted.plate_digits) {
    adjusted.plate_code = adjusted.plate_code || {};
    adjusted.plate_code.transform = "translateY(-50%)";
    adjusted.plate_digits.transform = "translateY(-50%)";
    delete adjusted.plate_digits.left;
  }

  if (layout === "rak_private" && adjusted.plate_digits) {
    adjusted.plate_code = adjusted.plate_code || {};
    adjusted.plate_code.transform =
      adjusted.plate_code.transform || "translateY(-50%)";
    adjusted.plate_digits.transform =
      adjusted.plate_digits.transform || "translateY(-50%)";
    delete adjusted.plate_digits.right;
  }

  return adjusted;
}

function emptyOverlay(): OverlayRenderState {
  return {
    visible: false,
    value: "",
    className: "plate-overlay",
    style: { position: "absolute", zIndex: 3 },
  };
}

function buildOverlayState(
  config: PlateOverlayConfig | null | undefined,
  value: string,
  options?: {
    oldPlateStyle?: boolean;
    overlayRole?: "code" | "digits";
  },
): OverlayRenderState {
  if (!config || !value) {
    return emptyOverlay();
  }

  const useMetallic = usesMetallicText(config, options);
  const metalClass = metallicClassName(config);
  const baseClass = ["plate-overlay", metalClass].filter(Boolean).join(" ");

  if (config.layout_mode === "point_center") {
    const style: CSSProperties = {
      position: "absolute",
      zIndex: 3,
      display: "block",
      width: "max-content",
      maxWidth: options?.oldPlateStyle ? "none" : "62%",
      lineHeight: 1,
      margin: 0,
      padding: 0,
      left: config.left,
      top: config.top,
      transform: "translate(-50%, -50%)",
      direction: "ltr",
      unicodeBidi: "plaintext",
      textAlign: "center",
      whiteSpace: "nowrap",
    };

    if (!useMetallic && !options?.oldPlateStyle) {
      style.color = config.color || "#000";
      style.fontWeight = config.font_weight || "700";
      style.fontFamily = config.font_family || "Arial, sans-serif";
    } else if (!useMetallic && options?.oldPlateStyle && isLightMetallicColor(config.color) && config.color) {
      style.color = config.color;
    }

    if (config.font_size) {
      style.fontSize = config.font_size;
    }

    if (config.letter_spacing) {
      style.letterSpacing = config.letter_spacing;
    }

    return {
      visible: true,
      value,
      className: baseClass,
      style,
    };
  }

  if (config.layout_mode === "flex_cell") {
    const outerStyle: CSSProperties = {
      position: "absolute",
      zIndex: 3,
      boxSizing: "border-box",
      left: config.left,
      top: config.top,
      height: config.height,
      display: "grid",
      placeItems: "center",
      overflow: "visible",
      margin: 0,
      padding: 0,
      pointerEvents: "none",
    };

    if (config.right) outerStyle.right = config.right;

    const innerStyle: CSSProperties = {
      display: "block",
      direction: "ltr",
      unicodeBidi: "plaintext",
      lineHeight: 1,
      textAlign: "center",
      whiteSpace: "nowrap",
    };

    if (useMetallic) {
      innerStyle.position = "relative";
    } else if (!options?.oldPlateStyle) {
      innerStyle.color = config.color || "#000";
      innerStyle.fontWeight = config.font_weight || "700";
      innerStyle.fontFamily = config.font_family || "Arial, sans-serif";
    }

    if (config.font_size) {
      innerStyle.fontSize = config.font_size;
    }

    if (config.letter_spacing) {
      innerStyle.letterSpacing = config.letter_spacing;
    }

    if (useMetallic && isLightMetallicColor(config.color) && config.color) {
      innerStyle.color = config.color;
    }

    return {
      visible: true,
      value: "",
      className: "plate-overlay",
      style: outerStyle,
      inner: {
        value,
        className: ["plate-digit-inner", metalClass].filter(Boolean).join(" "),
        style: innerStyle,
      },
    };
  }

  const style: CSSProperties = {
    position: "absolute",
    zIndex: 3,
    direction: "ltr",
    unicodeBidi: "plaintext",
    display: "inline-block",
    lineHeight: 1,
    whiteSpace: "nowrap",
    pointerEvents: "none",
  };

  const skipKeys = new Set(["hide_when_code", "metal_plate_text", "layout_mode"]);
  const metallicSkip = new Set([
    "text-shadow",
    "font-family",
    "font-weight",
    "color",
    "letter-spacing",
  ]);

  for (const [key, val] of Object.entries(config)) {
    if (skipKeys.has(key) || val == null) continue;

    const cssKey = key.replace(/_/g, "-");
    if (useMetallic && metallicSkip.has(cssKey)) continue;
    if (
      options?.oldPlateStyle &&
      ["font-family", "font-weight", "color"].includes(cssKey)
    ) {
      continue;
    }
    if (
      options?.oldPlateStyle &&
      cssKey === "letter-spacing" &&
      options.overlayRole === "digits"
    ) {
      continue;
    }

    switch (cssKey) {
      case "text-shadow":
        style.textShadow = String(val);
        break;
      case "font-family":
        style.fontFamily = String(val);
        break;
      case "font-size":
        style.fontSize = String(val);
        break;
      case "font-weight":
        style.fontWeight = String(val);
        break;
      case "letter-spacing":
        style.letterSpacing = String(val);
        break;
      case "color":
        style.color = String(val);
        break;
      case "transform":
        style.transform = String(val);
        break;
      case "left":
        style.left = String(val);
        break;
      case "right":
        style.right = String(val);
        style.left = "auto";
        break;
      case "top":
        style.top = String(val);
        break;
      case "height":
        style.height = String(val);
        break;
    }
  }

  if (config.right) {
    style.textAlign = "right";
  } else {
    style.textAlign = "center";
  }

  if (config.transform) {
    style.transform = config.transform;
  }

  if (useMetallic && isLightMetallicColor(config.color) && config.color) {
    style.color = config.color;
  }

  return {
    visible: true,
    value,
    className: baseClass,
    style,
  };
}

export function computePlateRenderState(
  previewConfig: PlatePreviewConfig | undefined,
  code: string,
  digits: string,
  rootWidth = 420,
  scaleFontToWidth = false,
  fontScaleMultiplier = 1,
  oldPlateStyle = false,
  oldPlateAlphabetScale = OLD_PLATE_ALPHABET_FONT_SCALE,
  oldPlateDigitsScale = OLD_PLATE_DIGITS_FONT_SCALE,
): PlateRenderState | null {
  if (!previewConfig) return null;

  const bgUrl =
    previewConfig.background_image?.url ||
    previewConfig.background_image_url ||
    "";

  const aspectRatio =
    previewConfig.background_image?.aspect_ratio ||
    previewConfig.aspect_ratio ||
    `${previewConfig.width || 840} / ${previewConfig.height || 592}`;

  const rootStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    maxWidth: "100%",
    aspectRatio,
    backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundColor: "transparent",
    borderRadius: "3px",
    overflow: "hidden",
    containerType: "inline-size",
    direction: "ltr",
  };

  const layout = previewConfig.overlay_layout || null;
  const overlays = adjustOverlaysForCode(
    resolveOverlays(previewConfig),
    code,
    layout,
    oldPlateStyle,
  );
  const digitValue = sanitizePlateDigits(digits);

  const codeValue = codeForOverlay(code, overlays.plate_code || undefined);

  const shouldScaleToPlateWidth = scaleFontToWidth || oldPlateStyle;

  const oldPlatePartMultiplier = (partScale: number) => {
    if (!oldPlateStyle) return fontScaleMultiplier;
    // Old plate: keep alphabet/digit relative scales even on cards (scaleFontToWidth).
    // Cards pass ~2.3 as a base; part scales are relative to the alphabet default.
    if (scaleFontToWidth) {
      return fontScaleMultiplier * (partScale / OLD_PLATE_ALPHABET_FONT_SCALE);
    }
    return partScale;
  };

  const scaleCodeConfig = (
    config: PlateOverlayConfig | null | undefined,
  ): PlateOverlayConfig | null | undefined =>
    shouldScaleToPlateWidth
      ? withPlateWidthFontScale(
          config,
          rootWidth,
          oldPlatePartMultiplier(
            oldPlateStyle ? oldPlateAlphabetScale : 1,
          ),
        )
      : config;

  const scaleDigitsConfig = (
    config: PlateOverlayConfig | null | undefined,
  ): PlateOverlayConfig | null | undefined =>
    shouldScaleToPlateWidth
      ? withPlateWidthFontScale(
          config,
          rootWidth,
          oldPlatePartMultiplier(oldPlateStyle ? oldPlateDigitsScale : 1),
        )
      : config;

  const overlayOptions = oldPlateStyle ? { oldPlateStyle: true } : undefined;

  const arConfig = scaleDigitsConfig(
    scaledDigitsConfig(overlays.plate_digits_ar, digitValue, layout, code),
  );
  const enConfig = scaleDigitsConfig(
    scaledDigitsConfig(overlays.plate_digits, digitValue, layout, code),
  );
  const codeConfig = scaleCodeConfig(overlays.plate_code);

  const digitsOverlayOptions = oldPlateStyle
    ? { oldPlateStyle: true, overlayRole: "digits" as const }
    : undefined;
  const codeOverlayOptions = oldPlateStyle
    ? { oldPlateStyle: true, overlayRole: "code" as const }
    : overlayOptions;

  const digitsAr =
    overlays.plate_digits_ar && digitValue
      ? buildOverlayState(
          layout === "abu_dhabi_classic_car"
            ? withAbuDhabiClassicSizing(rootWidth, arConfig, digitValue)
            : arConfig,
          toArabicIndicDigits(digitValue),
          digitsOverlayOptions,
        )
      : emptyOverlay();

  const digitsEn = buildOverlayState(
    layout === "abu_dhabi_classic_car"
      ? withAbuDhabiClassicSizing(rootWidth, enConfig, digitValue)
      : enConfig,
    digitValue,
    digitsOverlayOptions,
  );

  return {
    rootStyle,
    code: buildOverlayState(codeConfig, codeValue, codeOverlayOptions),
    digitsAr,
    digits: digitsEn,
    needsAbuDhabiClassicResize:
      layout === "abu_dhabi_classic_car" && rootWidth < 50,
  };
}
