import type {
  WalletFundingSource,
  WalletHold,
  WalletState,
  WalletTransaction,
} from "@/components/wallet/types";

const STORAGE_KEY = "mazal_wallet";

// Seeded from the wallet designs so the module is populated before the
// wallet endpoints exist. Replace `readInitialState` with an API read once
// the backend exposes /wallet.
const SEED_STATE: WalletState = {
  balance: 8750,
  income: 9850,
  spending: 1290,
  transactions: [
    {
      id: "wtx-1",
      kind: "top_up",
      reference: "4242",
      source: "card",
      amount: 4500,
      createdAt: minutesAgo(18),
      note: "activity_via_card",
    },
    {
      id: "wtx-2",
      kind: "cash_out",
      reference: "National Bank Ras Al Khaimah",
      source: "bank",
      amount: 4500,
      createdAt: minutesAgo(240),
      note: "activity_via_bank",
    },
    {
      id: "wtx-3",
      kind: "top_up",
      reference: "4242",
      source: "card",
      amount: 4500,
      createdAt: minutesAgo(60 * 26),
      note: "Bought AA 777",
    },
  ],
  holds: [
    {
      id: "whold-1",
      amount: 3000,
      reference: "4242",
      source: "card",
      createdAt: minutesAgo(60 * 30),
    },
    {
      id: "whold-2",
      amount: 1000,
      reference: "4242",
      source: "card",
      createdAt: minutesAgo(60 * 40),
    },
    {
      id: "whold-3",
      amount: 1000,
      reference: "4242",
      source: "card",
      createdAt: minutesAgo(60 * 50),
    },
  ],
};

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

let state: WalletState = SEED_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, quota) — keep the in-memory state.
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) state = { ...SEED_STATE, ...JSON.parse(saved) };
  } catch {
    // Ignore malformed payloads and stay on the seed state.
  }
}

function setState(next: WalletState) {
  state = next;
  persist();
  listeners.forEach((listener) => listener());
}

export function subscribeToWallet(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getWalletSnapshot() {
  hydrate();
  return state;
}

export function getWalletServerSnapshot() {
  return SEED_STATE;
}

export function topUpWallet(
  amount: number,
  source: WalletFundingSource,
  reference: string,
) {
  const transaction: WalletTransaction = {
    id: newId("wtx"),
    kind: "top_up",
    reference,
    source,
    amount,
    createdAt: new Date().toISOString(),
    note: source === "card" ? "activity_via_card" : "activity_via_bank",
  };
  setState({
    ...state,
    balance: state.balance + amount,
    income: state.income + amount,
    transactions: [transaction, ...state.transactions],
  });
}

export function cashOutWallet(amount: number, bankLabel: string) {
  const transaction: WalletTransaction = {
    id: newId("wtx"),
    kind: "cash_out",
    reference: bankLabel,
    source: "bank",
    amount,
    createdAt: new Date().toISOString(),
    note: "activity_via_bank",
  };
  setState({
    ...state,
    balance: Math.max(0, state.balance - amount),
    spending: state.spending + amount,
    transactions: [transaction, ...state.transactions],
  });
}

/** Moves balance into escrow so it shows under "Funds on Hold". */
export function holdWalletFunds(amount: number, auctionId?: string) {
  const hold: WalletHold = {
    id: newId("whold"),
    amount,
    reference: "Wallet",
    source: "card",
    createdAt: new Date().toISOString(),
    auctionId,
  };
  setState({
    ...state,
    balance: Math.max(0, state.balance - amount),
    holds: [hold, ...state.holds],
  });
}

/** Sends held deposit funds back to the spendable balance. */
export function releaseWalletFunds(amount: number) {
  let remaining = amount;
  const holds: WalletHold[] = [];

  for (const hold of state.holds) {
    if (remaining <= 0) {
      holds.push(hold);
      continue;
    }
    const taken = Math.min(hold.amount, remaining);
    remaining -= taken;
    if (hold.amount - taken > 0) {
      holds.push({ ...hold, amount: hold.amount - taken });
    }
  }

  setState({
    ...state,
    balance: state.balance + (amount - Math.max(0, remaining)),
    holds,
  });
}

/** Pays an amount straight out of the spendable balance. */
export function payFromWallet(amount: number, label = "Wallet") {
  const transaction: WalletTransaction = {
    id: newId("wtx"),
    kind: "purchase",
    reference: label,
    source: "card",
    amount,
    createdAt: new Date().toISOString(),
  };
  setState({
    ...state,
    balance: Math.max(0, state.balance - amount),
    spending: state.spending + amount,
    transactions: [transaction, ...state.transactions],
  });
}
