"use client";

import {
  ChangeEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import {
  EMIRATES_ID_MAX_LENGTH,
  EMIRATES_ID_PLACEHOLDER,
  formatEmiratesId,
} from "@/components/kyc/types";
import Input from "./Input";

interface EmiratesIdInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  label?: React.ReactNode;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function readSessionEmiratesId() {
  try {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return "";

    const emiratesId = (JSON.parse(savedUser) as { emirates_id?: unknown })
      .emirates_id;
    return typeof emiratesId === "string"
      ? formatEmiratesId(emiratesId)
      : "";
  } catch {
    return "";
  }
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

    // Skip the separator so the caret is ready for the next digit group
    let caret = index + 1;
    while (caret < masked.length && !isDigit(masked[caret])) caret++;
    return caret;
  }

  return masked.length;
}

const EmiratesIdInput = forwardRef<HTMLInputElement, EmiratesIdInputProps>(
  ({ value, onChange, placeholder, maxLength, ...props }, ref) => {
    const didPrefill = useRef(Boolean(value.trim()));
    const inputRef = useRef<HTMLInputElement | null>(null);
    const pendingCaret = useRef<number | null>(null);

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    useEffect(() => {
      const prefillFromSession = () => {
        if (didPrefill.current || value.trim()) {
          didPrefill.current = true;
          return;
        }

        const sessionEmiratesId = readSessionEmiratesId();
        if (!sessionEmiratesId) return;

        didPrefill.current = true;
        onChange(sessionEmiratesId);
      };

      prefillFromSession();
      window.addEventListener("auth-changed", prefillFromSession);
      window.addEventListener("storage", prefillFromSession);

      return () => {
        window.removeEventListener("auth-changed", prefillFromSession);
        window.removeEventListener("storage", prefillFromSession);
      };
    }, [onChange, value]);

    // Re-apply the caret after React writes the reformatted value back to the DOM
    useLayoutEffect(() => {
      const input = inputRef.current;
      const caret = pendingCaret.current;
      pendingCaret.current = null;

      if (!input || caret === null) return;
      if (document.activeElement !== input) return;

      const safeCaret = Math.min(caret, input.value.length);
      input.setSelectionRange(safeCaret, safeCaret);
    });

    /** Reformats `rawValue` and keeps the caret at the same digit offset */
    const commit = (
      input: HTMLInputElement,
      rawValue: string,
      rawCaret: number,
    ) => {
      const formatted = formatEmiratesId(rawValue);
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

    // Backspace / Delete next to a separator should remove the adjacent digit
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
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        maxLength={maxLength ?? EMIRATES_ID_MAX_LENGTH}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? EMIRATES_ID_PLACEHOLDER}
      />
    );
  },
);

EmiratesIdInput.displayName = "EmiratesIdInput";
export default EmiratesIdInput;
