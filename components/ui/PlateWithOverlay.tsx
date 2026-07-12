"use client";

interface PlateWithOverlayProps {
  plate_code: string;
  plate_digits: string;
  emirate?: string;
  isMobile?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export default function PlateWithOverlay({
  plate_code,
  plate_digits,
  emirate = "DUBAI",
  isMobile = false,
  width,
  height,
  className = "",
}: PlateWithOverlayProps) {
  const w = width || (isMobile ? 110 : 130);
  const h = height || (isMobile ? 38 : 44);

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      {/* Background Plate Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/certificates-preview.png"
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
          color: "#1a1a1a",
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
          color: "#1a1a1a",
          lineHeight: 1,
          zIndex: 10,
        }}
      >
        {plate_digits}
      </span>
    </div>
  );
}
