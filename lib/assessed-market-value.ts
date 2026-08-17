import type { NumberPlate } from "@/services/api";

export type AssessedMarketValueView = {
  formatted: string | null;
  min: number | null;
  max: number | null;
  valuedAmount: number | null;
  valuatedAt: string | null;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toAmount(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatRange(min: number, max: number): string {
  return `${min.toLocaleString("en-AE")} - ${max.toLocaleString("en-AE")}`;
}

export function extractNumberPlatesList(payload: unknown): NumberPlate[] {
  if (!payload || typeof payload !== "object") return [];
  const data = (payload as { data?: unknown }).data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const plates = (data as { number_plates?: unknown }).number_plates;
    if (Array.isArray(plates)) return plates as NumberPlate[];
  }
  if (Array.isArray(data)) return data as NumberPlate[];
  if (Array.isArray(payload)) return payload as NumberPlate[];
  return [];
}

export function parseAssessedMarketValue(
  plate: NumberPlate | Record<string, unknown> | null | undefined,
): AssessedMarketValueView {
  const empty: AssessedMarketValueView = {
    formatted: null,
    min: null,
    max: null,
    valuedAmount: null,
    valuatedAt: null,
  };
  if (!plate || typeof plate !== "object") return empty;

  const record = plate as Record<string, unknown>;
  const nested = record.assessed_market_value as
    | {
        min?: string | number | null;
        max?: string | number | null;
        formatted?: string | null;
      }
    | null
    | undefined;

  const min = toAmount(nested?.min) ?? toAmount(record.fair_market_low);
  const max = toAmount(nested?.max) ?? toAmount(record.fair_market_high);
  const nestedFormatted = isNonEmptyString(nested?.formatted)
    ? nested.formatted.trim()
    : null;

  return {
    formatted:
      nestedFormatted ?? (min != null && max != null ? formatRange(min, max) : null),
    min,
    max,
    valuedAmount: toAmount(record.valued_amount),
    valuatedAt: isNonEmptyString(record.valuated_at) ? record.valuated_at : null,
  };
}
