"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlatePreviewConfig } from "@/lib/plate-preview";
import {
  computePlateRenderState,
  type OverlayRenderState,
  type PlateRenderState,
} from "@/lib/number-plate-preview-render";

/** Placeholder when API strips the letter code under hide_code / code_hidden. */
const HIDDEN_CODE_PLACEHOLDER = "?";

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
  /** Optional separate multiplier for code letters when width scaling is enabled. */
  codeFontScaleMultiplier?: number;
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
  hideCode = false,
  allowCodePlaceholder = false,
  scaleFontToWidth = false,
  fontScaleMultiplier = 1,
  codeFontScaleMultiplier,
}: PlateWithOverlayProps) {
  // API may send "?" for hidden letter codes, or omit the code entirely.
  // Blur stays on whenever hideCode is true — same as before, including "?".
  const effectiveCode =
    hideCode && allowCodePlaceholder && !plate_code.trim()
      ? HIDDEN_CODE_PLACEHOLDER
      : plate_code;

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
        codeFontScaleMultiplier,
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
      codeFontScaleMultiplier,
    );
    setRenderState(next);
  }, [
    preview,
    effectiveCode,
    plate_digits,
    scaleFontToWidth,
    fontScaleMultiplier,
    codeFontScaleMultiplier,
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
