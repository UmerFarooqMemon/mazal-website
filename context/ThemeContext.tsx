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

interface ThemeContextType {
  colors: ThemeColors;
  branding: Branding;
  loading: boolean;
  getColor: (key: keyof ThemeColors) => string;
  getGradient: (key: keyof ThemeColors) => string;
}

// Default colors matching the current website design
const defaultColors: ThemeColors = {
  primary: {
    start: "#0A3B9E",
    end: "#041443",
    angle: 180,
    css: "linear-gradient(180deg, #0A3B9E, #041443)",
  },
  secondary: { start: "#041443", end: null, angle: 180, css: null },
  primaryButton: {
    start: "#041443",
    end: "#0A3B9E",
    angle: 180,
    css: "linear-gradient(180deg, #041443, #0A3B9E)",
  },
  secondaryButton: { start: "#EEF2F8", end: null, angle: 180, css: null },
  primaryText: { start: "#041443", end: null, angle: 180, css: null },
  secondaryText: { start: "#6C757D", end: null, angle: 180, css: null },
  accent: { start: "#D4AF37", end: null, angle: 180, css: null },
  background: { start: "#FAFAF8", end: null, angle: 180, css: null },
  surface: { start: "#FFFFFF", end: null, angle: 180, css: null },
  border: { start: "#DEE2E6", end: null, angle: 180, css: null },
  mutedText: { start: "#ADB5BD", end: null, angle: 180, css: null },
  success: { start: "#28A745", end: null, angle: 180, css: null },
  warning: { start: "#FFC107", end: null, angle: 180, css: null },
  error: { start: "#DC3545", end: null, angle: 180, css: null },
  primaryLight: { start: "#EEF2F8", end: null, angle: 180, css: null },
};

// Default branding - will be overridden by API
const defaultBranding: Branding = {
  logoUrl: null,
  smallLogoUrl: null,
  faviconUrl: null,
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  branding: defaultBranding,
  loading: true,
  getColor: () => "#0A3B9E",
  getGradient: () => "",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [branding, setBranding] = useState<Branding>(defaultBranding);
  const [loading, setLoading] = useState(true);

  // Get the primary (start) color from a gradient object
  const getColor = (key: keyof ThemeColors): string => {
    return colors[key]?.start || defaultColors[key]?.start || "#0A3B9E";
  };

  // Get the CSS gradient string or fallback to solid color
  const getGradient = (key: keyof ThemeColors): string => {
    const gradient = colors[key];
    if (gradient?.css) return gradient.css;
    if (gradient?.start && gradient?.end) {
      return `linear-gradient(${gradient.angle}deg, ${gradient.start}, ${gradient.end})`;
    }
    return gradient?.start || "#0A3B9E";
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

        // Set theme colors from gradients
        if (data?.data?.gradients) {
          const gradients = data.data.gradients;
          const newColors = {
            primary: gradients.primary || defaultColors.primary,
            secondary: gradients.secondary || defaultColors.secondary,
            primaryButton:
              gradients.primary_button || defaultColors.primaryButton,
            secondaryButton:
              gradients.secondary_button || defaultColors.secondaryButton,
            primaryText: gradients.primary_text || defaultColors.primaryText,
            secondaryText:
              gradients.secondary_text || defaultColors.secondaryText,
            accent: gradients.accent || defaultColors.accent,
            background: gradients.background || defaultColors.background,
            surface: gradients.surface || defaultColors.surface,
            border: gradients.border || defaultColors.border,
            mutedText: gradients.muted_text || defaultColors.mutedText,
            success: gradients.success || defaultColors.success,
            warning: gradients.warning || defaultColors.warning,
            error: gradients.error || defaultColors.error,
            primaryLight: gradients.primary_light || defaultColors.primaryLight,
          };
          setColors(newColors);

          // Apply colors to CSS custom properties
          const root = document.documentElement;
          root.style.setProperty("--color-primary", getColor("primary"));
          root.style.setProperty("--color-primary-dark", getColor("secondary"));
          root.style.setProperty(
            "--color-primary-light",
            getColor("primaryLight"),
          );
          root.style.setProperty("--color-secondary", getColor("accent"));
          root.style.setProperty("--color-accent", getColor("accent"));
          root.style.setProperty("--color-text-dark", getColor("primaryText"));
          root.style.setProperty("--color-text-light", "#FFFFFF");
          root.style.setProperty("--color-background", getColor("background"));
          root.style.setProperty(
            "--color-btn-primary",
            getColor("primaryButton"),
          );
          root.style.setProperty(
            "--color-btn-primary-hover",
            getColor("secondary"),
          );
          root.style.setProperty("--color-success", getColor("success"));
          root.style.setProperty("--color-warning", getColor("warning"));
          root.style.setProperty("--color-error", getColor("error"));
          root.style.setProperty("--color-surface", getColor("surface"));
          root.style.setProperty("--color-border", getColor("border"));
          root.style.setProperty("--color-muted-text", getColor("mutedText"));
        }
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
      value={{ colors, branding, loading, getColor, getGradient }}
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
