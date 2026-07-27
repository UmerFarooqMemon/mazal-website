export const OTHER_BANK_KEY = "other";

export const UAE_BANKS = [
  { key: "fab", label: "First Abu Dhabi Bank (FAB)" },
  { key: "emirates_nbd", label: "Emirates NBD" },
  { key: "adcb", label: "Abu Dhabi Commercial Bank (ADCB)" },
  { key: "dib", label: "Dubai Islamic Bank (DIB)" },
  { key: "mashreq", label: "Mashreq Bank" },
  { key: "adib", label: "Abu Dhabi Islamic Bank (ADIB)" },
  { key: "emirates_islamic", label: "Emirates Islamic" },
  { key: "cbd", label: "Commercial Bank of Dubai (CBD)" },
  { key: "rakbank", label: "RAKBANK (National Bank of Ras Al Khaimah)" },
  { key: "sharjah_islamic", label: "Sharjah Islamic Bank" },
  { key: "nbf", label: "National Bank of Fujairah (NBF)" },
  { key: "nbq", label: "National Bank of Umm Al-Qaiwain (NBQ)" },
  { key: "ajman", label: "Ajman Bank" },
  { key: "bank_of_sharjah", label: "Bank of Sharjah" },
  { key: "cbi", label: "Commercial Bank International (CBI)" },
  { key: "uab", label: "United Arab Bank (UAB)" },
  { key: "invest_bank", label: "Invest Bank" },
  { key: "eib", label: "Emirates Investment Bank" },
  { key: "mbank", label: "Al Maryah Community Bank (Mbank)" },
  { key: "ruya", label: "Ruya Community Islamic Bank" },
  { key: "wio", label: "Wio Bank" },
  { key: "zand", label: "Zand Bank" },
  { key: "hsbc", label: "HSBC Bank Middle East" },
  { key: "standard_chartered", label: "Standard Chartered" },
  { key: "citibank", label: "Citibank" },
  { key: "bank_of_baroda", label: "Bank of Baroda" },
  { key: "habib_bank", label: "Habib Bank Limited" },
  { key: OTHER_BANK_KEY, label: "Other" },
] as const;

export function resolveBankLabel(bankKey: string, otherName?: string) {
  if (bankKey === OTHER_BANK_KEY) {
    return otherName?.trim() || "Other";
  }

  return UAE_BANKS.find((bank) => bank.key === bankKey)?.label || bankKey;
}
