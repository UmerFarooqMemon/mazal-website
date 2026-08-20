/** Normalize API enum-like keys for translation lookup. */
export function normalizeWalletKey(value: string | null | undefined): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/** Prefer API label; otherwise translate known status keys; else humanize raw status. */
export function formatWalletStatusLabel(
  status: string | null | undefined,
  statusLabel: string | null | undefined,
  translate: (key: string) => string,
  namespace: "cash_out_status" | "release_status" | "status" = "status",
): string {
  const raw = String(status || "").trim();
  const apiLabel = String(statusLabel || "").trim();
  if (apiLabel && normalizeWalletKey(apiLabel) !== normalizeWalletKey(raw)) {
    return apiLabel;
  }

  const key = normalizeWalletKey(raw);
  if (key) {
    const namespaced = `wallet.${namespace}_${key}`;
    const namespacedLabel = translate(namespaced);
    if (namespacedLabel && namespacedLabel !== namespaced) return namespacedLabel;

    const shared = `wallet.status_${key}`;
    const sharedLabel = translate(shared);
    if (sharedLabel && sharedLabel !== shared) return sharedLabel;
  }

  if (apiLabel) return apiLabel;
  if (!raw) return "—";
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatWalletMethodLabel(
  method: string | null | undefined,
  methodLabel: string | null | undefined,
  translate: (key: string) => string,
): string {
  const apiLabel = String(methodLabel || "").trim();
  if (apiLabel) return apiLabel;

  const key = normalizeWalletKey(method);
  if (!key) return "";

  const methodKey = `wallet.method_${key === "managers_check" ? "cheque" : key === "bank_transfer" ? "bank" : key === "cash_collection" ? "cash" : key}`;
  const translated = translate(methodKey);
  if (translated && translated !== methodKey) return translated;

  return method!
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
