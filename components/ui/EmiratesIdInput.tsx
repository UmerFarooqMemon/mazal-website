"use client";

import {
  InputHTMLAttributes,
  forwardRef,
  useEffect,
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

const EmiratesIdInput = forwardRef<HTMLInputElement, EmiratesIdInputProps>(
  ({ value, onChange, placeholder, maxLength, ...props }, ref) => {
    const didPrefill = useRef(Boolean(value.trim()));

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

    return (
      <Input
        ref={ref}
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        maxLength={maxLength ?? EMIRATES_ID_MAX_LENGTH}
        onChange={(e) => onChange(formatEmiratesId(e.target.value))}
        placeholder={placeholder ?? EMIRATES_ID_PLACEHOLDER}
      />
    );
  },
);

EmiratesIdInput.displayName = "EmiratesIdInput";
export default EmiratesIdInput;
