import type { GiftProduct } from "@/services/products";
import type { GiftPackageId } from "@/lib/gift-box";

export type { GiftPackageId };

export const GIFT_PACKAGE_IMAGE = "/private-deal/gift-package.png";

/** Used when GET /products is unavailable so the gift UI still renders. */
export const FALLBACK_GIFT_PRODUCTS: GiftProduct[] = [
  {
    id: 1,
    name: "18 KARAT",
    slug: "18-karat",
    image_url: GIFT_PACKAGE_IMAGE,
    price: "5000.00",
    currency: "AED",
    floral_theme: "White, Ivory & Champagne",
    flowers: "White Avalanche Roses, White Lisianthus",
    description: null,
    sort_order: 10,
  },
  {
    id: 2,
    name: "21 KARAT",
    slug: "21-karat",
    image_url: GIFT_PACKAGE_IMAGE,
    price: "10000.00",
    currency: "AED",
    floral_theme: "Blush, Cream & Soft Gold",
    flowers: "Blush Roses, Cream Peonies",
    description: null,
    sort_order: 20,
  },
  {
    id: 3,
    name: "24 KARAT",
    slug: "24-karat",
    image_url: GIFT_PACKAGE_IMAGE,
    price: "15000.00",
    currency: "AED",
    floral_theme: "Gold, Ivory & Champagne",
    flowers: "Golden Roses, Ivory Orchids",
    description: null,
    sort_order: 30,
  },
  {
    id: 4,
    name: "METALLIC",
    slug: "metallic",
    image_url: GIFT_PACKAGE_IMAGE,
    price: "25000.00",
    currency: "AED",
    floral_theme: "Silver, Graphite & Pearl",
    flowers: "White Roses, Silver Dust Eucalyptus",
    description: null,
    sort_order: 40,
  },
];

export function getGiftPackage(
  products: GiftProduct[],
  id?: GiftPackageId | null,
): GiftProduct | undefined {
  if (!id) return undefined;
  return products.find((pkg) => pkg.id === id);
}
