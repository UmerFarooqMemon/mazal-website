const AUTH_ROUTE_SEGMENTS = [
  "login",
  "register",
  "forgot-password",
  "verify-code",
  "reset-password",
  "password-updated",
] as const;

/**
 * Build a login URL that returns the user to `returnPath` after success.
 * Falls back to bare login when the path is missing or unsafe.
 */
export function getLoginHref(
  locale: string,
  returnPath?: string | null,
): string {
  const base = `/${locale}/login`;
  const safe = sanitizeReturnPath(returnPath, locale);
  if (!safe) return base;
  return `${base}?redirect=${encodeURIComponent(safe)}`;
}

/**
 * Resolve where to send the user after login.
 * Uses a validated `redirect` query value, otherwise user dashboard.
 */
export function getPostLoginRedirect(
  locale: string,
  redirectParam?: string | null,
): string {
  return sanitizeReturnPath(redirectParam, locale) ?? `/${locale}/user-dashboard`;
}

/** Only allow same-origin relative paths; never auth pages or open redirects. */
export function sanitizeReturnPath(
  path: string | null | undefined,
  locale: string,
): string | null {
  if (!path) return null;

  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return null;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
  if (decoded.includes("://")) return null;

  const pathname = decoded.split("?")[0]?.split("#")[0] ?? "";
  const localePrefix = `/${locale}`;
  const withoutLocale = pathname.startsWith(`${localePrefix}/`)
    ? pathname.slice(localePrefix.length + 1)
    : pathname.startsWith("/")
      ? pathname.slice(1)
      : pathname;

  const firstSegment = withoutLocale.split("/")[0] ?? "";
  if (
    AUTH_ROUTE_SEGMENTS.includes(
      firstSegment as (typeof AUTH_ROUTE_SEGMENTS)[number],
    )
  ) {
    return null;
  }

  return decoded;
}
