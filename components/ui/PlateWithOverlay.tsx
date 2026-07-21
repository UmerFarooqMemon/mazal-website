"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlatePreviewConfig } from "@/lib/plate-preview";
import {
  computePlateRenderState,
  type OverlayRenderState,
  type PlateRenderState,
} from "@/lib/number-plate-preview-render";

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
  /** When true, blurs only the plate code letter — digits stay sharp in their API position */
  hideCode?: boolean;
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

  const blurStyle = blur
    ? {
        filter: "blur(5px)",
        userSelect: "none" as const,
        WebkitUserSelect: "none" as const,
      }
    : {};

  const className = [overlay.className, overlayClass].filter(Boolean).join(" ");

  if (overlay.inner) {
    return (
      <span className={className} style={{ ...overlay.style, ...blurStyle }}>
        <span
          className={overlay.inner.className}
          style={overlay.inner.style}
          dir="ltr"
          lang="en"
        >
          {overlay.inner.value}
        </span>
      </span>
    );
  }

  return (
    <span
      dir="ltr"
      lang="en"
      className={className}
      style={{ ...overlay.style, ...blurStyle }}
      aria-hidden={blur || undefined}
    >
      {overlay.value}
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
}: PlateWithOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [renderState, setRenderState] = useState<PlateRenderState | null>(() =>
    preview
      ? computePlateRenderState(preview, plate_code, plate_digits, 420)
      : null,
  );

  const updateRenderState = useCallback(() => {
    const rootWidth = rootRef.current?.clientWidth || 420;
    const next = computePlateRenderState(
      preview,
      plate_code,
      plate_digits,
      rootWidth,
    );
    setRenderState(next);
  }, [preview, plate_code, plate_digits]);

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
