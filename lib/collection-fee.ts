export type MoneyAed = string;

export interface CollectionFeeMethodOption {
  key: string;
  label?: string;
  collection_fee_amount?: string;
  collection_fee_currency?: string;
}

const CASH_CHEQUE_METHOD_KEYS = new Set([
  "cash_collection",
  "cash",
  "managers_check",
]);

export function collectionFeeAed(amount: MoneyAed | null | undefined): number {
  const parsed = Number(amount ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCollectionFee(
  amount: MoneyAed | null | undefined,
): string | null {
  const value = collectionFeeAed(amount);
  if (value <= 0) return null;
  return `AED ${value.toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function isCashOrChequeMethodKey(key: string): boolean {
  return CASH_CHEQUE_METHOD_KEYS.has(key);
}

export function uiMethodToApiKey(method: string): string {
  if (method === "bank") return "bank_transfer";
  if (method === "cash") return "cash_collection";
  return method;
}

export function resolveMethodCollectionFeeAmount(
  methodKey: string,
  options?: CollectionFeeMethodOption[] | null,
  topLevelFee?: MoneyAed | null,
): MoneyAed | null {
  if (!isCashOrChequeMethodKey(methodKey)) return null;

  const apiKey = uiMethodToApiKey(methodKey);
  const match = options?.find(
    (item) => item.key === apiKey || item.key === methodKey,
  );
  const amount = match?.collection_fee_amount ?? topLevelFee ?? "0.00";
  return collectionFeeAed(amount) > 0 ? amount : null;
}

export function resolveMethodCollectionFeeLabel(
  methodKey: string,
  options?: CollectionFeeMethodOption[] | null,
  topLevelFee?: MoneyAed | null,
): string | null {
  const amount = resolveMethodCollectionFeeAmount(
    methodKey,
    options,
    topLevelFee,
  );
  return amount ? formatCollectionFee(amount) : null;
}
