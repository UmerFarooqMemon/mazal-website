"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { useLocale } from "@/context/LocaleContext";
import { formatEmiratesId } from "@/components/kyc/types";
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
  ({ value, onChange, placeholder, ...props }, ref) => {
    const { t } = useLocale();

    return (
      <Input
        ref={ref}
        {...props}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(formatEmiratesId(e.target.value))}
        placeholder={placeholder ?? t("common.emirates_id_placeholder")}
      />
    );
  },
);

EmiratesIdInput.displayName = "EmiratesIdInput";
export default EmiratesIdInput;
