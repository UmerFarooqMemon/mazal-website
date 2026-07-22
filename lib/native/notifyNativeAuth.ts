export type NativeAuthPayload = {
  action: "login" | "session";
  customerId: string;
  /** Optional JWT / access token if the API expects Bearer auth */
  authToken?: string;
};

type FlutterInAppWebViewBridge = {
  callHandler: (handlerName: string, ...args: unknown[]) => Promise<unknown>;
};

declare global {
  interface Window {
    flutter_inappwebview?: FlutterInAppWebViewBridge;
  }
}

/** Dedupes login+session for the same customer within one JS context (e.g. login then redirect). */
let lastNotifiedKey: string | null = null;

function getBridge(): FlutterInAppWebViewBridge | null {
  if (typeof window === "undefined") return null;
  return window.flutter_inappwebview ?? null;
}

/**
 * Notifies the Flutter WebView that the user is authenticated.
 * No-ops in a normal browser (no bridge present).
 */
export async function notifyNativeAuth(
  payload: NativeAuthPayload,
): Promise<void> {
  const bridge = getBridge();
  if (!bridge?.callHandler) return;

  const key = `${payload.action}:${payload.customerId}`;

  // Skip duplicate of the exact same notify
  if (lastNotifiedKey === key) return;

  // After a fresh login, skip a follow-up session restore for the same customer
  if (
    payload.action === "session" &&
    lastNotifiedKey === `login:${payload.customerId}`
  ) {
    return;
  }

  lastNotifiedKey = key;

  try {
    await bridge.callHandler("onAuth", {
      action: payload.action,
      customerId: payload.customerId,
      authToken: payload.authToken,
    });
  } catch (err) {
    // Never break the web app if the native bridge fails
    console.warn("[native] onAuth failed:", err);
  }
}

/** Clears dedupe state so the next login/session can notify again (e.g. after logout). */
export function resetNativeAuthNotifyState(): void {
  lastNotifiedKey = null;
}

/**
 * Optional debug helper — Flutter exposes the current FCM token.
 * Returns null in a normal browser or if the handler fails.
 */
export async function getFcmToken(): Promise<string | null> {
  const bridge = getBridge();
  if (!bridge?.callHandler) return null;

  try {
    const result = (await bridge.callHandler("getFcmToken")) as {
      token?: string;
    } | null;
    return result?.token ?? null;
  } catch (err) {
    console.warn("[native] getFcmToken failed:", err);
    return null;
  }
}
