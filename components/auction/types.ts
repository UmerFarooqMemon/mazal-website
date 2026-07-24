export type AuctionListingStatus =
  | "scheduled"
  | "live"
  | "closed"
  | "upcoming"
  | "starting_soon"
  | "paused";

export type AuctionKind = "scheduled" | "open";

export interface AuctionListing {
  id: string;
  code: string;
  digits: string;
  emirate: string;
  plateVariant: string;
  kind: AuctionKind;
  status: AuctionListingStatus;
  currentBid: number;
  views: number;
  endsIn?: string;
  startsIn?: string;
  currentBids?: number;
  timeLeft?: string;
}

export type DepositPaymentMethod =
  | "bank"
  | "card"
  | "managers_check"
  | "cash";

export type DepositPaymentMode = "single" | "split";

export interface AuctionSummaryData {
  currentBiddingLimit: number;
  minimumDeposit: number;
  targetBiddingLimit: number;
  depositStatus: "not_submitted" | "pending" | "verified";
  currentPrice: number;
  checkAmount?: number;
}
