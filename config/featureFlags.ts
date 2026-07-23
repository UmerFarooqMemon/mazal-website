/**
 * UI visibility flags from env (.env or .env.local).
 * Next.js merges both; .env.local overrides .env when both define the same key.
 * Defaults to true when unset. Set to "false" to hide.
 *
 * IMPORTANT: Next.js only inlines NEXT_PUBLIC_* when accessed as
 * process.env.NEXT_PUBLIC_FOO (static). Dynamic process.env[key] breaks on client.
 */
function envEnabled(value: string | undefined, defaultValue = true): boolean {
  if (value === undefined || value === "") return defaultValue;
  return value === "true" || value === "1";
}

export const featureFlags = {
  marketplace: envEnabled(process.env.NEXT_PUBLIC_SHOW_MARKETPLACE),
  privateDeal: envEnabled(process.env.NEXT_PUBLIC_SHOW_PRIVATE_DEAL),
  auctions: envEnabled(process.env.NEXT_PUBLIC_SHOW_AUCTIONS),
  valuationCertificate: envEnabled(
    process.env.NEXT_PUBLIC_SHOW_VALUATION_CERTIFICATE,
  ),
  kyc: envEnabled(process.env.NEXT_PUBLIC_SHOW_KYC),
  footer: envEnabled(process.env.NEXT_PUBLIC_SHOW_FOOTER),
} as const;
