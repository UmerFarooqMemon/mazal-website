export type GiftPackageId = "18_karat" | "21_karat" | "24_karat" | "metallic";

export interface GiftPackage {
  id: GiftPackageId;
  price: number;
  nameKey: string;
  /** Right-side detail lines inside the bordered header box */
  detailKeys: string[];
}

export const GIFT_PACKAGE_IMAGE = "/private-deal/gift-package.png";

export const GIFT_PACKAGES: GiftPackage[] = [
  {
    id: "18_karat",
    price: 5000,
    nameKey: "gift_pkg_18_karat",
    detailKeys: [
      "gift_pkg_theme_floral",
      "gift_pkg_theme_palette_18",
      "gift_pkg_theme_flowers_18",
    ],
  },
  {
    id: "21_karat",
    price: 10000,
    nameKey: "gift_pkg_21_karat",
    detailKeys: [
      "gift_pkg_theme_floral",
      "gift_pkg_theme_palette_21",
      "gift_pkg_theme_flowers_21",
    ],
  },
  {
    id: "24_karat",
    price: 15000,
    nameKey: "gift_pkg_24_karat",
    detailKeys: [
      "gift_pkg_theme_floral",
      "gift_pkg_theme_palette_24",
      "gift_pkg_theme_flowers_24",
    ],
  },
  {
    id: "metallic",
    price: 25000,
    nameKey: "gift_pkg_metallic",
    detailKeys: [
      "gift_pkg_theme_floral",
      "gift_pkg_theme_palette_metallic",
      "gift_pkg_theme_flowers_metallic",
    ],
  },
];

export function getGiftPackage(id?: string | null): GiftPackage | undefined {
  if (!id) return undefined;
  return GIFT_PACKAGES.find((pkg) => pkg.id === id);
}
