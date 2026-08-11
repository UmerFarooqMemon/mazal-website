"use client";

import { useEffect, useId, useRef, useState } from "react";
import Script from "next/script";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui";
import {
  PAYTABS_PAYLIB_URL,
  loadPayTabsScript,
  type PayTabsInlineFormResponse,
} from "@/lib/paytabs";

interface PayTabsManagedFormProps {
  clientKey: string;
  submitLabel: string;
  loading?: boolean;
  disabled?: boolean;
  onToken: (token: string) => void | Promise<void>;
  onError?: (message: string) => void;
}

function paylibErrorMessage(response: unknown): string {
  if (!response || typeof response !== "object") {
    return "Card payment failed. Please check your details and try again.";
  }

  const record = response as Record<string, unknown>;
  const message =
    (typeof record.message === "string" && record.message) ||
    (typeof record.error === "string" && record.error) ||
    (Array.isArray(record.errors) &&
      record.errors.filter((item) => typeof item === "string").join(" "));

  return (
    message ||
    "Card payment failed. Please check your details and try again."
  );
}

export default function PayTabsManagedForm({
  clientKey,
  submitLabel,
  loading = false,
  disabled = false,
  onToken,
  onError,
}: PayTabsManagedFormProps) {
  const formId = useId().replace(/:/g, "");
  const errorsId = `paytabs-errors-${formId}`;
  const { t } = useLocale();
  const { getColor } = useTheme();
  const formRef = useRef<HTMLFormElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [tokenizing, setTokenizing] = useState(false);
  const [formError, setFormError] = useState("");
  const initRef = useRef(false);

  useEffect(() => {
    if (!scriptReady || !clientKey || !formRef.current || initRef.current) {
      return;
    }

    let cancelled = false;

    const init = async () => {
      try {
        await loadPayTabsScript();
        if (cancelled || !formRef.current || !window.paylib) return;

        initRef.current = true;
        window.paylib.inlineForm({
          key: clientKey,
          form: formRef.current,
          autoSubmit: false,
          callback: (response: PayTabsInlineFormResponse) => {
            if (response.error) {
              const message = paylibErrorMessage(response.error);
              setFormError(message);
              onError?.(message);
              if (window.paylib && formRef.current) {
                const errorsEl = document.getElementById(errorsId);
                if (errorsEl) {
                  window.paylib.handleError(errorsEl, response);
                }
              }
              setTokenizing(false);
              return;
            }

            const token =
              response.token ||
              formRef.current?.querySelector<HTMLInputElement>(
                '[name="token"]',
              )?.value;

            if (!token) {
              const message =
                t("listings.paytabs_token_failed") ||
                "Could not tokenize card. Please try again.";
              setFormError(message);
              onError?.(message);
              setTokenizing(false);
              return;
            }

            void Promise.resolve(onToken(token)).finally(() => {
              setTokenizing(false);
            });
          },
        });
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : t("listings.paytabs_load_failed") ||
              "Unable to load secure card form.";
        setFormError(message);
        onError?.(message);
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [clientKey, errorsId, onError, onToken, scriptReady, t]);

  const inputClassName =
    "w-full rounded-xl border bg-white py-3.5 px-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2";

  const handleFormSubmit = () => {
    setFormError("");
    setTokenizing(true);
  };

  const busy = loading || tokenizing;

  return (
    <>
      <Script
        src={PAYTABS_PAYLIB_URL}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => {
          const message =
            t("listings.paytabs_load_failed") ||
            "Unable to load secure card form.";
          setFormError(message);
          onError?.(message);
        }}
      />

      <form
        id={`paytabs-form-${formId}`}
        ref={formRef}
        onSubmit={handleFormSubmit}
        className="space-y-5"
        noValidate
      >
        <div
          id={errorsId}
          className={`text-sm ${formError ? "block" : "hidden"}`}
          style={{ color: getColor("error") }}
          aria-live="polite"
        >
          {formError}
        </div>

        <div>
          <label
            htmlFor={`paytabs-number-${formId}`}
            className="block text-[11px] font-medium leading-none mb-2 text-start"
            style={{ color: getColor("secondaryText") }}
          >
            {t("listings.card_number")}
          </label>
          <input
            id={`paytabs-number-${formId}`}
            type="text"
            data-paylib="number"
            autoComplete="cc-number"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            disabled={busy || disabled}
            className={inputClassName}
            style={{
              borderColor: getColor("border"),
              color: getColor("primaryText"),
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor={`paytabs-expmonth-${formId}`}
              className="block text-[11px] font-medium leading-none mb-2 text-start"
              style={{ color: getColor("secondaryText") }}
            >
              {t("listings.expiration_month") || "Month"}
            </label>
            <input
              id={`paytabs-expmonth-${formId}`}
              type="text"
              data-paylib="expmonth"
              autoComplete="cc-exp-month"
              inputMode="numeric"
              placeholder="MM"
              maxLength={2}
              disabled={busy || disabled}
              className={inputClassName}
              style={{
                borderColor: getColor("border"),
                color: getColor("primaryText"),
              }}
            />
          </div>
          <div>
            <label
              htmlFor={`paytabs-expyear-${formId}`}
              className="block text-[11px] font-medium leading-none mb-2 text-start"
              style={{ color: getColor("secondaryText") }}
            >
              {t("listings.expiration_year") || "Year"}
            </label>
            <input
              id={`paytabs-expyear-${formId}`}
              type="text"
              data-paylib="expyear"
              autoComplete="cc-exp-year"
              inputMode="numeric"
              placeholder="YYYY"
              maxLength={4}
              disabled={busy || disabled}
              className={inputClassName}
              style={{
                borderColor: getColor("border"),
                color: getColor("primaryText"),
              }}
            />
          </div>
          <div>
            <label
              htmlFor={`paytabs-cvv-${formId}`}
              className="block text-[11px] font-medium leading-none mb-2 text-start"
              style={{ color: getColor("secondaryText") }}
            >
              {t("listings.security_code")}
            </label>
            <input
              id={`paytabs-cvv-${formId}`}
              type="text"
              data-paylib="cvv"
              autoComplete="cc-csc"
              inputMode="numeric"
              placeholder="CVV"
              maxLength={4}
              disabled={busy || disabled}
              className={inputClassName}
              style={{
                borderColor: getColor("border"),
                color: getColor("primaryText"),
              }}
            />
          </div>
        </div>

        <p
          className="text-xs leading-relaxed"
          style={{ color: getColor("mutedText") }}
        >
          {t("listings.paytabs_secure_hint") ||
            "Card details are tokenized securely by PayTabs. Mazal never receives your full card number or CVV."}
        </p>

        <Button
          type="submit"
          variant="primary"
          loading={busy}
          disabled={disabled || !scriptReady}
          className="w-full sm:w-auto !rounded-lg px-5"
        >
          {submitLabel}
        </Button>
      </form>
    </>
  );
}
