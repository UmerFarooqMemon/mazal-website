"use client";

import {
  ChangeEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import {
  UAE_NATIONAL_PHONE_MAX_LENGTH,
  UAE_NATIONAL_PHONE_PLACEHOLDER,
  UAE_PHONE_MAX_LENGTH,
  UAE_PHONE_PLACEHOLDER,
  formatUaeNationalPhone,
  formatUaePhone,
} from "@/lib/uae-phone";
import Input from "./Input";

export type PhoneInputMode = "international" | "national";

interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  /** international: +971 XX XXX XXXX · national: XX XXX XXXX */
  mode?: PhoneInputMode;
  label?: React.ReactNode;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const isDigit = (char: string | undefined) =>
  char !== undefined && char >= "0" && char <= "9";

function countDigits(value: string) {
  let count = 0;
  for (const char of value) if (isDigit(char)) count++;
  return count;
}

/** Caret index in the masked value that sits right after `digitCount` digits */
function caretAfterDigits(masked: string, digitCount: number) {
  if (digitCount <= 0) return 0;

  let seen = 0;
  for (let index = 0; index < masked.length; index++) {
    if (!isDigit(masked[index])) continue;

    seen++;
    if (seen < digitCount) continue;

    let caret = index + 1;
    while (caret < masked.length && !isDigit(masked[caret])) caret++;
    return caret;
  }

  return masked.length;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      mode = "international",
      placeholder,
      maxLength,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const pendingCaret = useRef<number | null>(null);
    const format =
      mode === "national" ? formatUaeNationalPhone : formatUaePhone;
    const defaultPlaceholder =
      mode === "national"
        ? UAE_NATIONAL_PHONE_PLACEHOLDER
        : UAE_PHONE_PLACEHOLDER;
    const defaultMaxLength =
      mode === "national"
        ? UAE_NATIONAL_PHONE_MAX_LENGTH
        : UAE_PHONE_MAX_LENGTH;

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
      const formatted = format(rawValue);
      const caret = caretAfterDigits(
        formatted,
        countDigits(rawValue.slice(0, rawCaret)),
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

      if (event.key === "Backspace") {
        while (target > 0 && !isDigit(current[target - 1])) target--;
        if (target === selectionStart) return;

        event.preventDefault();
        if (target === 0) return;
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
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        maxLength={maxLength ?? defaultMaxLength}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? defaultPlaceholder}
      />
    );
  },
);

PhoneInput.displayName = "PhoneInput";
export default PhoneInput;
