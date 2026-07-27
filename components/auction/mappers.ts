import type {
  MarketplaceAuction,
  MarketplaceAuctionRegistration,
  MarketplaceListingCard,
  MarketplaceListingDetail,
} from "@/services/marketplace";
import type {
  AuctionKind,
  AuctionListing,
  AuctionListingStatus,
  AuctionSummaryData,
} from "./types";

function toNumber(value: number | string | null | undefined): number {
  if (value == null || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCountdown(targetIso: string): string {
  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return "—";

  const diffMs = Math.max(0, target - Date.now());
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (days > 0) {
    return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  if (hours > 0) {
    return `${hours}h ${pad(minutes)}:${pad(seconds)}`;
  }

  return `${minutes}m: ${pad(seconds)} S`;
}

function deriveAuctionStatus(
  auction: MarketplaceAuction | null | undefined,
  listingStatus?: string,
): AuctionListingStatus {
  if (!auction) {
    return listingStatus === "closed" ? "closed" : "upcoming";
  }

  if (auction.closed_at || auction.outcome) {
    return "closed";
  }

  if (auction.is_bidding_open) {
    return "live";
  }

  const now = Date.now();
  const startsAt = new Date(auction.starts_at).getTime();
  const endsAt = new Date(auction.ends_at).getTime();

  if (!Number.isNaN(startsAt) && now < startsAt) {
    const minutesUntilStart = (startsAt - now) / 60000;
    if (minutesUntilStart <= 30) return "starting_soon";
    return auction.is_registration_open ? "scheduled" : "upcoming";
  }

  if (!Number.isNaN(endsAt) && now > endsAt) {
    return "closed";
  }

  if (auction.is_registration_open) {
    return "scheduled";
  }

  return "upcoming";
}

function deriveAuctionKind(auction: MarketplaceAuction | null | undefined): AuctionKind {
  if (!auction) return "open";
  if (auction.is_registration_open && !auction.is_bidding_open) {
    return "scheduled";
  }
  return "open";
}

function extractPlateFields(listing: MarketplaceListingCard) {
  let code = listing.plate_code || "";
  let digits = listing.plate_digits || "";

  if (!digits && listing.display_plate) {
    const match = listing.display_plate.match(/^([A-Za-z]+)\s*[-|]?\s*(\d+)$/);
    if (match) {
      code = code || match[1].toUpperCase();
      digits = match[2];
    } else {
      digits = listing.display_plate.trim();
    }
  }

  return {
    code,
    digits,
    plateVariant:
      listing.plate_design ||
      listing.plate_type ||
      "private_new_colorful",
    emirate: listing.emirate_label?.toUpperCase() || listing.emirate,
  };
}

export function mapListingToAuctionListing(
  listing: MarketplaceListingCard,
  auction?: MarketplaceAuction | null,
): AuctionListing {
  const plate = extractPlateFields(listing);
  const status = deriveAuctionStatus(auction, listing.status);
  const kind = deriveAuctionKind(auction);
  const isTimedStart =
    status === "scheduled" ||
    status === "upcoming" ||
    status === "starting_soon" ||
    status === "paused";

  const currentBid = auction
    ? toNumber(auction.current_high_bid) ||
      toNumber(auction.starting_price) ||
      toNumber(auction.reserve_price) ||
      listing.asking_price
    : listing.asking_price;

  return {
    id: String(listing.id),
    code: plate.code,
    digits: plate.digits,
    emirate: plate.emirate,
    plateVariant: plate.plateVariant,
    kind,
    status,
    currentBid,
    views: listing.view_count,
    currentBids: auction?.bid_count,
    startsIn:
      isTimedStart && auction?.starts_at
        ? formatCountdown(auction.starts_at)
        : undefined,
    endsIn:
      !isTimedStart && auction?.ends_at
        ? formatCountdown(auction.ends_at)
        : undefined,
    timeLeft: auction?.ends_at ? formatCountdown(auction.ends_at) : undefined,
  };
}

export function mapDetailToAuctionListing(
  listing: MarketplaceListingDetail,
): AuctionListing {
  return mapListingToAuctionListing(listing, listing.auction);
}

function mapDepositStatus(
  registration?: MarketplaceAuctionRegistration | null,
): AuctionSummaryData["depositStatus"] {
  if (!registration) return "not_submitted";

  const status = registration.deposit_status?.toLowerCase() || "";
  if (
    status.includes("held") ||
    status.includes("confirm") ||
    status.includes("verified") ||
    status.includes("complete")
  ) {
    return "verified";
  }
  if (status.includes("pending") || status.includes("await")) {
    return "pending";
  }
  return "not_submitted";
}

export function mapToAuctionSummary(
  auction: MarketplaceAuction,
  registration?: MarketplaceAuctionRegistration | null,
): AuctionSummaryData {
  const depositAmount = toNumber(
    registration?.deposit_amount ?? auction.registration_deposit,
  );
  const currentPrice =
    toNumber(auction.current_high_bid) ||
    toNumber(auction.starting_price) ||
    toNumber(auction.reserve_price);

  return {
    currentBiddingLimit: depositAmount * 5,
    minimumDeposit: depositAmount,
    targetBiddingLimit: depositAmount * 5,
    depositStatus: mapDepositStatus(registration),
    currentPrice,
    checkAmount: depositAmount > 0 ? depositAmount * 3 : undefined,
  };
}
