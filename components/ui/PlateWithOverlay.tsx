"use client";

import type {
  PlateOverlayConfig,
  PlatePreviewConfig,
} from "@/lib/plate-preview";

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

export default function PlateWithOverlay({
  plate_code,
  plate_digits,
  width,
  className = "",
  preview,
  hideCode = false,
}: PlateWithOverlayProps) {
  const backgroundUrl =
    preview?.background_image_url || "/plate-empty.png";

  const parseAspectRatio = (ratio?: string): string => {
    if (ratio) return ratio;
    const w = preview?.width || 840;
    const h = preview?.height || 592;
    return `${w} / ${h}`;
  };

  const aspectRatio = parseAspectRatio(preview?.aspect_ratio);

  const codeOverlay = preview?.overlays?.plate_code;
  const digitsOverlay = preview?.overlays?.plate_digits;

  const shouldHideCode =
    codeOverlay?.hide_when_code?.includes(plate_code) || false;

  const showCode =
    !shouldHideCode && Boolean(plate_code) && Boolean(codeOverlay);

  const showDigits = Boolean(plate_digits) && Boolean(digitsOverlay);

  // Build overlay styles directly from API config
  const buildOverlayStyle = (
    overlay: PlateOverlayConfig | undefined,
  ): React.CSSProperties => {
    if (!overlay) return { display: "none" };

    const style: React.CSSProperties = {
      position: "absolute",
      zIndex: 3,
      direction: "ltr",
      unicodeBidi: "plaintext",
      display: "inline-block",
      lineHeight: 1,
      whiteSpace: "nowrap",
      pointerEvents: "none",
    };

    if (overlay.left) style.left = overlay.left;
    if (overlay.right) style.right = overlay.right;
    if (overlay.top) style.top = overlay.top;
    if (overlay.transform) style.transform = overlay.transform;
    if (overlay.font_size)
      style.fontSize = overlay.font_size.replace(/vw/g, "cqw");
    if (overlay.font_weight) style.fontWeight = overlay.font_weight;
    if (overlay.color) style.color = overlay.color;
    style.fontFamily = overlay.font_family || "'CharlesWright', sans-serif";

    if (overlay.left && !overlay.right) style.textAlign = "center";
    else if (overlay.right && !overlay.left) style.textAlign = "right";
    else style.textAlign = "center";

    return style;
  };

  const codeStyle: React.CSSProperties = {
    ...buildOverlayStyle(codeOverlay),
    ...(hideCode
      ? {
          filter: "blur(5px)",
          userSelect: "none",
          WebkitUserSelect: "none",
        }
      : {}),
  };
  const digitsStyle = buildOverlayStyle(digitsOverlay);

  return (
    <div
      dir="ltr"
      className={`relative mx-auto shrink-0 ${className}`}
      style={{
        width: width ? `${width}px` : "100%",
        maxWidth: "100%",
        aspectRatio,
        backgroundImage: `url("${backgroundUrl}")`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundColor: "transparent",
        borderRadius: "3px",
        overflow: "hidden",
        containerType: "inline-size",
        direction: "ltr",
      }}
    >
      <style jsx>{`
        .plate-text {
          display: inline-block;
          isolation: isolate;
          white-space: nowrap;
          text-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      {showCode && (
        <span
          dir="ltr"
          lang="en"
          className={`plate-text${hideCode ? " select-none" : ""}`}
          style={codeStyle}
          aria-hidden={hideCode || undefined}
        >
          {plate_code}
        </span>
      )}

      {showDigits && (
        <span dir="ltr" lang="en" className="plate-text" style={digitsStyle}>
          {plate_digits}
        </span>
      )}
    </div>
  );
}
