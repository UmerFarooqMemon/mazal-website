import { formatDirham } from "dirham";

export function formatPrice(amount: number, locale: string = "en-AE") {
  return formatDirham(amount, {
    locale,
    decimals: 0,
  });
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}
