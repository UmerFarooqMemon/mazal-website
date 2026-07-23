"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface ThemeColors {
  primary: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  secondary: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  primaryButton: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  secondaryButton: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  primaryText: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  secondaryText: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  accent: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  background: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  surface: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  border: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  mutedText: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  success: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  warning: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  error: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
  primaryLight: {
    start: string;
    end: string | null;
    angle: number;
    css: string | null;
  };
}

interface Branding {
  logoUrl: string | null;
  smallLogoUrl: string | null;
  faviconUrl: string | null;
}

export interface FooterColors {
  bg: string;
  text: string;
  heading: string;
  link: string;
  linkHover: string;
}

export interface SocialLinks {
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
  whatsapp: string | null;
}

export interface FooterContent {
  sentence: string | null;
  copyright: string | null;
}

interface ThemeContextType {
  colors: ThemeColors;
  branding: Branding;
  footerColors: FooterColors;
  social: SocialLinks;
  footerContent: FooterContent;
  loading: boolean;
  getColor: (key: keyof ThemeColors) => string;
  getGradient: (key: keyof ThemeColors) => string;
}

// Transparent defaults — nothing renders until the API provides real colors
const defaultColors: ThemeColors = {
  primary: { start: "transparent", end: null, angle: 180, css: null },
  secondary: { start: "transparent", end: null, angle: 180, css: null },
  primaryButton: { start: "transparent", end: null, angle: 180, css: null },
  secondaryButton: { start: "transparent", end: null, angle: 180, css: null },
  primaryText: { start: "transparent", end: null, angle: 180, css: null },
  secondaryText: { start: "transparent", end: null, angle: 180, css: null },
  accent: { start: "transparent", end: null, angle: 180, css: null },
  background: { start: "transparent", end: null, angle: 180, css: null },
  surface: { start: "transparent", end: null, angle: 180, css: null },
  border: { start: "transparent", end: null, angle: 180, css: null },
  mutedText: { start: "transparent", end: null, angle: 180, css: null },
  success: { start: "transparent", end: null, angle: 180, css: null },
  warning: { start: "transparent", end: null, angle: 180, css: null },
  error: { start: "transparent", end: null, angle: 180, css: null },
  primaryLight: { start: "transparent", end: null, angle: 180, css: null },
};

// Default branding - will be overridden by API
const defaultBranding: Branding = {
  logoUrl: null,
  smallLogoUrl: null,
  faviconUrl: null,
};

const defaultFooterColors: FooterColors = {
  bg: "#000000",
  text: "#a3a3a3",
  heading: "#ffffff",
  link: "#a3a3a3",
  linkHover: "#ffffff",
};

const defaultSocial: SocialLinks = {
  facebook: null,
  twitter: null,
  linkedin: null,
  instagram: null,
  youtube: null,
  whatsapp: null,
};

const defaultFooterContent: FooterContent = {
  sentence: null,
  copyright: null,
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  branding: defaultBranding,
  footerColors: defaultFooterColors,
  social: defaultSocial,
  footerContent: defaultFooterContent,
  loading: true,
  getColor: () => "transparent",
  getGradient: () => "transparent",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [branding, setBranding] = useState<Branding>(defaultBranding);
  const [footerColors, setFooterColors] =
    useState<FooterColors>(defaultFooterColors);
  const [social, setSocial] = useState<SocialLinks>(defaultSocial);
  const [footerContent, setFooterContent] =
    useState<FooterContent>(defaultFooterContent);
  const [loading, setLoading] = useState(true);

  // Get the primary (start) color from a gradient object
  const getColor = (key: keyof ThemeColors): string => {
    return colors[key]?.start || "transparent";
  };

  const getGradient = (key: keyof ThemeColors): string => {
    const gradient = colors[key];
    if (gradient?.css) return gradient.css;
    if (gradient?.start && gradient?.end) {
      return `linear-gradient(${gradient.angle}deg, ${gradient.start}, ${gradient.end})`;
    }
    return gradient?.start || "transparent";
  };

  // Fetch theme colors and branding from dashboard API on mount
  useEffect(() => {
    const fetchThemeSettings = async () => {
      try {
        const response = await fetch("/api/site-settings");
        const data = await response.json();

        // Set branding (logo, small logo, favicon)
        if (data?.data?.branding) {
          setBranding({
            logoUrl: data.data.branding.logo_url || null,
            smallLogoUrl: data.data.branding.small_logo_url || null,
            faviconUrl: data.data.branding.favicon_url || null,
          });

          // Update favicon dynamically
          if (data.data.branding.favicon_url) {
            const faviconLink = document.querySelector(
              "link[rel='icon']",
            ) as HTMLLinkElement;
            if (faviconLink) {
              faviconLink.href = data.data.branding.favicon_url;
            }
          }
        }

        // Social links from site-settings
        if (data?.data?.social) {
          setSocial({
            facebook: data.data.social.facebook || null,
            twitter: data.data.social.twitter || null,
            linkedin: data.data.social.linkedin || null,
            instagram: data.data.social.instagram || null,
            youtube: data.data.social.youtube || null,
            whatsapp: data.data.social.whatsapp || null,
          });
        }

        // Footer copy from site-settings (ignore empty / placeholder values)
        if (data?.data?.footer) {
          const clean = (value?: string | null) => {
            const trimmed = value?.trim() ?? "";
            if (!trimmed || trimmed === "-" || trimmed === "—") return null;
            return trimmed;
          };
          setFooterContent({
            sentence: clean(data.data.footer.sentence),
            copyright: clean(data.data.footer.copyright),
          });
        }

        // Merge colors (flat hex) with gradients (gradient objects)
        // Gradients take priority over flat colors
        const apiColors = data?.data?.colors || {};
        const apiGradients = data?.data?.gradients || {};

        const toGradient = (
          hex: string | undefined,
        ): { start: string; end: string | null; angle: number; css: string | null } => ({
          start: hex || "#0A3B9E",
          end: null,
          angle: 180,
          css: null,
        });

        const merge = (
          gradientKey: string,
          colorKey: string,
          fallback: typeof defaultColors.primary,
        ) => apiGradients[gradientKey] || (apiColors[colorKey] ? toGradient(apiColors[colorKey]) : fallback);

        const newColors = {
          primary: merge("primary", "primary", defaultColors.primary),
          secondary: merge("secondary", "secondary", defaultColors.secondary),
          primaryButton: merge("primary_button", "primary_button", defaultColors.primaryButton),
          secondaryButton: merge("secondary_button", "secondary_button", defaultColors.secondaryButton),
          primaryText: merge("primary_text", "primary_text", defaultColors.primaryText),
          secondaryText: merge("secondary_text", "secondary_text", defaultColors.secondaryText),
          accent: merge("accent", "accent", defaultColors.accent),
          background: merge("background", "background", defaultColors.background),
          surface: merge("surface", "surface", defaultColors.surface),
          border: merge("border", "border", defaultColors.border),
          mutedText: merge("muted_text", "muted_text", defaultColors.mutedText),
          success: merge("success", "success", defaultColors.success),
          warning: merge("warning", "warning", defaultColors.warning),
          error: merge("error", "error", defaultColors.error),
          primaryLight: merge("primary_light", "primary_light", defaultColors.primaryLight),
        };
        setColors(newColors);

        // Footer colors: prefer gradients.start, then flat colors (same merge order as theme)
        const resolveFooterColor = (key: string, fallback: string) =>
          apiGradients[key]?.start || apiColors[key] || fallback;

        const newFooterColors: FooterColors = {
          bg: resolveFooterColor("footer_bg", defaultFooterColors.bg),
          text: resolveFooterColor("footer_text", defaultFooterColors.text),
          heading: resolveFooterColor(
            "footer_heading",
            defaultFooterColors.heading,
          ),
          link: resolveFooterColor("footer_link", defaultFooterColors.link),
          linkHover: resolveFooterColor(
            "footer_link_hover",
            defaultFooterColors.linkHover,
          ),
        };
        setFooterColors(newFooterColors);

        // Apply colors to CSS custom properties using newColors directly
        // (getColor reads from stale state closure inside useEffect)
        const cssVar = (key: keyof typeof newColors) =>
          newColors[key]?.start || "transparent";

        const root = document.documentElement;
        root.style.setProperty("--color-primary", cssVar("primary"));
        root.style.setProperty("--color-primary-dark", cssVar("secondary"));
        root.style.setProperty("--color-primary-light", cssVar("primaryLight"));
        root.style.setProperty("--color-secondary", cssVar("accent"));
        root.style.setProperty("--color-accent", cssVar("accent"));
        root.style.setProperty("--color-text-dark", cssVar("primaryText"));
        root.style.setProperty("--color-text-light", "#FFFFFF");
        root.style.setProperty("--color-background", cssVar("background"));
        root.style.setProperty("--color-btn-primary", cssVar("primaryButton"));
        root.style.setProperty("--color-btn-primary-hover", cssVar("secondary"));
        root.style.setProperty("--color-btn-secondary", cssVar("secondaryButton"));
        root.style.setProperty("--color-secondary-text", cssVar("secondaryText"));
        root.style.setProperty("--color-success", cssVar("success"));
        root.style.setProperty("--color-warning", cssVar("warning"));
        root.style.setProperty("--color-error", cssVar("error"));
        root.style.setProperty("--color-surface", cssVar("surface"));
        root.style.setProperty("--color-border", cssVar("border"));
        root.style.setProperty("--color-muted-text", cssVar("mutedText"));
        root.style.setProperty("--color-footer-bg", newFooterColors.bg);
        root.style.setProperty("--color-footer-text", newFooterColors.text);
        root.style.setProperty("--color-footer-heading", newFooterColors.heading);
        root.style.setProperty("--color-footer-link", newFooterColors.link);
        root.style.setProperty(
          "--color-footer-link-hover",
          newFooterColors.linkHover,
        );
      } catch (error) {
        console.error("Failed to fetch theme settings:", error);
        // Keep using default colors and branding on error
      } finally {
        setLoading(false);
      }
    };
    fetchThemeSettings();
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        colors,
        branding,
        footerColors,
        social,
        footerContent,
        loading,
        getColor,
        getGradient,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
