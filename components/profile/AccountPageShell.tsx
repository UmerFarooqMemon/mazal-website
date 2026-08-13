"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { getLoginHref } from "@/lib/auth-redirect";
import { BackButton } from "@/components/ui";

interface AccountPageShellProps {
  title: string;
  subtitle: string;
  backHref?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export default function AccountPageShell({
  title,
  subtitle,
  backHref,
  children,
  icon,
}: AccountPageShellProps) {
  const { locale } = useLocale();
  const { getColor } = useTheme();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const dashboardHref = `/${locale}/dashboard`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!isAuthenticated) {
      router.replace(
        getLoginHref(locale, backHref || `/${locale}/dashboard`),
      );
    }
  }, [mounted, isAuthenticated, loading, locale, router, backHref]);

  if (!mounted || loading || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: getColor("background") }}
    >
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-xl mx-auto">
          <BackButton href={backHref || dashboardHref} size="sm" className="mb-6" />

          <div className="mb-7">
            <div className="flex items-center gap-3 mb-2">
              {icon && (
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${getColor("primary")}12`,
                    color: getColor("primary"),
                  }}
                >
                  {icon}
                </div>
              )}
              <h1
                className="text-[28px] sm:text-[34px] font-serif leading-tight"
                style={{ color: getColor("primaryText") }}
              >
                {title}
              </h1>
            </div>
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: getColor("secondaryText") }}
            >
              {subtitle}
            </p>
          </div>

          <div
            className="rounded-2xl border p-5 sm:p-7"
            style={{
              backgroundColor: getColor("surface"),
              borderColor: getColor("border"),
            }}
          >
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
