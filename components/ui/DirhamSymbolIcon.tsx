"use client";

import { DirhamSymbol } from "dirham/react";
import type { ComponentProps } from "react";

type DirhamSymbolIconProps = ComponentProps<typeof DirhamSymbol>;

/** SVG Dirham mark sized for compact UI slots (inputs, badges). */
export default function DirhamSymbolIcon({
  size = 14,
  className,
  style,
  "aria-hidden": ariaHidden = true,
  ...props
}: DirhamSymbolIconProps) {
  return (
    <DirhamSymbol
      size={size}
      aria-hidden={ariaHidden}
      className={className}
      style={{ display: "block", ...style }}
      {...props}
    />
  );
}
