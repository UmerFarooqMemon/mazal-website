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
  UAE_PHONE_MAX_LENGTH,
  UAE_PHONE_PLACEHOLDER,
  UAE_PHONE_SAMPLE,
  caretAfterUaeNationalDigits,
  countUaeNationalDigitsBefore,
  formatUaePhone,
  uaeMobileStartsWithFive,
} from "@/lib/uae-phone";
import Input from "./Input";

interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  label?: React.ReactNode;
  error?: ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const isDigit = (char: string | undefined) =>
  char !== undefined && char >= "0" && char <= "9";

/** Keep the sample LTR + nowrap so Arabic RTL never reverses or splits it */
function withPhoneSample(message: ReactNode): ReactNode {
  if (message == null || message === false || message === "") return message;
  return (
    <>
      {message}{" "}
      <bdi
        dir="ltr"
        className="inline-block whitespace-nowrap"
        style={{ unicodeBidi: "isolate" }}
      >
        {UAE_PHONE_SAMPLE}
      </bdi>
    </>
  );
}

/**
 * UAE mobile input — same caret/mask behavior as EmiratesIdInput.
 * Digits only; formats as +971 XX XXX XXXX while typing.
 * Live EN/AR error when the number does not start with 5.
 */
const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, placeholder, maxLength, error, ...props }, ref) => {
    const { t } = useLocale();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const pendingCaret = useRef<number | null>(null);

    const startError =
      uaeMobileStartsWithFive(value) === false
        ? t("common.mobile_must_start_with_5")
        : undefined;

    const rawError = error || startError;
    const showSample =
      typeof rawError === "string" &&
      (rawError === t("common.mobile_must_start_with_5") ||
        rawError === t("common.mobile_invalid") ||
        rawError === t("kyc.invalid_phone") ||
        rawError.includes("مثال") ||
        rawError.toLowerCase().includes("example"));

    const displayError = showSample ? withPhoneSample(rawError) : rawError;

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
      const formatted = formatUaePhone(rawValue);
      const caret = caretAfterUaeNationalDigits(
        formatted,
        countUaeNationalDigitsBefore(rawValue, rawCaret),
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

      const prefix = current.match(/^\+971\s*/);
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
        maxLength={maxLength ?? UAE_PHONE_MAX_LENGTH}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? UAE_PHONE_PLACEHOLDER}
        error={displayError}
      />
    );
  },
);

PhoneInput.displayName = "PhoneInput";
export default PhoneInput;
