import { apiRequest } from "./api";

export interface SiteSettingsResponse {
  data: {
    site_title: string;
    contact_email: string;
    contact_phone: string;
    social_links: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
    branding: {
      logo_url?: string;
      small_logo_url?: string;
      favicon_url?: string;
    };
    colors: {
      primary?: string;
      primary_dark?: string;
      primary_light?: string;
      secondary?: string;
      accent?: string;
      text_dark?: string;
      text_light?: string;
      background?: string;
    };
    gradients: Record<
      string,
      {
        start: string;
        end: string;
        angle: number;
        css: string;
      } | null
    >;
    footer_text: string;
  };
}

// Fetch site settings (public)
export async function getSiteSettings(): Promise<SiteSettingsResponse> {
  return apiRequest<SiteSettingsResponse>("/v1/site-settings");
}
