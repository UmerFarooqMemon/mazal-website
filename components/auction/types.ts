import type { PlatePreviewConfig } from "@/lib/plate-preview";

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
  plateType?: string;
  plateDesign?: string;
  /** Plate render config from the listing API, when provided. */
  preview?: PlatePreviewConfig | null;
  kind: AuctionKind;
  status: AuctionListingStatus;
  askingPrice: number;
  currentBid: number;
  views: number;
  endsIn?: string;
  startsIn?: string;
  currentBids?: number;
  timeLeft?: string;
  /** When true, the plate code letter is blurred on the plate preview. */
  hideCode?: boolean;
}

export type DepositPaymentMethod =
  | "bank"
  | "card"
  | "managers_check"
  | "cash"
  | "wallet";

export type DepositPaymentMode = "single" | "split";

export type DepositPaymentSubmitPayload =
  | { method: "card" }
  | {
      method: "bank";
      payment_reference: string;
      notes?: string;
      evidence: File;
    }
  | {
      method: "managers_check";
      check_number: string;
      collection_date: string;
      collection_time: string;
      pickup_address: string;
      notes?: string;
    }
  | {
      method: "cash";
      collection_date: string;
      collection_time: string;
      pickup_address: string;
      notes?: string;
    };

export interface AuctionSummaryData {
  currentBiddingLimit: number;
  minimumDeposit: number;
  targetBiddingLimit: number;
  depositStatus: "not_submitted" | "pending" | "verified";
  currentPrice: number;
  checkAmount?: number;
}
