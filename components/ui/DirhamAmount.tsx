"use client";

import { DirhamPrice } from "dirham/react";
import type { ComponentProps } from "react";
import { useLocale } from "@/context/LocaleContext";

type DirhamAmountProps = Omit<ComponentProps<typeof DirhamPrice>, "locale"> & {
  locale?: string;
};

export default function DirhamAmount({
  amount,
  decimals = 0,
  locale: localeProp,
  weight = "regular",
  ...props
}: DirhamAmountProps) {
  const { locale } = useLocale();
  const dirhamLocale = localeProp ?? (locale === "ar" ? "ar-AE" : "en-AE");

  return (
    <DirhamPrice
      amount={amount}
      decimals={decimals}
      locale={dirhamLocale}
      weight={weight}
      {...props}
    />
  );
}
