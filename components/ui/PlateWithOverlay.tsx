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

      {/* Plate Code - Left Side */}
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: isMobile ? "14%" : "16%",
          transform: "translateY(-50%)",
          fontSize: isMobile ? "14px" : "18px",
          fontWeight: 700,
          color: getColor("primaryText"),
          lineHeight: 1,
          zIndex: 10,
        }}
      >
        {plate_code}
      </span>

      {/* Plate Digits - Right Side */}
      <span
        style={{
          position: "absolute",
          top: "50%",
          right: isMobile ? "14%" : "16%",
          transform: "translateY(-50%)",
          fontSize: isMobile ? "14px" : "18px",
          fontWeight: 700,
          color: getColor("primaryText"),
          lineHeight: 1,
          zIndex: 10,
        }}
      >
        {plate_digits}
      </span>
    </div>
  );
}
