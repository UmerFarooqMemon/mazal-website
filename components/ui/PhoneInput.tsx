"use client";

import {
  ChangeEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { useLocale } from "@/context/LocaleContext";
import {
  formatPhoneWithCountryCode,
  getPhoneLengthRule,
  phoneMaxLengthForCode,
  phonePlaceholderForCode,
  toNationalPhoneDigits,
} from "@/components/kyc/types";
import Input from "./Input";

interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  /** E.164 dialing code shown as the fixed prefix (e.g. +971, +966). */
  countryCode?: string;
  label?: React.ReactNode;
  error?: ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const isDigit = (char: string | undefined) =>
  char !== undefined && char >= "0" && char <= "9";


function countNationalDigitsBefore(
  rawValue: string,
  rawCaret: number,
  countryCode: string,
) {
  const before = rawValue.slice(0, Math.max(0, rawCaret));
  return toNationalPhoneDigits(before, countryCode).length;
}

function caretAfterNationalDigits(
  masked: string,
  nationalDigitCount: number,
  countryCode: string,
) {
  const prefixRe = new RegExp(
    `^\\${countryCode.replace("+", "\\+")}\\s*`,
  );
  const prefix = masked.match(prefixRe);
  const start = prefix ? prefix[0].length : 0;

  if (nationalDigitCount <= 0) return start;

  let seen = 0;
  for (let index = start; index < masked.length; index++) {
    const char = masked[index];
    if (char < "0" || char > "9") continue;
    seen++;
    if (seen < nationalDigitCount) continue;

    let caret = index + 1;
    while (caret < masked.length && (masked[caret] < "0" || masked[caret] > "9")) {
      caret++;
    }
    return caret;
  }

  return masked.length;
}

/**
 * International phone input with a fixed dialing-code prefix.
 * Defaults to UAE (+971) mask behavior when countryCode is +971.
 */
const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      countryCode = "+971",
      placeholder,
      maxLength,
      error,
      ...props
    },
    ref,
  ) => {
    const { t } = useLocale();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const pendingCaret = useRef<number | null>(null);

    const nationalDigits = toNationalPhoneDigits(value, countryCode);
    const { min, max } = getPhoneLengthRule(countryCode);
    const lengthError =
      nationalDigits.length > 0 &&
      (nationalDigits.length < min || nationalDigits.length > max)
        ? t("common.phone_length_invalid") || t("common.mobile_invalid")
        : undefined;

    const rawError = error || lengthError;
    const displayError = rawError;

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    useLayoutEffect(() => {
      const input = inputRef.current;
      const caret = pendingCaret.current;
      pendingCaret.current = null;

      if (!input || caret === null) return;
      if (document.activeElement !== input) return;

      const safeCaret = Math.min(caret, input.value.length);
      input.setSelectionRange(safeCaret, safeCaret);
    });

    const commit = (
      input: HTMLInputElement,
      rawValue: string,
      rawCaret: number,
    ) => {
      const formatted = formatPhoneWithCountryCode(rawValue, countryCode);
      const caret = caretAfterNationalDigits(
        formatted,
        countNationalDigitsBefore(rawValue, rawCaret, countryCode),
        countryCode,
      );

      pendingCaret.current = caret;
      if (input.value !== formatted) input.value = formatted;
      input.setSelectionRange(caret, caret);
      onChange(formatted);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      commit(input, input.value, input.selectionStart ?? input.value.length);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      props.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key !== "Backspace" && event.key !== "Delete") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const input = event.currentTarget;
      const { selectionStart, selectionEnd } = input;
      if (selectionStart === null || selectionStart !== selectionEnd) return;

      const current = input.value;
      let target = selectionStart;
      const prefixRe = new RegExp(
        `^\\${countryCode.replace("+", "\\+")}\\s*`,
      );
      const prefix = current.match(prefixRe);
      const nationalStart = prefix ? prefix[0].length : 0;

      if (event.key === "Backspace") {
        while (target > nationalStart && !isDigit(current[target - 1])) target--;
        if (target <= nationalStart) {
          event.preventDefault();
          return;
        }
        if (target === selectionStart) return;

        event.preventDefault();
        commit(
          input,
          current.slice(0, target - 1) + current.slice(selectionStart),
          target - 1,
        );
        return;
      }

      while (target < current.length && !isDigit(current[target])) target++;
      if (target === selectionStart) return;

      event.preventDefault();
      if (target === current.length) return;
      commit(
        input,
        current.slice(0, target) + current.slice(target + 1),
        target,
      );
    };

    return (
      <Input
        ref={setRefs}
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="tel"
        dir="ltr"
        className={`!text-left [unicode-bidi:isolate] ${props.className ?? ""}`}
        value={value}
        maxLength={maxLength ?? phoneMaxLengthForCode(countryCode)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? phonePlaceholderForCode(countryCode)}
        error={displayError}
      />
    );
  },
);

PhoneInput.displayName = "PhoneInput";
export default PhoneInput;
