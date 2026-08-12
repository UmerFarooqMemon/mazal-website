"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  isDubaiClassicRetro,
  isOldMotorcyclePlateStyle,
  isOldPlateStyle,
  type PlatePreviewConfig,
} from "@/lib/plate-preview";
import {
  computePlateRenderState,
  type OverlayRenderState,
  type PlateRenderState,
} from "@/lib/number-plate-preview-render";

/** Placeholder when API strips the letter code under hide_code / code_hidden. */
const HIDDEN_CODE_PLACEHOLDER = "?";

function fontFormatFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith(".woff2")) return "woff2";
  if (lower.endsWith(".woff")) return "woff";
  if (lower.endsWith(".otf")) return "opentype";
  if (lower.endsWith(".ttf")) return "truetype";
  return "";
}

function ensurePreviewFont(url: string): string | null {
  const clean = url.trim().replace(/["'\\]/g, "");
  if (!clean) return null;

  const family = `MazalPlateFont-${clean.replace(/[^a-zA-Z0-9]+/g, "").slice(-48)}`;
  const styleId = `font-face-${family}`;

  if (typeof document !== "undefined" && !document.getElementById(styleId)) {
    const format = fontFormatFromUrl(clean);
    const source = format
      ? `url("${clean}") format("${format}")`
      : `url("${clean}")`;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = [400, 700]
      .map(
        (weight) =>
          `@font-face{font-family:"${family}";src:${source};font-weight:${weight};font-style:normal;font-display:swap;}`,
      )
      .join("");
    document.head.appendChild(style);
  }

  return family;
}

interface PlateWithOverlayProps {
  plate_code: string;
  plate_digits: string;
  emirate?: string;
  isMobile?: boolean;
  width?: number;
  className?: string;
  imageUrl?: string;
  preview?: PlatePreviewConfig;
  plateVariant?: string;
  plateType?: string;
  plateDesign?: string;
  isRTL?: boolean;
  /**
   * When true, blurs only the plate code letter — digits stay sharp in their API position.
   */
  hideCode?: boolean;
  /**
   * When true with hideCode and empty plate_code, render a letter placeholder.
   * False for classic/no-code variants so we never invent a code letter.
   */
  allowCodePlaceholder?: boolean;
  /** When true, scale overlay font size to rendered plate width (deal summary). */
  scaleFontToWidth?: boolean;
  /** Extra multiplier applied with width-based font scaling (deal summary). */
  fontScaleMultiplier?: number;
  /** Old plate only: extra scale for the letter code (A, B, …). */
  oldPlateAlphabetScale?: number;
  /** Old plate only: extra scale for digits. */
  oldPlateDigitsScale?: number;
}

function OverlaySpan({
  overlay,
  blur,
  overlayClass,
}: {
  overlay: OverlayRenderState;
  blur?: boolean;
  overlayClass?: string;
}) {
  if (!overlay.visible) return null;

  const className = [overlay.className, overlayClass].filter(Boolean).join(" ");

  // Strong blur so the letter stays unreadable while still reading as ink on the plate.
  const content = overlay.inner ? (
    <span
      className={overlay.inner.className}
      style={overlay.inner.style}
      dir="ltr"
      lang="en"
    >
      {overlay.inner.value}
    </span>
  ) : (
    overlay.value
  );

  return (
    <span
      dir="ltr"
      lang="en"
      className={className}
      style={overlay.style}
      aria-hidden={blur || undefined}
    >
      {blur ? (
        <span
          className="inline-block select-none"
          style={{
            filter: "blur(14px)",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          {content}
        </span>
      ) : (
        content
      )}
    </span>
  );
}

export default function PlateWithOverlay({
  plate_code,
  plate_digits,
  width,
  className = "",
  preview,
  plateVariant,
  plateType,
  plateDesign,
  hideCode = false,
  allowCodePlaceholder = false,
  scaleFontToWidth = false,
  fontScaleMultiplier = 1,
  oldPlateAlphabetScale,
  oldPlateDigitsScale,
}: PlateWithOverlayProps) {
  // API may send "?" for hidden letter codes, or omit the code entirely.
  // Blur stays on whenever hideCode is true — same as before, including "?".
  const effectiveCode =
    hideCode && allowCodePlaceholder && !plate_code.trim()
      ? HIDDEN_CODE_PLACEHOLDER
      : plate_code;

  const useOldPlateFonts = isOldPlateStyle({
    plateDesign,
    plateVariant,
    preview,
  });
  const useClassicRetroDigits = isDubaiClassicRetro(preview);
  const useOldMotoLayout =
    useOldPlateFonts &&
    isOldMotorcyclePlateStyle({
      plateVariant,
      plateType: plateType || preview?.plate_type,
      preview,
    });
  const overlayLayout = String(preview?.overlay_layout || "").toLowerCase();
  const oldPlateLayoutClass = useOldMotoLayout
    ? "plate-preview--old-moto"
    : useOldPlateFonts && overlayLayout === "split_top"
      ? "plate-preview--old-split"
      : "";
  const platePreviewClass = [
    "relative mx-auto shrink-0 plate-preview",
    useOldPlateFonts ? "plate-preview--old" : "",
    useClassicRetroDigits ? "plate-preview--classic-digits" : "",
    oldPlateLayoutClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const rootRef = useRef<HTMLDivElement>(null);
  const [renderState, setRenderState] = useState<PlateRenderState | null>(() =>
    preview
      ? computePlateRenderState(
          preview,
          effectiveCode,
          plate_digits,
          420,
          scaleFontToWidth,
          fontScaleMultiplier,
          useOldPlateFonts,
          oldPlateAlphabetScale,
          oldPlateDigitsScale,
          plateVariant,
          plateType || preview?.plate_type,
        )
      : null,
  );

  const updateRenderState = useCallback(() => {
    const rootWidth = rootRef.current?.clientWidth || 420;
    const next = computePlateRenderState(
      preview,
      effectiveCode,
      plate_digits,
      rootWidth,
      scaleFontToWidth,
      fontScaleMultiplier,
      useOldPlateFonts,
      oldPlateAlphabetScale,
      oldPlateDigitsScale,
      plateVariant,
      plateType || preview?.plate_type,
    );
    setRenderState(next);
  }, [
    preview,
    effectiveCode,
    plate_digits,
    scaleFontToWidth,
    fontScaleMultiplier,
    useOldPlateFonts,
    oldPlateAlphabetScale,
    oldPlateDigitsScale,
    plateVariant,
    plateType,
  ]);

  useEffect(() => {
    updateRenderState();
  }, [updateRenderState]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new ResizeObserver(() => {
      updateRenderState();
    });

    observer.observe(root);
    return () => observer.disconnect();
  }, [updateRenderState]);

  useEffect(() => {
    if (!renderState?.needsAbuDhabiClassicResize) return;

    const frame = requestAnimationFrame(() => {
      updateRenderState();
    });

    return () => cancelAnimationFrame(frame);
  }, [renderState?.needsAbuDhabiClassicResize, updateRenderState]);

  useEffect(() => {
    const fontUrl = preview?.font_url;
    if (!fontUrl || !rootRef.current) return;

    const family = ensurePreviewFont(fontUrl);
    if (!family) return;

    rootRef.current.style.setProperty("--mazal-plate-font", `"${family}"`);

    if (typeof document.fonts?.load !== "function") {
      updateRenderState();
      return;
    }

    Promise.all([
      document.fonts.load(`400 48px "${family}"`),
      document.fonts.load(`700 48px "${family}"`),
    ])
      .catch(() => null)
      .finally(() => {
        updateRenderState();
      });
  }, [preview?.font_url, updateRenderState]);

  if (!preview) {
    return (
      <div
        dir="ltr"
        className={platePreviewClass}
        style={{
          width: width ? `${width}px` : "100%",
          maxWidth: "100%",
          aspectRatio: "840 / 592",
          backgroundImage: 'url("/plate-empty.png")',
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundColor: "transparent",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      dir="ltr"
      className={platePreviewClass}
      style={{
        ...renderState?.rootStyle,
        width: width ? `${width}px` : renderState?.rootStyle.width || "100%",
      }}
    >
      <OverlaySpan
        overlay={
          renderState?.code || {
            visible: false,
            value: "",
            className: "plate-overlay",
            style: {},
          }
        }
        overlayClass={[
          "plate-overlay-code",
          effectiveCode.trim().length >= 2 ? "plate-overlay-code--multi" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        blur={hideCode}
      />
      <OverlaySpan
        overlay={
          renderState?.digitsAr || {
            visible: false,
            value: "",
            className: "plate-overlay",
            style: {},
          }
        }
        overlayClass="plate-overlay-digits-ar"
      />
      <OverlaySpan
        overlay={
          renderState?.digits || {
            visible: false,
            value: "",
            className: "plate-overlay",
            style: {},
          }
        }
        overlayClass="plate-overlay-digits"
      />
    </div>
  );
}
