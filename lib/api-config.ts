/**
 * Resolves the backend API base URL from env (no hardcoded fallback).
 * Prefer NEXT_PUBLIC_API_BASE_URL (client + server). API_BASE_URL works on server only.
 */
export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.API_BASE_URL?.trim();

  if (!raw) {
    throw new Error(
      "Missing API base URL. Set NEXT_PUBLIC_API_BASE_URL=https://your-api-host/api (required for client). API_BASE_URL alone is not visible in the browser.",
    );
  }

  // Normalize accidental double slashes in the path (e.g. host//api)
  return raw.replace(/([^:]\/)\/+/g, "$1").replace(/\/+$/, "");
}

export function getApiAllowedHosts(): string[] {
  return [new URL(getApiBaseUrl()).hostname];
}
