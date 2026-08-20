"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import {
  collectionFeeAed,
  resolveMethodCollectionFeeAmount,
  type CollectionFeeMethodOption,
  type MoneyAed,
} from "@/lib/collection-fee";

interface CollectionFeeLabelProps {
  methodKey: string;
  collectionFeeAmount?: MoneyAed | null;
  paymentMethodFees?: CollectionFeeMethodOption[] | null;
  className?: string;
}

export default function CollectionFeeLabel({
  methodKey,
  collectionFeeAmount,
  paymentMethodFees,
  className = "text-sm",
}: CollectionFeeLabelProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();
  const amount =
    resolveMethodCollectionFeeAmount(
      methodKey,
      paymentMethodFees,
      collectionFeeAmount,
    ) ?? null;

  if (!amount || collectionFeeAed(amount) <= 0) return null;

  return (
    <span className={className} style={{ color: getColor("mutedText") }}>
      {t("common.collection_fee")}{" "}
      <DirhamAmount amount={collectionFeeAed(amount)} decimals={2} />
    </span>
  );
}
