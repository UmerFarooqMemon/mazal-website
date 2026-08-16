export const CARD_NUMBER_MAX_DIGITS = 16;
export const CARD_NUMBER_SEPARATOR = " ";

export function formatCardNumber(
  value: string,
  separator = CARD_NUMBER_SEPARATOR,
) {
  const digits = value.replace(/\D/g, "").slice(0, CARD_NUMBER_MAX_DIGITS);
  if (!digits) return "";

  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }

  return groups.join(separator);
}

export function cardNumberMaxLength(separator = CARD_NUMBER_SEPARATOR) {
  const separators = Math.ceil(CARD_NUMBER_MAX_DIGITS / 4) - 1;
  return CARD_NUMBER_MAX_DIGITS + separators * separator.length;
}

export function maskCardNumberInput(value: string) {
  return formatCardNumber(value);
}

export function formatCardExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function formatPriceInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}
