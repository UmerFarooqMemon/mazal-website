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
  /** Raw `auction.current_high_bid` when the API sent a value (not null). */
  currentHighBid: number | null;
  currentBid: number;
  minBidIncrement: number;
  views: number;
  startsAt?: string | null;
  endsAt?: string | null;
  endsIn?: string;
  startsIn?: string;
  currentBids?: number;
  timeLeft?: string;
  /** Marketplace lifecycle — reserved/sold badges use this, not auction.outcome. */
  marketplaceStatus?: string;
  previouslySold?: boolean;
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
  | { method: "card"; amount: number }
  | {
      method: "bank";
      amount: number;
      payment_reference: string;
      notes?: string;
      evidence: File;
    }
  | {
      method: "managers_check";
      amount: number;
      check_number: string;
      collection_slot_id: number;
      pickup_address: string;
      notes?: string;
    }
  | {
      method: "cash";
      amount: number;
      collection_slot_id: number;
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
