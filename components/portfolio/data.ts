export type PortfolioPlateStatus = "owned" | "listed" | "auction";

export interface PortfolioPlate {
  id: string;
  emirate: string;
  code: string;
  digits: string;
  estValue: number;
  returnPct: number;
  status: PortfolioPlateStatus;
  addedDate: string;
  views?: number;
  auctionRemaining?: string;
  isListed?: boolean;
  isAuction?: boolean;
}

export const portfolioStats = {
  plates: 6,
  totalEstValue: 196900,
  totalGainLoss: 40300,
  listed: 3,
  auction: 1,
};

export const portfolioPlates: PortfolioPlate[] = [
  {
    id: "1",
    emirate: "DUBAI",
    code: "A",
    digits: "777",
    estValue: 125000,
    returnPct: 27.6,
    status: "listed",
    addedDate: "2022-03-15",
    views: 6004,
    isListed: true,
  },
  {
    id: "2",
    emirate: "DUBAI",
    code: "A",
    digits: "777",
    estValue: 125000,
    returnPct: 27.6,
    status: "auction",
    addedDate: "2022-03-15",
    views: 6004,
    auctionRemaining: "5d 20h",
    isListed: true,
    isAuction: true,
  },
  {
    id: "3",
    emirate: "DUBAI",
    code: "A",
    digits: "777",
    estValue: 125000,
    returnPct: 27.6,
    status: "listed",
    addedDate: "2022-03-15",
    views: 4200,
    isListed: true,
  },
  {
    id: "4",
    emirate: "DUBAI",
    code: "A",
    digits: "777",
    estValue: 125000,
    returnPct: 27.6,
    status: "listed",
    addedDate: "2022-03-15",
    views: 3100,
    isListed: true,
  },
  {
    id: "5",
    emirate: "DUBAI",
    code: "A",
    digits: "777",
    estValue: 125000,
    returnPct: 27.6,
    status: "owned",
    addedDate: "2022-03-15",
  },
  {
    id: "6",
    emirate: "DUBAI",
    code: "A",
    digits: "777",
    estValue: 125000,
    returnPct: 27.6,
    status: "owned",
    addedDate: "2022-03-15",
  },
];

export function getPortfolioPlate(id: string): PortfolioPlate | undefined {
  return portfolioPlates.find((plate) => plate.id === id);
}

/** Figma screen 2 — plate ready to list (node 782-1180) */
export const figmaListPlate: PortfolioPlate = {
  id: "figma-list",
  emirate: "DUBAI",
  code: "A",
  digits: "777",
  estValue: 125000,
  returnPct: 27.6,
  status: "owned",
  addedDate: "2022-03-15",
};

/** Figma screen 3 — plate with live auction + marketplace (node 782-2031) */
export const figmaActivePlate: PortfolioPlate = {
  id: "figma-active",
  emirate: "DUBAI",
  code: "A",
  digits: "777",
  estValue: 125000,
  returnPct: 27.6,
  status: "auction",
  addedDate: "2022-03-15",
  views: 6004,
  auctionRemaining: "5d 20h",
  isListed: true,
  isAuction: true,
};

export function getPlateDetailMode(
  plate: PortfolioPlate,
): "list" | "active" {
  if (plate.status === "owned") return "list";
  return "active";
}
