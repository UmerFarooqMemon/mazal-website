import type {
  GiftProduct,
  GiftProductSelection,
} from "@/services/products";

export type GiftPackageId = number | "";

export function toGiftPackageId(value: unknown): GiftPackageId {
  const parsed =
    typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : "";
}

export function giftProductAmount(
  value: string | number | null | undefined,
): number {
  if (value == null || value === "") return 0;
  const parsed =
    typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function findGiftProduct(
  products: GiftProduct[],
  id: GiftPackageId | null | undefined,
): GiftProduct | undefined {
  const productId = toGiftPackageId(id);
  if (productId === "") return undefined;
  return products.find((product) => product.id === productId);
}

export function formatGiftPackageLabel(
  name: string,
  template = "{name} Package",
): string {
  return template.replace("{name}", name);
}

export interface GiftBoxSummary {
  label: string | null;
  amount: number | null;
  includedInTotals: boolean;
}

export function resolveGiftBoxSummary(options: {
  isGiftCustody: boolean;
  selectedProductId: GiftPackageId | null | undefined;
  products: GiftProduct[];
  apiGift?: GiftProductSelection | null;
  apiTotalDue?: string | number | null;
  labelTemplate: string;
}): GiftBoxSummary {
  if (!options.isGiftCustody) {
    return { label: null, amount: null, includedInTotals: false };
  }

  const selected = findGiftProduct(options.products, options.selectedProductId);
  const apiGift = options.apiGift || null;
  const matchesApi =
    Boolean(apiGift) && selected != null && apiGift!.product_id === selected.id;
  const name =
    (matchesApi ? apiGift?.snapshot?.name : undefined) ||
    selected?.name ||
    apiGift?.snapshot?.name;

  if (!name) {
    return { label: null, amount: null, includedInTotals: false };
  }

  const amount = matchesApi
    ? giftProductAmount(apiGift?.amount)
    : selected
      ? giftProductAmount(selected.price)
      : giftProductAmount(apiGift?.amount);

  const includedInTotals = Boolean(
    matchesApi && options.apiTotalDue != null && options.apiTotalDue !== "",
  );

  return {
    label: formatGiftPackageLabel(name, options.labelTemplate),
    amount: amount > 0 ? amount : null,
    includedInTotals,
  };
}

export function detailsFromGiftProduct(
  gift: GiftProductSelection | null | undefined,
) {
  if (!gift?.product_id) {
    return {};
  }

  return {
    custodyIntent: "gift" as const,
    giftPackageId: toGiftPackageId(gift.product_id),
    giftRecipientName: gift.recipient?.name || "",
    giftRecipientPhone: gift.recipient?.phone || "",
    giftRecipientAddress: gift.recipient?.address || "",
    giftRecipientNotes: gift.recipient?.notes || "",
  };
}
