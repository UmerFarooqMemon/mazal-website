"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input } from "@/components/ui";
import AccountPageShell from "@/components/profile/AccountPageShell";
import {
  getPasswordValidationError,
  passwordMeetsRequirements,
} from "@/lib/password-validation";

export default function ChangePasswordPage() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const router = useRouter();
  const { changePassword, loading } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    current?: string;
    password?: string;
    confirm?: string;
  }>({});

  const passwordChecks = passwordMeetsRequirements(password);

  const validateFields = () => {
    const errors: { current?: string; password?: string; confirm?: string } =
      {};
    if (!currentPassword.trim()) {
      errors.current = t("common.error_field_required");
    }
    const passwordError = getPasswordValidationError(password);
    if (passwordError === "required") {
      errors.password = t("common.error_field_required");
    } else if (passwordError === "min") {
      errors.password = t("common.password_min_length");
    } else if (passwordError === "letters") {
      errors.password = t("common.password_requires_letter");
    } else if (passwordError === "numbers") {
      errors.password = t("common.password_requires_number");
    }
    if (!confirmPassword.trim()) {
      errors.confirm = t("common.error_field_required");
    } else if (password !== confirmPassword) {
      errors.confirm = t("common.passwords_dont_match");
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) {
      toast.error(t("common.error_fill_fields"));
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: confirmPassword,
      });
      toast.success(t("profile.password_changed"));
      router.push(`/${locale}/login`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("profile.password_change_failed"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountPageShell
      title={t("profile.change_password_title")}
      subtitle={t("profile.change_password_subtitle")}
      backHref={`/${locale}/profile`}
      icon={<Lock className="w-5 h-5" strokeWidth={1.8} />}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          name="current_password"
          label={t("profile.current_password")}
          type={showPassword ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (fieldErrors.current)
              setFieldErrors((prev) => ({ ...prev, current: undefined }));
          }}
          error={fieldErrors.current}
          required
        />
        <Input
          name="new_password"
          label={t("common.new_password")}
          type={showPassword ? "text" : "password"}
          placeholder={t("common.password_placeholder")}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password)
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={fieldErrors.password}
          required
        />
        <Input
          name="confirm_password"
          label={t("common.confirm_password")}
          type={showPassword ? "text" : "password"}
          placeholder={t("common.password_placeholder")}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirm)
              setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
          }}
          error={fieldErrors.confirm}
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="text-xs font-medium"
          style={{ color: getColor("primary") }}
        >
          {showPassword
            ? t("profile.hide_passwords")
            : t("profile.show_passwords")}
        </button>

        <div
          className="text-xs space-y-1.5 text-start"
          style={{ color: getColor("mutedText") }}
        >
          {(
            [
              { key: "pw_at_least_10", met: passwordChecks.minLength },
              { key: "pw_letter", met: passwordChecks.hasLetter },
              { key: "pw_number", met: passwordChecks.hasNumber },
            ] as const
          ).map(({ key, met }) => (
            <p
              key={key}
              style={{ color: met ? getColor("success") : getColor("mutedText") }}
            >
              {met ? "✓" : "○"} {t(`common.${key}`)}
            </p>
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={saving || loading}
          className="rounded-xl"
        >
          {saving || loading
            ? t("profile.changing_password")
            : t("profile.change_password")}
        </Button>
      </form>
    </AccountPageShell>
  );
}
