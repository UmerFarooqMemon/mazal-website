import { normalizeAcceptLanguage } from "@/lib/api-config";

export interface WalletApiResponse<T> {
  status?: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export type WalletDepositMethod =
  | "card"
  | "bank_transfer"
  | "managers_check"
  | "cash_collection";

export type WalletLedgerType =
  | "deposit"
  | "cash_out"
  | "profit"
  | "purchase"
  | "hold"
  | "release"
  | "adjustment"
  | "refund"
  | string;

export interface WalletBalance {
  id: number;
  balance: number;
  held_balance: number;
  available_balance: number;
  currency: string;
}

export interface WalletPaymentMethodOption {
  key: WalletDepositMethod | string;
  label: string;
}

export interface WalletLimits {
  min_deposit: number;
  max_deposit: number;
  min_cash_out: number;
  max_cash_out: number;
  max_split_entries: number;
}

export interface WalletProfitSettings {
  enabled: boolean;
  percent: number;
  min_total_deposit?: number;
}

export interface WalletBenefits {
  period: { key: string; from?: string | null; to?: string | null };
  currency: string;
  income: {
    total: number;
    breakdown: Record<string, number>;
  };
  spending: {
    total: number;
    breakdown: Record<string, number>;
  };
  net: number;
}

export interface WalletHold {
  source: string;
  source_id: number;
  listing_id: number;
  plate?: string | null;
  total_deposit_amount: number | string;
  released_amount: number | string;
  releasable_amount: number | string;
  currency: string;
  deposit_status?: string;
  deposit_held_at?: string | null;
}

export interface WalletLedgerTransaction {
  id: number;
  type: WalletLedgerType;
  type_label?: string;
  direction: "credit" | "debit" | string;
  amount: number;
  signed_amount: number;
  balance_after: number;
  profit_percent?: number | null;
  description?: string | null;
  description_short?: string | null;
  description_detailed?: string | null;
  created_at?: string | null;
}

export interface WalletCustodyInstructions {
  type?: string;
  account_holder_name?: string | null;
  account_number?: string | null;
  bank_name?: string | null;
  iban?: string | null;
  swift_bic?: string | null;
  cheque_payee?: string | null;
  collection_location?: string | null;
  collection_address?: string | null;
  note?: string | null;
}

export interface WalletDepositPayment {
  id: number;
  sequence: number;
  method: WalletDepositMethod | string;
  method_label?: string;
  amount: number;
  status: string;
  status_label?: string;
  submitted_at?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  has_evidence?: boolean;
  custody_instructions?: WalletCustodyInstructions | null;
  payment_reference?: string | null;
  sender_bank_name?: string | null;
  sender_account_last4?: string | null;
  check_number?: string | null;
  collection_slot_id?: number | string | null;
  collection_date?: string | null;
  collection_time?: string | null;
  collection_notes?: string | null;
  pickup_address?: string | null;
}

export interface WalletDeposit {
  id: number;
  total_amount: number;
  funded_amount: number;
  plan_type: "single" | "split" | string;
  status: string;
  status_label?: string;
  payments: WalletDepositPayment[];
  actions?: { can_cancel?: boolean };
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WalletCashOut {
  id: number;
  amount: number;
  status: string;
  status_label?: string;
  bank_name?: string | null;
  account_holder_name?: string | null;
  account_number?: string | null;
  iban?: string | null;
  rejection_reason?: string | null;
  processed_at?: string | null;
  actions?: { can_cancel?: boolean };
  created_at?: string | null;
}

export interface WalletSummary {
  wallet: WalletBalance;
  payment_methods: WalletPaymentMethodOption[];
  limits: WalletLimits;
  profit: WalletProfitSettings;
  benefits: WalletBenefits;
  holds?: WalletHold[];
}

export interface WalletPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function formatWalletError(payload: {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}) {
  if (payload.errors) {
    const first = Object.values(payload.errors).flat()[0];
    if (first) return first;
  }
  return payload.message || payload.error || "Request failed.";
}

async function walletRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: BodyInit | null;
    locale?: string;
    contentType?: string | null;
  } = {},
): Promise<WalletApiResponse<T>> {
  const token = getToken();
  if (!token) {
    throw new Error("Please login to continue.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  headers["Accept-Language"] = normalizeAcceptLanguage(options.locale);

  if (options.contentType && !(options.body instanceof FormData)) {
    headers["Content-Type"] = options.contentType;
  }

  const response = await fetch(`/api/wallet${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  const responseType = response.headers.get("content-type") || "";
  if (!responseType.includes("application/json")) {
    throw new Error("Unexpected response from server.");
  }

  const payload = await response.json();
  if (!response.ok || payload.status === false) {
    throw new Error(formatWalletError(payload));
  }

  return payload;
}

export function getWallet(locale: string) {
  return walletRequest<WalletSummary>("", { locale });
}

export function getWalletHolds(locale: string) {
  return walletRequest<{ holds: WalletHold[] }>("/holds", { locale });
}

export function getWalletBenefits(
  locale: string,
  period: string = "month",
) {
  return walletRequest<WalletBenefits>(
    `/benefits?period=${encodeURIComponent(period)}`,
    { locale },
  );
}

export function getWalletTransactions(
  locale: string,
  perPage = 20,
  page = 1,
) {
  return walletRequest<{
    transactions: WalletLedgerTransaction[];
    pagination: WalletPagination;
  }>(`/transactions?per_page=${perPage}&page=${page}`, { locale });
}

export function createWalletDeposit(
  locale: string,
  payload: {
    amount: number;
    payments: Array<{ method: WalletDepositMethod; amount: number }>;
  },
) {
  return walletRequest<{ deposit: WalletDeposit }>("/deposits", {
    method: "POST",
    locale,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

export function getWalletDeposits(locale: string) {
  return walletRequest<{ deposits: WalletDeposit[] }>("/deposits", { locale });
}

export function getWalletDeposit(id: string | number, locale: string) {
  return walletRequest<{ deposit: WalletDeposit }>(`/deposits/${id}`, {
    locale,
  });
}

export function cancelWalletDeposit(
  id: string | number,
  locale: string,
  reason?: string,
) {
  return walletRequest<{ deposit: WalletDeposit }>(`/deposits/${id}/cancel`, {
    method: "POST",
    locale,
    contentType: "application/json",
    body: JSON.stringify(reason ? { reason } : {}),
  });
}

export function submitWalletOfflinePayment(
  depositId: string | number,
  paymentId: string | number,
  locale: string,
  formData: FormData,
) {
  return walletRequest<{
    payment: WalletDepositPayment;
    deposit: WalletDeposit;
  }>(`/deposits/${depositId}/payments/${paymentId}/submission`, {
    method: "POST",
    locale,
    body: formData,
  });
}

export function createWalletPayTabsCheckout(
  depositId: string | number,
  paymentId: string | number,
  locale: string,
  options: { payment_token?: string } = {},
) {
  const body =
    options.payment_token != null
      ? { payment_token: options.payment_token }
      : {};

  return walletRequest<{
    redirect_url: string | null;
    transaction?: Record<string, unknown>;
    deposit?: WalletDeposit;
  }>(`/deposits/${depositId}/payments/${paymentId}/paytabs/checkout`, {
    method: "POST",
    locale,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export function createWalletCashOut(
  locale: string,
  payload: {
    amount: number;
    bank_name: string;
    account_holder_name: string;
    iban: string;
    account_number?: string;
  },
) {
  return walletRequest<{
    cash_out: WalletCashOut;
    wallet: WalletBalance;
  }>("/cash-outs", {
    method: "POST",
    locale,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

export function getWalletCashOuts(locale: string) {
  return walletRequest<{ cash_outs: WalletCashOut[] }>("/cash-outs", {
    locale,
  });
}

export function cancelWalletCashOut(
  id: string | number,
  locale: string,
  reason?: string,
) {
  return walletRequest<{
    cash_out: WalletCashOut;
    wallet: WalletBalance;
  }>(`/cash-outs/${id}/cancel`, {
    method: "POST",
    locale,
    contentType: "application/json",
    body: JSON.stringify(reason ? { reason } : {}),
  });
}

export function toWalletNumber(
  value: number | string | null | undefined,
): number {
  if (value == null || value === "") return 0;
  const parsed =
    typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}
