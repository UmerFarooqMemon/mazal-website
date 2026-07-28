"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlatePreviewConfig } from "@/lib/plate-preview";
import {
  computePlateRenderState,
  type OverlayRenderState,
  type PlateRenderState,
} from "@/lib/number-plate-preview-render";

/** Placeholders when API strips values under hide_code / code_hidden — keeps blurred ink on the plate. */
const HIDDEN_CODE_PLACEHOLDER = "A";
const HIDDEN_DIGIT_CHAR = "8";

function resolveHiddenDigits(digits: string, digitCount?: number): string {
  if (digits.trim()) return digits;
  const n =
    typeof digitCount === "number" && digitCount > 0
      ? Math.min(Math.max(Math.floor(digitCount), 1), 5)
      : 5;
  return HIDDEN_DIGIT_CHAR.repeat(n);
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
  isRTL?: boolean;
  /**
   * When true, blurs code + digits (blur(14px)) using placeholders if API omitted them.
   */
  hideCode?: boolean;
  /**
   * When true with hideCode and empty plate_code, render a letter placeholder.
   * False for classic/no-code variants so we never invent a code letter.
   */
  allowCodePlaceholder?: boolean;
  /** Used to size digit placeholders when plate_digits is empty and hideCode is on. */
  digitCount?: number;
  /** When true, scale overlay font size to rendered plate width (deal summary). */
  scaleFontToWidth?: boolean;
  /** Extra multiplier applied with width-based font scaling (deal summary). */
  fontScaleMultiplier?: number;
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

  // Same approach as create-listing / private plate hide-code, but stronger
  // so characters stay unreadable while ink still reads on the plate.
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
  hideCode = false,
  allowCodePlaceholder = false,
  digitCount,
  scaleFontToWidth = false,
  fontScaleMultiplier = 1,
}: PlateWithOverlayProps) {
  // API often omits code/digits when hidden — still render glyphs so blur has something to show.
  const effectiveCode =
    hideCode && allowCodePlaceholder && !plate_code.trim()
      ? HIDDEN_CODE_PLACEHOLDER
      : plate_code;
  const effectiveDigits = hideCode
    ? resolveHiddenDigits(plate_digits, digitCount)
    : plate_digits;

  const rootRef = useRef<HTMLDivElement>(null);
  const [renderState, setRenderState] = useState<PlateRenderState | null>(() =>
    preview
      ? computePlateRenderState(
          preview,
          effectiveCode,
          effectiveDigits,
          420,
          scaleFontToWidth,
          fontScaleMultiplier,
        )
      : null,
  );

  const updateRenderState = useCallback(() => {
    const rootWidth = rootRef.current?.clientWidth || 420;
    const next = computePlateRenderState(
      preview,
      effectiveCode,
      effectiveDigits,
      rootWidth,
      scaleFontToWidth,
      fontScaleMultiplier,
    );
    setRenderState(next);
  }, [
    preview,
    effectiveCode,
    effectiveDigits,
    scaleFontToWidth,
    fontScaleMultiplier,
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

  if (!preview) {
    return (
      <div
        dir="ltr"
        className={`relative mx-auto shrink-0 plate-preview ${className}`}
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
      className={`relative mx-auto shrink-0 plate-preview ${className}`}
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
        overlayClass="plate-overlay-code"
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
        blur={hideCode}
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
        blur={hideCode}
      />
    </div>
  );
}
