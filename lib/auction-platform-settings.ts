export interface AuctionPlatformSettings {
  minDeposit: number;
  multiplier: number;
  defaultMaxBiddingLimit: number;
  exampleHoldAmount: number;
  exampleMaxBiddingLimit: number;
}

export const DEFAULT_AUCTION_PLATFORM_SETTINGS: AuctionPlatformSettings = {
  minDeposit: 5000,
  multiplier: 5,
  defaultMaxBiddingLimit: 25000,
  exampleHoldAmount: 10000,
  exampleMaxBiddingLimit: 50000,
};

function readPlatformSetting(
  data: Record<string, unknown> | undefined,
  key: string,
): string | number | boolean | undefined {
  if (!data) return undefined;
  const direct = data[key];
  if (direct != null && direct !== "") return direct as string | number | boolean;

  const settings = data.platform_settings;
  if (!Array.isArray(settings)) return undefined;

  const match = settings.find(
    (item) =>
      item &&
      typeof item === "object" &&
      (item as { slug?: string }).slug === key,
  ) as { value?: string | number | boolean } | undefined;

  return match?.value;
}

function toPositiveNumber(
  value: string | number | boolean | undefined,
  fallback: number,
): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return fallback;
}

export function resolveAuctionPlatformSettings(
  data: Record<string, unknown> | undefined,
): AuctionPlatformSettings {
  const minDeposit = toPositiveNumber(
    readPlatformSetting(data, "auction_min_deposit") ??
      readPlatformSetting(data, "auction_registration_deposit"),
    DEFAULT_AUCTION_PLATFORM_SETTINGS.minDeposit,
  );
  const multiplier = toPositiveNumber(
    readPlatformSetting(data, "auction_bidding_capacity_multiplier"),
    DEFAULT_AUCTION_PLATFORM_SETTINGS.multiplier,
  );
  const defaultMaxBiddingLimit = toPositiveNumber(
    readPlatformSetting(data, "auction_default_max_bidding_limit"),
    minDeposit * multiplier,
  );
  const exampleHoldAmount = toPositiveNumber(
    readPlatformSetting(data, "auction_example_hold_amount"),
    DEFAULT_AUCTION_PLATFORM_SETTINGS.exampleHoldAmount,
  );
  const exampleMaxBiddingLimit = toPositiveNumber(
    readPlatformSetting(data, "auction_example_max_bidding_limit"),
    exampleHoldAmount * multiplier,
  );

  return {
    minDeposit,
    multiplier,
    defaultMaxBiddingLimit,
    exampleHoldAmount,
    exampleMaxBiddingLimit,
  };
}

export function formatAuctionPlatformExample(
  settings: AuctionPlatformSettings,
): {
  holdAmount: number;
  maxLimit: number;
  multiplier: number;
  minDeposit: number;
} {
  return {
    holdAmount: settings.exampleHoldAmount,
    maxLimit: settings.exampleMaxBiddingLimit,
    multiplier: settings.multiplier,
    minDeposit: settings.minDeposit,
  };
}
