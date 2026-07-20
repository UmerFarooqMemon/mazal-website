import { apiRequest } from "./api";

export interface GradientValue {
  start: string;
  end: string | null;
  angle: number;
  css: string;
}

export interface SiteSettingsResponse {
  data: {
    site_title: string;
    contact: {
      email?: string | null;
      phone?: string | null;
      address?: string;
    };
    social: {
      facebook?: string | null;
      twitter?: string | null;
      pinterest?: string | null;
      youtube?: string | null;
      linkedin?: string | null;
      instagram?: string | null;
      whatsapp?: string | null;
    };
    branding: {
      logo_url?: string;
      small_logo_url?: string;
      favicon_url?: string;
    };
    colors: {
      primary?: string;
      secondary?: string;
      primary_button?: string;
      secondary_button?: string;
      primary_text?: string;
      secondary_text?: string;
      accent?: string;
      background?: string;
      surface?: string;
      border?: string;
      muted_text?: string;
      success?: string;
      warning?: string;
      error?: string;
      footer_bg?: string;
      footer_text?: string;
      footer_heading?: string;
      footer_link?: string;
      footer_link_hover?: string;
    };
    gradients: Record<string, GradientValue | null>;
    fees?: {
      escrow_custody_percentage?: string;
      platform_fee_percentage?: string;
      service_transfer_percentage?: string;
    };
    platform_settings?: Array<{
      slug: string;
      label: string;
      value: string;
      unit_type: string;
    }>;
    reveal_fee_amount?: string;
    enabled_emirates?: Array<{ key: string; label: string }>;
    emirates?: Array<{
      key: string;
      label: string;
      emirate_code: string;
      name: string;
      is_enabled: boolean;
    }>;
    footer: {
      sentence?: string;
      copyright?: string;
    };
  };
}

// Fetch site settings (public)
export async function getSiteSettings(): Promise<SiteSettingsResponse> {
  return apiRequest<SiteSettingsResponse>("/v1/site-settings");
}
