/** Fallback License Source options for private-deal Confirm Details. */
export const PRIVATE_DEAL_LICENSE_SOURCES: { key: string; label: string }[] = [
  { key: "qatar_company", label: "QATAR COMPANY" },
  {
    key: "ded_ras_al_khaimah",
    label: "Department of Economic Development-RAS-AL KHAIMAH",
  },
  {
    key: "ded_ajman",
    label: "Department of Economic Development-AJMAN",
  },
  {
    key: "ded_fujairah",
    label: "Department of Economic Development-FUJAIRAH",
  },
  {
    key: "ded_um_quwain",
    label: "Department of Economic Development-UM-QUWAIN",
  },
  {
    key: "ded_sharjah",
    label: "Department of Economic Development-SHARJAH",
  },
  { key: "al_meydan_free_zone", label: "Al Meydan Free Zone" },
  {
    key: "dubai_maritime_city_authority",
    label:
      "Director of Commercial Registration Department \\ Dubai Maritime City Authority",
  },
  {
    key: "department_of_economy_and_tourism",
    label: "Department of Economy and Tourism",
  },
  { key: "jebel_ali_free_zone", label: "Jebel Ali Free Zone" },
  { key: "bahrain_company", label: "Bahrain company" },
  { key: "poland_licensing_authority", label: "Poland Licensing Authority" },
  { key: "technology_and_media", label: "Technology and media" },
  { key: "technical_area", label: "Technical area" },
  { key: "dubai_medical_district", label: "Dubai Medical District" },
  {
    key: "dubai_airport_free_zone",
    label: "Dubai Airport Free Zone (DAFZA)",
  },
  { key: "kuwait_company", label: "KUWAIT COMPANY" },
  {
    key: "dubai_multi_commodities_centre",
    label: "Dubai Multi Commodities Centre Authority",
  },
  {
    key: "ras_al_khaimah_free_zone",
    label: "RAS AL KHAIMAH FREE ZONE AUTHORITY",
  },
  {
    key: "ded_abu_dhabi",
    label: "Department of Economic Development-Abu-Dhabi",
  },
  { key: "tourism_trakhees_local", label: "Tourism Trakhees Local" },
  {
    key: "dubai_maritime_city",
    label: "Dubai Maritime City - Located Maritime City",
  },
  {
    key: "mbr",
    label: "Mohammed Bin Rashid Establishment for SME Development",
  },
  { key: "tourism_tecom", label: "Tourism - TECOM" },
  { key: "tourism_trakhees_free_zone", label: "Tourism Trakhees Free Zone" },
  { key: "intlaq", label: "Intlaq" },
  { key: "tomouh", label: "Tomouh" },
  { key: "electronic_trader", label: "Electronic Trader" },
  { key: "trakhees_dragon_mart", label: "Trakhees - Dragon Mart" },
  {
    key: "dubai_creative_clusters",
    label: "Dubai Creative Clusters Authority",
  },
  { key: "national_media_council", label: "National Media Council" },
  {
    key: "dubai_chamber_of_commerce",
    label: "Dubai Chamber of Commerce & Industry",
  },
  { key: "saudia_company", label: "SAUDIA COMPANY" },
  { key: "oman_company", label: "OMAN COMPANY" },
  { key: "ministry_of_foreign_affairs", label: "Ministry of Foreign Affairs" },
  {
    key: "difc",
    label: "Dubai International Financial Centre (DIFC)",
  },
  {
    key: "ducamz",
    label: "Dubai Car and Automotive City (DUCAMZ)",
  },
  { key: "government_authorities", label: "Government authorities" },
  { key: "dubai_world_central", label: "Dubai World Central" },
  { key: "personal_purpose", label: "Personal Purpose" },
  {
    key: "department_of_tourism_and_commerce_marketing",
    label: "Department of Tourism and Commerce Marketing",
  },
  {
    key: "dubai_silicon_oasis",
    label: "Dubai Silicon Oasis Authority",
  },
  {
    key: "trakhees_pcfc",
    label:
      '"Trakhees"-Ports, Customs & Free Zone Corporation-Dubai',
  },
];

export function resolveLicenseSourceOptions(
  fromApi?: Record<string, string> | null,
): { key: string; label: string }[] {
  if (fromApi && Object.keys(fromApi).length > 0) {
    return Object.entries(fromApi).map(([key, label]) => ({
      key,
      label: String(label),
    }));
  }
  return PRIVATE_DEAL_LICENSE_SOURCES;
}
