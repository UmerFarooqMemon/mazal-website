"use client";

import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { DirhamAmount } from "@/components/ui";
import { collectionFeeAed, type MoneyAed } from "@/lib/collection-fee";

interface CollectionFeeNoticeProps {
  collectionFeeAmount?: MoneyAed | null;
  className?: string;
}

/** Standalone fee line for slot-picker / checkout detail screens. */
export default function CollectionFeeNotice({
  collectionFeeAmount,
  className = "text-sm mb-3",
}: CollectionFeeNoticeProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();

  if (!collectionFeeAmount || collectionFeeAed(collectionFeeAmount) <= 0) {
    return null;
  }

  return (
    <p className={className} style={{ color: getColor("secondaryText") }}>
      {t("common.collection_fee")}{" "}
      <DirhamAmount
        amount={collectionFeeAed(collectionFeeAmount)}
        decimals={2}
        weight="medium"
      />
    </p>
  );
}
