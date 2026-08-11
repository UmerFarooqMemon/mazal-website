export interface PrivateDealApiResponse<T> {
  status?: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PrivateDealOptions {
  payment_plans: Record<string, string>;
  payment_methods: Record<string, string>;
  party_types: Record<string, string>;
  license_sources: Record<string, string>;
  terms_version: string;
}

export interface PrivateDealInvitation {
  id: number;
  expires_at: string;
  max_attempts: number;
  delivery: string;
  share_url: string;
}

export interface PrivateDealPayment {
  id: number;
  sequence: number;
  amount: string;
  method: string;
  status: string;
  payment_reference?: string | null;
  details?: Record<string, unknown> | null;
  custody_instructions?: Record<string, unknown>;
  has_evidence?: boolean;
  evidence_url?: string | null;
  submitted_at?: string | null;
  funded_at?: string | null;
  provider_transaction?: Record<string, unknown> | null;
}

export interface PrivateDeal {
  id: number;
  status: string;
  agreed_price: string;
  fee_breakdown?: Array<{
    slug: string;
    label: string;
    amount: string;
  }>;
  total_fees?: string;
  total_due?: string;
  seller_net?: string;
  seller_id?: number;
  buyer_id?: number | null;
  is_gift?: boolean;
  buyer_payment_required?: boolean;
  recipient_email?: string | null;
  gift_message?: string | null;
  gift_funded_at?: string | null;
  payment_plan?: string | null;
  remaining_amount?: string;
  parties?: Array<Record<string, unknown>>;
  payments?: PrivateDealPayment[];
  workflow_logs?: Array<Record<string, unknown>> | null;
  plate?: {
    emirate?: string;
    variant?: string;
    type?: string;
    code?: string | null;
    digits?: string;
    design?: string | null;
  };
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function formatPrivateDealError(payload: {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}) {
  if (payload.errors) {
    const details = Object.entries(payload.errors)
      .flatMap(([field, messages]) =>
        messages.map((message) => `${field}: ${message}`),
      )
      .join("; ");
    if (details) {
      return `${payload.message || "Validation failed."} (${details})`;
    }
  }

  return payload.message || payload.error || "Request failed.";
}

export function extractPrivateDeal(
  payload: PrivateDealApiResponse<{ deal?: PrivateDeal } & Partial<PrivateDeal>>,
): PrivateDeal {
  const data = payload.data;

  if (data?.deal?.id != null) {
    return data.deal;
  }

  if (data?.id != null) {
    return data as PrivateDeal;
  }

  throw new Error("Deal response is missing an id.");
}

async function privateDealsRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: BodyInit | null;
    locale?: string;
    contentType?: string | null;
  } = {},
): Promise<PrivateDealApiResponse<T>> {
  const token = getToken();
  if (!token) {
    throw new Error("Please login to continue.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  headers["Accept-Language"] = options.locale === "ar" ? "ar" : "en";

  if (options.contentType) {
    headers["Content-Type"] = options.contentType;
  }

  const response = await fetch(`/api/private-deals${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  const responseType = response.headers.get("content-type") || "";
  if (!responseType.includes("application/json")) {
    throw new Error("Unexpected response from server.");
  }

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(formatPrivateDealError(payload));
  }

  return payload;
}

export function getPrivateDealOptions(locale: string) {
  return privateDealsRequest<PrivateDealOptions>("/options", { locale });
}

export function createPrivateDeal(
  payload: Record<string, unknown>,
  locale: string,
) {
  return privateDealsRequest<{ deal: PrivateDeal }>("", {
    method: "POST",
    locale,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

export function getPrivateDeal(id: string | number, locale: string) {
  return privateDealsRequest<{ deal: PrivateDeal }>(`/${id}`, { locale });
}

export function savePrivateDealParty(
  id: string | number,
  payload: Record<string, unknown>,
  locale: string,
) {
  return privateDealsRequest<{ deal: PrivateDeal }>(`/${id}/party`, {
    method: "PUT",
    locale,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

export function updatePrivateDealTerms(
  id: string | number,
  payload: Record<string, unknown>,
  locale: string,
) {
  return privateDealsRequest<{ deal: PrivateDeal }>(`/${id}/terms`, {
    method: "PATCH",
    locale,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

export function issuePrivateDealInvitation(id: string | number, locale: string) {
  return privateDealsRequest<{
    invitation: PrivateDealInvitation;
    verification_code: string;
    invitation_email_sent?: boolean;
    deal: PrivateDeal;
  }>(`/${id}/invitations`, {
    method: "POST",
    locale,
  });
}

export function joinPrivateDeal(verificationCode: string, locale: string) {
  return privateDealsRequest<{ deal: PrivateDeal }>("/join", {
    method: "POST",
    locale,
    contentType: "application/json",
    body: JSON.stringify({ verification_code: verificationCode }),
  });
}

export function savePrivateDealPaymentPlan(
  id: string | number,
  payload: Record<string, unknown>,
  locale: string,
) {
  return privateDealsRequest<{ deal: PrivateDeal }>(`/${id}/payment-plan`, {
    method: "PUT",
    locale,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

export function submitPrivateDealPayment(
  id: string | number,
  paymentId: string | number,
  formData: FormData,
  locale: string,
) {
  return privateDealsRequest<{ deal: PrivateDeal }>(
    `/${id}/payments/${paymentId}/submission`,
    {
      method: "POST",
      locale,
      body: formData,
    },
  );
}

export function createPrivateDealCheckout(
  id: string | number,
  paymentId: string | number,
  locale: string,
  options: { payment_token?: string } = {},
) {
  const body =
    options.payment_token != null
      ? { payment_token: options.payment_token }
      : {};

  return privateDealsRequest<{
    redirect_url: string | null;
    transaction: Record<string, unknown>;
  }>(`/${id}/payments/${paymentId}/paytabs/checkout`, {
    method: "POST",
    locale,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export function payPrivateDealWithWallet(
  id: string | number,
  paymentId: string | number,
  locale: string,
) {
  return privateDealsRequest<{
    deal: PrivateDeal;
    wallet?: Record<string, unknown>;
    wallet_transaction?: Record<string, unknown>;
  }>(`/${id}/payments/${paymentId}/wallet`, {
    method: "POST",
    locale,
  });
}
