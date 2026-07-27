"use client";

import { InputHTMLAttributes, forwardRef } from "react";
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

const EmiratesIdInput = forwardRef<HTMLInputElement, EmiratesIdInputProps>(
  ({ value, onChange, placeholder, maxLength, ...props }, ref) => {
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
