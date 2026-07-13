"use client";

import { useTheme } from "@/context/ThemeContext";

interface OverlayConfig {
  left?: string;
  right?: string;
  top?: string;
  transform?: string;
  font_size?: string;
  font_weight?: string;
  color?: string;
  font_family?: string;
  hide_when_code?: string[];
}

interface PlatePreview {
  background_image_url?: string;
  width?: number;
  height?: number;
  aspect_ratio?: string;
  overlays?: {
    plate_code?: OverlayConfig;
    plate_digits?: OverlayConfig;
  };
}

interface PlateWithOverlayProps {
  plate_code: string;
  plate_digits: string;
  emirate?: string;
  isMobile?: boolean;
  width?: number;
  className?: string;
  imageUrl?: string;
  preview?: PlatePreview;
  isRTL?: boolean;
}

export default function PlateWithOverlay({
  plate_code,
  plate_digits,
  emirate = "DUBAI",
  isMobile = false,
  width,
  className = "",
  imageUrl,
  preview,
  isRTL = false,
}: PlateWithOverlayProps) {
  const { getColor } = useTheme();

  const backgroundUrl = preview?.background_image_url || "";

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

  // Build overlay styles directly from API config
  const buildOverlayStyle = (overlay: OverlayConfig | undefined): React.CSSProperties => {
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
    if (overlay.font_size) style.fontSize = overlay.font_size;
    if (overlay.font_weight) style.fontWeight = overlay.font_weight;
    if (overlay.color) style.color = overlay.color;
    if (overlay.font_family) style.fontFamily = overlay.font_family;

    // Match backend: code (left-positioned) centers, digits (right-positioned) align right
    if (overlay.left && !overlay.right) style.textAlign = "center";
    else if (overlay.right && !overlay.left) style.textAlign = "right";
    else style.textAlign = "center";

    return style;
  };

  const codeStyle = buildOverlayStyle(codeOverlay);
  const digitsStyle = buildOverlayStyle(digitsOverlay);

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{
        width: width ? `${width}px` : "100%",
        aspectRatio,
        backgroundImage: `url("${backgroundUrl}")`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "transparent",
        borderRadius: "3px",
        overflow: "hidden",
        containerType: "inline-size",
        mixBlendMode: "multiply",
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

      {!shouldHideCode && plate_code && codeOverlay && (
        <span className="plate-text" style={codeStyle}>
          {plate_code}
        </span>
      )}

      {plate_digits && digitsOverlay && (
        <span className="plate-text" style={digitsStyle}>
          {plate_digits}
        </span>
      )}
    </div>
  );
}
