"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, UserRound } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import type { ProfileDocument } from "@/services/auth";
import { Button } from "@/components/ui";
import AccountPageShell from "@/components/profile/AccountPageShell";

function ProfileField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const { getColor } = useTheme();
  const display = value?.trim() ? value : "—";

  return (
    <div
      className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 py-3.5 border-b last:border-b-0"
      style={{ borderColor: getColor("border") }}
    >
      <span
        className="text-[11px] font-semibold uppercase tracking-wider shrink-0"
        style={{ color: getColor("mutedText") }}
      >
        {label}
      </span>
      <span
        className="text-sm sm:text-[15px] font-medium text-start sm:text-end break-all"
        style={{ color: getColor("primaryText") }}
      >
        {display}
      </span>
    </div>
  );
}

function BoolField({ label, value }: { label: string; value?: boolean }) {
  const { t } = useLocale();
  return (
    <ProfileField
      label={label}
      value={value ? t("profile.yes") : t("profile.no")}
    />
  );
}

export default function ProfilePage() {
  const { t, locale } = useLocale();
  const { getColor, getGradient } = useTheme();
  const { user, fetchProfile } = useAuth();
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const fetchedLocaleRef = useRef<string | null>(null);

  useEffect(() => {
    if (fetchedLocaleRef.current === locale) return;
    fetchedLocaleRef.current = locale;

    let active = true;
    (async () => {
      try {
        const data = await fetchProfile(locale);
        if (active && data?.documents) {
          setDocuments(data.documents);
        }
      } catch {
        // Keep cached user data when fetch fails
      } finally {
        if (active) setLoadingProfile(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchProfile, locale]);

  const roleLabel =
    user?.role === "trader" ? t("common.trader") : t("common.individual");

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <AccountPageShell
      title={t("common.profile")}
      subtitle={t("profile.profile_subtitle")}
      backHref={`/${locale}/dashboard`}
      icon={<UserRound className="w-5 h-5" strokeWidth={1.8} />}
    >
      {loadingProfile && (
        <p
          className="text-sm mb-4 text-center"
          style={{ color: getColor("mutedText") }}
        >
          {t("profile.loading_profile")}
        </p>
      )}

      <div
        className="flex items-center justify-center gap-4 mb-5 pb-5 border-b"
        style={{ borderColor: getColor("border") }}
      >
        {user?.image_url ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
            <Image
              src={user.image_url}
              alt={user.name || t("common.profile")}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center text-white text-lg font-semibold shrink-0"
            style={{
              background: getGradient("primaryButton"),
              boxShadow: `0 0 0 3px ${getColor("surface")}, 0 0 0 5px ${getColor("primary")}28`,
            }}
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 text-start">
          <p
            className="text-lg font-semibold truncate"
            style={{ color: getColor("primaryText") }}
          >
            {user?.name || "—"}
          </p>
          <p
            className="text-sm truncate mt-0.5"
            style={{ color: getColor("secondaryText") }}
          >
            {user?.login || "—"}
          </p>
        </div>
      </div>

      <div>
        <ProfileField label={t("common.full_name")} value={user?.name} />
        <ProfileField
          label={t("common.email_address")}
          value={user?.email}
        />
        <ProfileField
          label={t("common.mobile_number")}
          value={user?.phone}
        />
        <ProfileField
          label={t("common.emirates_id")}
          value={user?.emirates_id}
        />
        <ProfileField
          label={t("profile.kyc_status")}
          value={user?.kyc_status_label || user?.kyc_status}
        />
        <BoolField
          label={t("profile.identity_verified")}
          value={user?.identity_verified}
        />
        <BoolField
          label={
            user?.email_verified_at
              ? t("profile.email_verified")
              : t("profile.email_not_verified")
          }
          value={Boolean(user?.email_verified_at)}
        />
        <ProfileField
          label={t("profile.login_identifier")}
          value={user?.login}
        />
        <ProfileField label={t("profile.role_label")} value={roleLabel} />
      </div>

      <div className="mt-6">
        <p
          className="text-[11px] font-semibold uppercase tracking-wider mb-3 text-start"
          style={{ color: getColor("mutedText") }}
        >
          {t("profile.documents")}
        </p>
        {documents.length === 0 ? (
          <p
            className="text-sm text-start"
            style={{ color: getColor("secondaryText") }}
          >
            {t("profile.no_documents")}
          </p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc, index) => (
              <li
                key={String(doc.id ?? index)}
                className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm"
                style={{
                  borderColor: getColor("border"),
                  color: getColor("primaryText"),
                }}
              >
                <span className="font-medium truncate">
                  {doc.label || doc.name || doc.type || "Document"}
                </span>
                {doc.url ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium shrink-0"
                    style={{ color: getColor("primary") }}
                  >
                    View
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link href={`/${locale}/profile/edit`} className="flex-1">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="rounded-xl"
            leftIcon={<UserRound className="w-4 h-4" strokeWidth={2} />}
          >
            {t("profile.edit_profile")}
          </Button>
        </Link>
        <Link href={`/${locale}/profile/change-password`} className="flex-1">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            className="rounded-xl"
            leftIcon={<Lock className="w-4 h-4" strokeWidth={2} />}
          >
            {t("profile.change_password")}
          </Button>
        </Link>
      </div>
    </AccountPageShell>
  );
}
