// ==========================================
// 1. Types of Plates
// ==========================================

export type PlateEmirate =
  | "Dubai"
  | "Abu Dhabi"
  | "Sharjah"
  | "Ajman"
  | "RAK"
  | "Umm Al Quwain"
  | "Fujairah";

export type PlateType = "DIRECT" | "AUCTION" | "SPOT";

export type PlateStatus = "Available" | "In Escrow" | "Sold" | "Pending Reveal";

export interface Plate {
  id: string | number;
  emirate: PlateEmirate;
  code: string; // For example, "M 7" or "K 55"
  price: number; // Price in UAE Dirhams
  type: PlateType;
  status: PlateStatus;
  views: number; // Number of views
  sellerId: string; // Seller ID
  sellerName: string; // Seller's name
  sellerRating: number; // Seller rating (0 - 5)
  isHidden: boolean; // (REV-01) Is the number hidden by a code?
  revealFee?: number; // Consultation fees (1500 dirhams by default)
  description?: string; // Optional description of the panel
  createdAt: Date;
  updatedAt: Date;
}

// When creating a new panel (input data)
export type CreatePlateInput = Omit<
  Plate,
  "id" | "views" | "status" | "createdAt" | "updatedAt"
>;

// ==========================================
// 2. Types of Users
// ==========================================

export type UserRole = "BUYER" | "TRADER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isKycVerified: boolean; // (TC-01) Did he document the emirate?
  createdAt: Date;
  // Relations
  watchlist?: string[]; // Matrix of IDs for follow-up boards
  ratings?: Rating[]; // The ratings received
}

export type CreateUserInput = Omit<User, "id" | "createdAt" | "ratings">;

// ==========================================
// 3. Types of Auctions
// ==========================================

export interface Auction {
  id: string;
  plateId: string;
  plate: Plate; // Full panel data
  startPrice: number;
  currentPrice: number;
  startTime: Date;
  endTime: Date;
  status: "Upcoming" | "Live" | "Ended";
  bidCount: number;
  highestBidderId?: string | null;
  isKycRequired: boolean; // (AUC-01)
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  createdAt: Date;
  isProxyBid?: boolean; // Is it an automated bidding process?
}

// ==========================================
// 4. Types of Transactions and Guarantees (Escrow & Transactions)
// ==========================================

export type TransactionStatus =
  | "Pending"
  | "In Custody"
  | "Paid"
  | "Ownership Transferred"
  | "Funds Released"
  | "Cancelled";

export interface Transaction {
  id: string;
  plateId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  status: TransactionStatus;
  // Fees according to (ESC-02)
  fees: {
    escrowFee: number; // 1%
    platformFee: number; // 4%
    serviceFee: number; // 3%
  };
  invoiceGenerated: boolean;
  paymentMethod?: "Card" | "Bank Transfer" | "Cash Pickup";
  createdAt: Date;
  completedAt?: Date;
}

// ==========================================
// 5. Types of Ratings - TC-02
// ==========================================

export interface Rating {
  id: string;
  fromUserId: string;
  toUserId: string;
  transactionId: string;
  score: number; // 1 - 5
  comment?: string;
  createdAt: Date;
}

// ==========================================
// 6. Types of API Responses
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface SearchFilters {
  emirate?: PlateEmirate;
  minPrice?: number;
  maxPrice?: number;
  type?: PlateType;
  digitCount?: number;
  code?: string;
}
