export type WalletFundingSource =
  | "card"
  | "bank_transfer"
  | "managers_check"
  | "cash_collection";

/** @deprecated Prefer WalletLedgerTransaction from services/wallet */
export type WalletTransactionKind =
  | "top_up"
  | "cash_out"
  | "purchase"
  | "deposit"
  | "profit"
  | "hold"
  | "release"
  | "refund"
  | "adjustment";

export interface WalletTransaction {
  id: string | number;
  kind: WalletTransactionKind | string;
  reference: string;
  source?: WalletFundingSource | string;
  amount: number;
  signedAmount?: number;
  createdAt: string;
  note?: string;
  direction?: "credit" | "debit" | string;
}

export interface WalletHold {
  id: string;
  sourceId: number;
  listingId: number;
  amount: number;
  releasableAmount: number;
  totalDepositAmount: number;
  releasedAmount: number;
  plate?: string | null;
  createdAt?: string | null;
}
