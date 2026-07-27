"use client";

import { useLocale } from "@/context/LocaleContext";
import { OTHER_BANK_KEY, UAE_BANKS } from "@/lib/uae-banks";
import Input from "./Input";
import Select from "./Select";

interface BankSelectProps {
  label?: string;
  value: string;
  otherValue?: string;
  onChange: (bankKey: string) => void;
  onOtherChange?: (name: string) => void;
  placeholder?: string;
  otherLabel?: string;
  otherPlaceholder?: string;
}

export default function BankSelect({
  label,
  value,
  otherValue = "",
  onChange,
  onOtherChange,
  placeholder,
  otherLabel,
  otherPlaceholder,
}: BankSelectProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-3">
      <Select
        label={label}
        options={[...UAE_BANKS]}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {value === OTHER_BANK_KEY && (
        <Input
          label={otherLabel || t("private-deal.other_bank_name")}
          value={otherValue}
          onChange={(e) => onOtherChange?.(e.target.value)}
          placeholder={otherPlaceholder || t("private-deal.other_bank_placeholder")}
        />
      )}
    </div>
  );
}
