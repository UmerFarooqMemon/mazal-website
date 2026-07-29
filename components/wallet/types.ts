export type WalletTransactionKind = "top_up" | "cash_out" | "purchase";

export type WalletFundingSource = "card" | "bank";

export interface WalletTransaction {
  id: string;
  kind: WalletTransactionKind;
  /** Card last four digits for card top ups, bank name for transfers/payouts. */
  reference: string;
  source: WalletFundingSource;
  amount: number;
  createdAt: string;
  /** Short right-hand caption, e.g. "Bought AA 777". */
  note?: string;
}

export interface WalletHold {
  id: string;
  amount: number;
  reference: string;
  source: WalletFundingSource;
  createdAt: string;
  /** Auction the deposit is held against, when the hold came from a deposit. */
  auctionId?: string;
}

export interface WalletState {
  balance: number;
  income: number;
  spending: number;
  transactions: WalletTransaction[];
  holds: WalletHold[];
}
