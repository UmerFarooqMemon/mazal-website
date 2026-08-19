import { normalizeAcceptLanguage } from "@/lib/api-config";

export interface SupportApiResponse<T> {
  status?: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface SupportConversationUser {
  id: number;
  name: string;
}

export interface SupportConversation {
  id: number;
  subject: string;
  status: string;
  unread_count: number;
  last_message_at: string | null;
  user?: SupportConversationUser | null;
}

export interface SupportMessage {
  id: number;
  conversation_id: number;
  sender_type: "user" | "admin" | string;
  sender_name: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export class SupportRequestError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "SupportRequestError";
    this.status = status;
    this.errors = errors;
  }
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function supportRequest<T>(
  path: string,
  options: {
    method?: string;
    locale?: string;
    body?: BodyInit | null;
    contentType?: string | null;
  } = {},
): Promise<SupportApiResponse<T>> {
  const token = getToken();
  if (!token) {
    throw new Error("Please login to continue.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Accept-Language": normalizeAcceptLanguage(options.locale),
  };

  if (options.contentType && !(options.body instanceof FormData)) {
    headers["Content-Type"] = options.contentType;
  }

  const response = await fetch(`/api/support${path}`, {
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
    const errors = payload.errors as Record<string, string[]> | undefined;
    const firstError = errors ? Object.values(errors).flat()[0] : undefined;
    throw new SupportRequestError(
      firstError || payload.message || payload.error || "Request failed.",
      response.status,
      errors,
    );
  }

  return payload;
}

export function listSupportConversations(
  locale: string,
  perPage = 20,
  page = 1,
) {
  const query = buildQuery({ per_page: perPage, page });
  return supportRequest<{ conversations: SupportConversation[] }>(
    `/conversations${query}`,
    { locale },
  );
}

export function createSupportConversation(
  locale: string,
  payload: {
    subject: string;
    body: string;
    context_type?: string;
    context_id?: number | string;
  },
) {
  return supportRequest<{ conversation: SupportConversation }>(
    "/conversations",
    {
      method: "POST",
      locale,
      contentType: "application/json",
      body: JSON.stringify(payload),
    },
  );
}

export function getSupportConversation(
  locale: string,
  conversationId: number | string,
  afterId?: number | null,
) {
  const query = buildQuery({
    after_id: afterId != null && afterId > 0 ? afterId : undefined,
  });
  return supportRequest<{
    conversation: SupportConversation;
    messages: SupportMessage[];
  }>(`/conversations/${conversationId}${query}`, { locale });
}

export function sendSupportMessage(
  locale: string,
  conversationId: number | string,
  body: string,
) {
  return supportRequest<{ message: SupportMessage }>(
    `/conversations/${conversationId}/messages`,
    {
      method: "POST",
      locale,
      contentType: "application/json",
      body: JSON.stringify({ body }),
    },
  );
}
