"use client";

import { useTheme } from "@/context/ThemeContext";

interface PlateWithOverlayProps {
  plate_code: string;
  plate_digits: string;
  emirate?: string;
  isMobile?: boolean;
  width?: number;
  height?: number;
  className?: string;
  imageUrl?: string;
}

export default function PlateWithOverlay({
  plate_code,
  plate_digits,
  emirate = "DUBAI",
  isMobile = false,
  width,
  height,
  className = "",
  imageUrl,
}: PlateWithOverlayProps) {
  const { getColor } = useTheme();
  const w = width || (isMobile ? 110 : 130);
  const h = height || (isMobile ? 38 : 44);

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      {/* Add the metal-plate-text CSS as a style tag */}
      <style jsx>{`
        .metal-plate-text {
          display: inline-block;
          isolation: isolate;
          white-space: nowrap;
          font-family: Arial, Helvetica, sans-serif !important;
          font-weight: 700 !important;
          letter-spacing: -0.02em;
          color: #4a4a4a !important;
          -webkit-text-fill-color: #4a4a4a;
          text-shadow:
            0 -1px 0 rgba(255, 255, 255, 0.5),
            0 1px 0 rgba(0, 0, 0, 0.2) !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: geometricPrecision;
        }
        @supports ((-webkit-background-clip: text) or (background-clip: text)) {
          .metal-plate-text {
            background-image: linear-gradient(
              180deg,
              #383838 0%,
              #454545 18%,
              #4e4e4e 42%,
              #585858 60%,
              #6e6e6e 70%,
              #8f8f8f 75%,
              #a8a8a8 78%,
              #757575 84%,
              #4a4a4a 94%,
              #383838 100%
            );
            background-size: 100% 100%;
            background-repeat: no-repeat;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent !important;
            -webkit-text-fill-color: transparent;
            -webkit-text-stroke: 0.15px rgba(32, 32, 32, 0.45);
            text-shadow: none !important;
            filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.22))
              drop-shadow(0 -0.75px 0 rgba(255, 255, 255, 0.42));
          }
        }

        .metal-plate-text-rtl {
          display: inline-block;
          isolation: isolate;
          white-space: nowrap;
          font-family: Arial, Helvetica, sans-serif !important;
          font-weight: 700 !important;
          letter-spacing: -0.02em;
          color: #4a4a4a !important;
          -webkit-text-fill-color: #4a4a4a;
          text-shadow:
            0 -1px 0 rgba(255, 255, 255, 0.5),
            0 1px 0 rgba(0, 0, 0, 0.2) !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: geometricPrecision;
          direction: ltr !important;
          unicode-bidi: isolate;
        }
        @supports ((-webkit-background-clip: text) or (background-clip: text)) {
          .metal-plate-text-rtl {
            background-image: linear-gradient(
              180deg,
              #383838 0%,
              #454545 18%,
              #4e4e4e 42%,
              #585858 60%,
              #6e6e6e 70%,
              #8f8f8f 75%,
              #a8a8a8 78%,
              #757575 84%,
              #4a4a4a 94%,
              #383838 100%
            );
            background-size: 100% 100%;
            background-repeat: no-repeat;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent !important;
            -webkit-text-fill-color: transparent;
            -webkit-text-stroke: 0.15px rgba(32, 32, 32, 0.45);
            text-shadow: none !important;
            filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.22))
              drop-shadow(0 -0.75px 0 rgba(255, 255, 255, 0.42));
          }
        }
      `}</style>

      <img
        src={imageUrl || "/here-plate.png"}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          zIndex: 1,
        }}
      />

      {/* Plate Code - Left Side with metallic effect */}
      <span
        className="metal-plate-text"
        style={{
          position: "absolute",
          top: "50%",
          left: isMobile ? "14%" : "16%",
          transform: "translateY(-50%)",
          fontSize: isMobile ? "14px" : "18px",
          lineHeight: 1,
          zIndex: 10,
        }}
      >
        {plate_code}
      </span>

      {/* Plate Digits - Right Side with metallic effect */}
      <span
        className="metal-plate-text"
        style={{
          position: "absolute",
          top: "50%",
          right: isMobile ? "14%" : "16%",
          transform: "translateY(-50%)",
          fontSize: isMobile ? "14px" : "18px",
          lineHeight: 1,
          zIndex: 10,
        }}
      >
        {plate_digits}
      </span>
    </div>
  );
}
