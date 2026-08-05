"use client";

import { ReactNode, useId, useMemo, useState } from "react";
import PhoneInputLib, { CountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import {
  clampPhoneToCountryMax,
  expectedNationalLength,
  hasNationalPhoneDigits,
  invalidPhoneMessage,
  isValidCountryPhoneNumber,
  nationalMaskForIso,
} from "@/lib/phone-validation";

export interface CountryPhoneChangeMeta {
  dialCode: string;
  countryIso: string;
  formattedValue: string;
  format: string;
}

interface CountryPhoneInputProps {
  value: string;
  onChange: (value: string, meta: CountryPhoneChangeMeta) => void;
  label?: ReactNode;
  error?: ReactNode;
  hint?: string;
  name?: string;
  country?: string;
  preferredCountries?: string[];
  disabled?: boolean;
  enableSearch?: boolean;
  required?: boolean;
}

function isCountryData(
  data: CountryData | Record<string, never>,
): data is CountryData {
  return Boolean(data && "dialCode" in data && typeof data.dialCode === "string");
}

/** Keep "+971 50 …" LTR inside an RTL Arabic error sentence. */
function PhoneErrorWithLtrExample({ text }: { text: string }) {
  const match = text.match(
    /^(.*?:)\s*[\u2066\u200E\u202A]*(\+[\d\s\-().]+)[\u2069\u200E\u202C]*\s*$/,
  );
  if (!match) return <>{text}</>;
  return (
    <>
      {match[1]}{" "}
      <bdi
        dir="ltr"
        className="inline-block whitespace-nowrap"
        style={{ unicodeBidi: "isolate" }}
      >
        {match[2].trim()}
      </bdi>
    </>
  );
}

/**
 * Dynamic per-country phone field:
 * - mask + max digits from libphonenumber for the selected country
 * - live invalid error with that country's example
 */
export default function CountryPhoneInput({
  value,
  onChange,
  label,
  error,
  hint,
  name,
  country = "ae",
  preferredCountries = [
    "ae",
    "sa",
    "kw",
    "bh",
    "qa",
    "om",
    "pk",
    "in",
    "gb",
    "us",
    "ug",
  ],
  disabled,
  enableSearch = true,
  required = false,
}: CountryPhoneInputProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";
  const { getColor } = useTheme();
  const generatedId = useId();
  const inputId = name || generatedId;

  const [activeDial, setActiveDial] = useState("+971");
  const [activeIso, setActiveIso] = useState(country);

  const bloomErrorPrefix =
    t("common.phone_invalid_short") || "Invalid phone number";
  const exampleLabel = t("common.phone_example_label") || "Example";

  const liveError = useMemo(() => {
    if (!hasNationalPhoneDigits(value, activeDial)) return undefined;
    if (isValidCountryPhoneNumber(value, activeIso)) return undefined;
    return invalidPhoneMessage(activeIso, bloomErrorPrefix, exampleLabel);
  }, [value, activeDial, activeIso, bloomErrorPrefix, exampleLabel]);

  const displayError = error || liveError;

  // Fully dynamic: every selected country gets its own mask + length
  const countryMask = useMemo(
    () => nationalMaskForIso(activeIso),
    [activeIso],
  );
  const maxNational = useMemo(
    () => expectedNationalLength(activeIso),
    [activeIso],
  );
  const masks = useMemo(
    () => (countryMask ? { [activeIso]: countryMask } : undefined),
    [activeIso, countryMask],
  );

  return (
    <div
      className={`w-full mazal-country-phone${isRTL ? " mazal-country-phone--rtl" : ""}`}
    >
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-[11px] font-medium leading-none mb-2 ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("secondaryText") }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {label}
          {required ? " *" : ""}
        </label>
      )}

      <PhoneInputLib
        key={`${activeIso}-${isRTL ? "rtl" : "ltr"}`}
        country={activeIso || country}
        value={value}
        preferredCountries={preferredCountries}
        enableSearch={enableSearch}
        disabled={disabled}
        autoFormat
        enableLongNumbers={false}
        countryCodeEditable={false}
        masks={masks}
        defaultMask={countryMask || "... ... ...."}
        alwaysDefaultMask={!countryMask}
        inputProps={{
          id: inputId,
          name,
          autoComplete: "tel",
          required,
          // Soft browser hint; hard limit is clampPhoneToCountryMax
          maxLength:
            maxNational > 0
              ? activeDial.length + 1 + maxNational + 8
              : undefined,
          dir: "ltr",
        }}
        containerClass={`mazal-phone-container${displayError ? " mazal-phone-error" : ""}`}
        inputClass="mazal-phone-input"
        buttonClass="mazal-phone-button"
        dropdownClass="mazal-phone-dropdown"
        searchClass="mazal-phone-search"
        containerStyle={{ width: "100%", direction: "ltr" }}
        inputStyle={{
          width: "100%",
          height: "48px",
          borderRadius: "0.75rem",
          borderColor: displayError ? "#fca5a5" : getColor("border"),
          color: getColor("primaryText"),
          backgroundColor: "#ffffff",
          fontSize: "0.8125rem",
          direction: "ltr",
          textAlign: isRTL ? "right" : "left",
        }}
        buttonStyle={{
          borderRadius: isRTL ? "0 0.75rem 0.75rem 0" : "0.75rem 0 0 0.75rem",
          borderColor: displayError ? "#fca5a5" : getColor("border"),
          backgroundColor: "#ffffff",
          zIndex: 2,
        }}
        dropdownStyle={{
          borderRadius: "0.75rem",
          borderColor: getColor("border"),
          color: getColor("primaryText"),
          ...(isRTL ? { left: "auto", right: 0 } : {}),
        }}
        onChange={(phone, data, _event, formattedValue) => {
          const meta: CountryPhoneChangeMeta = {
            dialCode: isCountryData(data) ? `+${data.dialCode}` : "+971",
            countryIso: isCountryData(data) ? data.countryCode : "ae",
            formattedValue,
            format: isCountryData(data) ? data.format || "" : "",
          };
          const clamped = clampPhoneToCountryMax(
            phone,
            meta.dialCode,
            meta.countryIso,
          );
          setActiveDial(meta.dialCode);
          setActiveIso(meta.countryIso);
          onChange(clamped, meta);
        }}
      />

      {hint && !displayError && (
        <p
          className={`text-[10px] mt-1.5 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("mutedText") }}
        >
          {hint}
        </p>
      )}

      {displayError && (
        <p
          className={`text-[10px] mt-1.5 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}
          style={{ color: getColor("error") }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {typeof displayError === "string" ? (
            <PhoneErrorWithLtrExample text={displayError} />
          ) : (
            displayError
          )}
        </p>
      )}
    </div>
  );
}

export {
  isValidCountryPhoneNumber as isValidCountryPhone,
  invalidPhoneMessage,
  hasNationalPhoneDigits,
  toE164FromPhoneDigits,
} from "@/lib/phone-validation";
