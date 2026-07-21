"use client";

import { Fragment } from "react";
import { DirhamSymbol } from "dirham/react";
import type { ComponentProps } from "react";

type DirhamSymbolProps = ComponentProps<typeof DirhamSymbol>;

interface DirhamTextProps {
  text: string;
  symbolSize?: DirhamSymbolProps["size"];
  weight?: DirhamSymbolProps["weight"];
}

export default function DirhamText({
  text,
  symbolSize = "1em",
  weight = "regular",
}: DirhamTextProps) {
  const parts = text.split("{dirham}");

  if (parts.length === 1) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <DirhamSymbol size={symbolSize} weight={weight} aria-hidden />
          )}
        </Fragment>
      ))}
    </>
  );
}
