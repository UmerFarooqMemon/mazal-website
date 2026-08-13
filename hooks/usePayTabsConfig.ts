"use client";

import { useEffect, useState } from "react";
import {
  isPayTabsManagedFormEnabled,
  resolvePayTabsClientKey,
  type PayTabsSiteConfig,
} from "@/lib/paytabs";
import { normalizeAcceptLanguage } from "@/lib/api-config";

interface PayTabsConfigState {
  config: PayTabsSiteConfig | null;
  clientKey: string | null;
  managedFormEnabled: boolean;
  loading: boolean;
  error: string | null;
}

export function usePayTabsConfig(locale?: string): PayTabsConfigState {
  const [state, setState] = useState<PayTabsConfigState>({
    config: null,
    clientKey: resolvePayTabsClientKey(null),
    managedFormEnabled: isPayTabsManagedFormEnabled(null),
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/site-settings", {
          headers: {
            Accept: "application/json",
            "Accept-Language": normalizeAcceptLanguage(locale),
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load payment settings.");
        }

        const payload = await response.json();
        const paytabs = payload?.data?.payments?.paytabs as
          | PayTabsSiteConfig
          | undefined;

        if (cancelled) return;

        const config = paytabs || null;
        setState({
          config,
          clientKey: resolvePayTabsClientKey(config),
          managedFormEnabled: isPayTabsManagedFormEnabled(config),
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load payment settings.",
        }));
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return state;
}
