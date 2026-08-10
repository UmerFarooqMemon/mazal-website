"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserRound } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input } from "@/components/ui";
import AccountPageShell from "@/components/profile/AccountPageShell";

export default function EditProfilePage() {
  const { t, locale } = useLocale();
  const { getColor } = useTheme();
  const { user, updateProfile, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string } = {};
    if (!name.trim()) {
      errors.name = t("common.name_required");
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      toast.error(t("common.error_fill_fields"));
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
      });
      toast.success(t("profile.profile_updated"));
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("profile.profile_update_failed"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountPageShell
      title={t("profile.edit_profile_title")}
      subtitle={t("profile.edit_profile_subtitle")}
      backHref={`/${locale}/profile`}
      icon={<UserRound className="w-5 h-5" strokeWidth={1.8} />}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          name="full_name"
          label={t("common.full_name")}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (fieldErrors.name) setFieldErrors({});
          }}
          placeholder={t("common.full_name_placeholder")}
          error={fieldErrors.name}
          required
        />

        <Input
          name="email"
          label={t("common.email_address")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("common.email_placeholder")}
          hint={email ? t("profile.email_readonly_hint") : undefined}
        />

        <Input
          name="phone"
          label={t("common.mobile_number")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("common.mobile_placeholder")}
          hint={phone ? t("profile.phone_readonly_hint") : undefined}
        />

        <div
          className="rounded-xl border px-4 py-3 space-y-2"
          style={{
            backgroundColor: `${getColor("primary")}08`,
            borderColor: getColor("border"),
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: getColor("mutedText") }}
          >
            {t("profile.account_details")}
          </p>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span style={{ color: getColor("secondaryText") }}>
              {t("profile.login_identifier")}
            </span>
            <span
              className="font-medium truncate max-w-[60%] text-end"
              style={{ color: getColor("primaryText") }}
            >
              {user?.login || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span style={{ color: getColor("secondaryText") }}>
              {t("profile.role_label")}
            </span>
            <span
              className="font-medium"
              style={{ color: getColor("primaryText") }}
            >
              {user?.role === "trader"
                ? t("common.trader")
                : t("common.individual")}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={saving || loading}
          className="rounded-xl"
        >
          {saving || loading ? t("profile.saving") : t("profile.save_changes")}
        </Button>
      </form>
    </AccountPageShell>
  );
}
