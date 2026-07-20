"use client";

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type CredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: CredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
              ux_mode?: "popup" | "redirect";
            },
          ) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              getNotDisplayedReason: () => string;
              getSkippedReason: () => string;
            }) => void,
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google sign-in is only available in the browser."),
    );
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_SRC}"]`,
    );

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services.")),
      );
      if (window.google?.accounts?.id) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error("Failed to load Google Identity Services."));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

function getClientId(): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error(
      "Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID (same as backend GOOGLE_CLIENT_ID).",
    );
  }
  return clientId;
}

/**
 * Step 1 (client-only): get Google ID token via Google Identity Services.
 * Then call POST /api/v1/auth/google with { id_token }.
 */
export async function requestGoogleIdToken(): Promise<string> {
  const clientId = getClientId();
  await loadGoogleScript();

  if (!window.google?.accounts?.id) {
    throw new Error("Google Identity Services failed to initialize.");
  }

  return new Promise<string>((resolve, reject) => {
    let settled = false;

    const finish = (credential: string) => {
      if (settled) return;
      settled = true;
      host.remove();
      resolve(credential);
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      host.remove();
      reject(new Error(message));
    };

    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText =
      "position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0.01;z-index:2147483647;";
    document.body.appendChild(host);

    window.google!.accounts.id.initialize({
      client_id: clientId,
      ux_mode: "popup",
      callback: (response) => {
        if (response?.credential) {
          finish(response.credential);
        } else {
          fail("Google did not return an ID token.");
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google!.accounts.id.renderButton(host, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      ux_mode: "popup",
      width: 320,
    });

    window.setTimeout(() => {
      const googleBtn = host.querySelector<HTMLElement>("div[role='button']");

      if (googleBtn) {
        googleBtn.click();
        return;
      }

      // Fallback: One Tap / FedCM prompt
      window.google!.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          fail(
            notification.isNotDisplayed()
              ? `Google sign-in unavailable (${notification.getNotDisplayedReason() || "blocked"}).`
              : `Google sign-in skipped (${notification.getSkippedReason() || "dismissed"}).`,
          );
        }
      });
    }, 100);
  });
}
