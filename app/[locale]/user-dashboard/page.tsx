"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/hooks/useAuth";
import WorkspaceProfile from "@/components/profile/WorkspaceProfile";
import { getLoginHref } from "@/lib/auth-redirect";

export default function UserDashboardPage() {
  const { locale } = useLocale();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!isAuthenticated) {
      router.replace(getLoginHref(locale, `/${locale}/user-dashboard`));
    }
  }, [mounted, isAuthenticated, loading, locale, router]);

  if (!mounted || loading || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
      </div>
    );
  }

  return <WorkspaceProfile />;
}
