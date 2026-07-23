import type { HomeV2Plate } from "@/components/home-v2/HomeV2PlateCard";

export type HomeV2PlateDetail = HomeV2Plate & {
  listingType: string;
  description: string;
  sellerDeals: number;
  watchers: number;
  activeOffers: number;
};

function buildDescription(plate: HomeV2Plate): string {
  const emirate = plate.emirate ?? "Dubai";
  return `An exceptional ${emirate} plate combining ${plate.code} with the digit pattern '${plate.digits}'. Held by a top-rated trader with a flawless transaction history. Available with full Mazal escrow protection.`;
}

function enrich(plate: HomeV2Plate, extras?: Partial<HomeV2PlateDetail>): HomeV2PlateDetail {
  return {
    listingType: "Direct",
    description: buildDescription(plate),
    sellerDeals: 32,
    watchers: Math.max(40, Math.round(plate.views * 0.025)),
    activeOffers: 8,
    ...plate,
    ...extras,
  };
}

export const WATCHING_PLATES: HomeV2PlateDetail[] = [
  enrich(
    {
      id: "w1",
      code: "P",
      digits: "1",
      price: 5_100_000,
      views: 6004,
      rating: 4.9,
      tier: "diamond",
      showHeart: true,
    },
    { watchers: 152, activeOffers: 8 },
  ),
  enrich({
    id: "w2",
    code: "K",
    digits: "5",
    price: 4_200_000,
    views: 6004,
    rating: 4.9,
    tier: "diamond",
  }),
  enrich({
    id: "w3",
    code: "S",
    digits: "9",
    price: 2_200_000,
    views: 6004,
    rating: 4.9,
    tier: "diamond",
  }),
  enrich({
    id: "w4",
    code: "D",
    digits: "3",
    price: 1_850_000,
    views: 4394,
    rating: 4.8,
    tier: "diamond",
  }),
  enrich({
    id: "w5",
    code: "H",
    digits: "2",
    price: 980_000,
    views: 3120,
    rating: 4.9,
    tier: "gold",
  }),
  enrich({
    id: "w6",
    code: "B",
    digits: "11",
    price: 640_000,
    views: 2105,
    rating: 4.7,
    tier: "silver",
  }),
];

export const TRENDING_PLATES: HomeV2PlateDetail[] = [
  enrich({
    id: "t1",
    code: "A",
    digits: "7",
    price: 3_400_000,
    views: 5210,
    rating: 4.9,
    tier: "diamond",
  }),
  enrich({
    id: "t2",
    code: "M",
    digits: "88",
    price: 6_200_000,
    views: 8840,
    rating: 4.9,
    tier: "verified",
  }),
  enrich({
    id: "t3",
    code: "L",
    digits: "4",
    price: 680_000,
    views: 2210,
    rating: 4.9,
    tier: "gold",
  }),
  enrich({
    id: "t4",
    code: "R",
    digits: "12",
    price: 2_200_000,
    views: 4022,
    rating: 4.8,
    tier: "diamond",
  }),
  enrich({
    id: "t5",
    code: "C",
    digits: "55",
    price: 540_000,
    views: 1750,
    rating: 4.8,
    tier: "silver",
  }),
  enrich({
    id: "t6",
    code: "N",
    digits: "6",
    price: 1_150_000,
    views: 2980,
    rating: 4.9,
    tier: "gold",
  }),
];

const ALL_PLATES = [...WATCHING_PLATES, ...TRENDING_PLATES];

export function getHomeV2PlateById(id: string): HomeV2PlateDetail | undefined {
  return ALL_PLATES.find((plate) => plate.id === id);
}

export function getSimilarHomeV2Plates(
  plate: HomeV2PlateDetail,
  limit = 3,
): HomeV2PlateDetail[] {
  const sameCodeOrDigits = ALL_PLATES.filter(
    (candidate) =>
      candidate.id !== plate.id &&
      (candidate.code === plate.code ||
        candidate.digits.length === plate.digits.length),
  );

  if (sameCodeOrDigits.length >= limit) {
    return sameCodeOrDigits.slice(0, limit);
  }

  const filler = ALL_PLATES.filter(
    (candidate) =>
      candidate.id !== plate.id &&
      !sameCodeOrDigits.some((item) => item.id === candidate.id),
  );

  return [...sameCodeOrDigits, ...filler].slice(0, limit);
}
