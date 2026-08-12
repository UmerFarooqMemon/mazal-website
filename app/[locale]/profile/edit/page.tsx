"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Camera, UserRound } from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Button, CountryPhoneInput, Input } from "@/components/ui";
import AccountPageShell from "@/components/profile/AccountPageShell";
import {
  hasNationalPhoneDigits,
  isValidCountryPhoneNumber,
  normalizePhoneE164,
  toE164FromPhoneDigits,
  toPhoneInputDigits,
} from "@/lib/phone-validation";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

function parseStoredPhone(phone: string | null | undefined) {
  if (!phone?.trim()) {
    return { mobile: "", phone_dial_code: "+971", phone_country_iso: "ae" };
  }

  const parsed = parsePhoneNumberFromString(phone);
  if (parsed) {
    return {
      mobile: `${parsed.countryCallingCode}${parsed.nationalNumber}`,
      phone_dial_code: `+${parsed.countryCallingCode}`,
      phone_country_iso: parsed.country?.toLowerCase() || "ae",
    };
  }

  return {
    mobile: toPhoneInputDigits(phone),
    phone_dial_code: "+971",
    phone_country_iso: "ae",
  };
}

export default function EditProfilePage() {
  const { t, locale } = useLocale();
  const { getColor, getGradient } = useTheme();
  const router = useRouter();
  const { user, token, fetchProfile, updateProfile, loading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [phoneDialCode, setPhoneDialCode] = useState("+971");
  const [phoneCountryIso, setPhoneCountryIso] = useState("ae");
  const [originalPhone, setOriginalPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    mobile?: string;
    current_password?: string;
    image?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const seededUserIdRef = useRef<number | null>(null);
  const userEditedRef = useRef(false);

  const hydrateForm = (profileUser: NonNullable<typeof user>) => {
    setName(profileUser.name || "");
    setEmail(profileUser.email || "");

    const parsedPhone = parseStoredPhone(profileUser.phone);
    setMobile(parsedPhone.mobile);
    setPhoneDialCode(parsedPhone.phone_dial_code);
    setPhoneCountryIso(parsedPhone.phone_country_iso);
    setOriginalPhone(normalizePhoneE164(profileUser.phone));
    setImagePreview(profileUser.image_url || null);
  };

  // Show cached user data immediately (no wait for API)
  useEffect(() => {
    const profileUser =
      user ??
      (() => {
        try {
          const saved = localStorage.getItem("user");
          return saved ? JSON.parse(saved) : null;
        } catch {
          return null;
        }
      })();

    if (!profileUser?.id) return;
    if (seededUserIdRef.current === profileUser.id) return;
    seededUserIdRef.current = profileUser.id;
    hydrateForm(profileUser);
  }, [user]);

  // Refresh from API once token is ready
  useEffect(() => {
    if (!token) return;

    let active = true;
    (async () => {
      try {
        const data = await fetchProfile(locale);
        if (!active || !data?.user || userEditedRef.current) return;
        hydrateForm(data.user);
      } catch {
        // Cached user already shown above
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchProfile, locale, token]);

  const phoneE164 = useMemo(() => {
    const dial = phoneDialCode || "+971";
    return hasNationalPhoneDigits(mobile, dial)
      ? toE164FromPhoneDigits(mobile)
      : "";
  }, [mobile, phoneDialCode]);

  const phoneChanged = useMemo(() => {
    const current = normalizePhoneE164(phoneE164);
    const original = normalizePhoneE164(originalPhone);
    if (!current && !original) return false;
    if (
      !hasNationalPhoneDigits(mobile, phoneDialCode || "+971") &&
      !original
    ) {
      return false;
    }
    return current !== original;
  }, [phoneE164, originalPhone, mobile, phoneDialCode]);

  const requiresCurrentPassword = phoneChanged;

  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_BYTES) {
      setFieldErrors((prev) => ({
        ...prev,
        image: t("profile.photo_too_large"),
      }));
      return;
    }

    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
    setFieldErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setRemoveImage(true);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: typeof fieldErrors = {};
    if (!name.trim()) {
      errors.name = t("common.name_required");
    }

    const dial = phoneDialCode || "+971";
    const iso = phoneCountryIso || "ae";
    const hasMobile = hasNationalPhoneDigits(mobile, dial);
    if (hasMobile && !isValidCountryPhoneNumber(mobile, iso)) {
      errors.mobile =
        t("common.phone_length_invalid") ||
        "Enter the full phone number for the selected country.";
    }

    if (requiresCurrentPassword && !currentPassword.trim()) {
      errors.current_password = t("profile.current_password_required");
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      toast.error(t("common.error_fill_fields"));
      return;
    }

    setSaving(true);
    try {
      const response = await updateProfile(
        {
          name: name.trim(),
          phone: phoneE164 || null,
          current_password: requiresCurrentPassword
            ? currentPassword
            : undefined,
          image: imageFile ?? undefined,
          remove_image: removeImage ? 1 : undefined,
        },
        locale,
      );

      if (response.requiresReLogin) {
        toast.success(t("profile.profile_updated_relogin"));
        router.push(`/${locale}/login`);
        return;
      }

      toast.success(t("profile.profile_updated"));
      router.push(`/${locale}/profile`);
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
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="relative">
            {imagePreview ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-full">
                <Image
                  src={imagePreview}
                  alt={name || t("profile.profile_photo")}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-xl font-semibold text-white"
                style={{ background: getGradient("primaryButton") }}
              >
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -end-1 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm"
              style={{
                backgroundColor: getColor("surface"),
                borderColor: getColor("border"),
                color: getColor("primary"),
              }}
              aria-label={t("profile.change_photo")}
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
            onChange={handleImageSelect}
          />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium"
              style={{ color: getColor("primary") }}
            >
              {t("profile.change_photo")}
            </button>
            {(imagePreview || user?.image_url) && !removeImage ? (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-xs font-medium"
                style={{ color: getColor("error") }}
              >
                {t("profile.remove_photo")}
              </button>
            ) : null}
          </div>

          <p
            className="text-[10px] text-center"
            style={{ color: getColor("mutedText") }}
          >
            {t("profile.photo_max_size")}
          </p>
          {fieldErrors.image ? (
            <p
              className="text-[10px] text-center"
              style={{ color: getColor("error") }}
            >
              {fieldErrors.image}
            </p>
          ) : null}
        </div>

        <Input
          name="full_name"
          label={t("common.full_name")}
          value={name}
          onChange={(e) => {
            userEditedRef.current = true;
            setName(e.target.value);
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
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
          placeholder={t("common.email_placeholder")}
          hint={t("profile.email_readonly_hint")}
          disabled
          readOnly
        />

        <CountryPhoneInput
          name="mobile"
          label={t("common.mobile_number")}
          country={phoneCountryIso}
          value={mobile}
          onChange={(value, meta) => {
            userEditedRef.current = true;
            setMobile(value);
            setPhoneDialCode(meta.dialCode);
            setPhoneCountryIso(meta.countryIso);
            if (fieldErrors.mobile) {
              setFieldErrors((prev) => ({ ...prev, mobile: undefined }));
            }
          }}
          error={fieldErrors.mobile}
          hint={
            requiresCurrentPassword
              ? t("profile.phone_change_hint")
              : undefined
          }
        />

        {requiresCurrentPassword ? (
          <Input
            name="current_password"
            label={t("profile.current_password")}
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (fieldErrors.current_password) {
                setFieldErrors((prev) => ({
                  ...prev,
                  current_password: undefined,
                }));
              }
            }}
            error={fieldErrors.current_password}
            required
          />
        ) : null}

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
