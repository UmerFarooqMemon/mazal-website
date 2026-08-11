export const PAYTABS_PAYLIB_URL =
  "https://secure.paytabs.com/payment/js/paylib.js";

export interface PayTabsSiteConfig {
  client_key: string;
  region?: string;
  currency?: string;
  base_url?: string;
  managed_form_enabled?: boolean;
}

export interface PayTabsInlineFormResponse {
  error?: unknown;
  token?: string;
}

export interface PayTabsCheckoutResult {
  redirect_url: string | null;
  transaction?: {
    status?: string;
    tran_ref?: string | null;
  };
}

let paylibScriptPromise: Promise<void> | null = null;

export function loadPayTabsScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PayTabs is only available in the browser."));
  }

  if (window.paylib) {
    return Promise.resolve();
  }

  if (paylibScriptPromise) {
    return paylibScriptPromise;
  }

  paylibScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PAYTABS_PAYLIB_URL}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load PayTabs script.")),
        { once: true },
      );
      if (window.paylib) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = PAYTABS_PAYLIB_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      paylibScriptPromise = null;
      reject(new Error("Failed to load PayTabs script."));
    };
    document.body.appendChild(script);
  });

  return paylibScriptPromise;
}

export function resolvePayTabsClientKey(
  config?: PayTabsSiteConfig | null,
): string | null {
  if (config?.client_key) return config.client_key;
  const envKey = process.env.NEXT_PUBLIC_PAYTABS_CLIENT_KEY;
  return envKey?.trim() || null;
}

export function isPayTabsManagedFormEnabled(
  config?: PayTabsSiteConfig | null,
): boolean {
  if (config?.managed_form_enabled === false) return false;
  return Boolean(resolvePayTabsClientKey(config));
}

/** Handle Mazal PayTabs checkout response per integration guide. */
export function handlePayTabsCheckoutResult(
  result: PayTabsCheckoutResult,
  options: {
    onImmediateSuccess?: () => void;
    onRedirect?: (url: string) => void;
  } = {},
): "success" | "redirect" | "pending" {
  const redirectUrl = result.redirect_url?.trim();
  if (redirectUrl) {
    options.onRedirect?.(redirectUrl);
    if (typeof window !== "undefined") {
      window.location.href = redirectUrl;
    }
    return "redirect";
  }

  const status = String(result.transaction?.status || "").toLowerCase();
  if (["funded", "confirmed", "paid", "completed", "success"].includes(status)) {
    options.onImmediateSuccess?.();
    return "success";
  }

  options.onImmediateSuccess?.();
  return "pending";
}

declare global {
  interface Window {
    paylib?: {
      inlineForm: (options: {
        key: string;
        form: HTMLFormElement;
        autoSubmit?: boolean;
        callback: (response: PayTabsInlineFormResponse) => void;
      }) => void;
      handleError: (element: HTMLElement, response: unknown) => void;
    };
  }
}
