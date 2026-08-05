"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/hooks/useAuth";
import WorkspaceProfile from "@/components/profile/WorkspaceProfile";

export default function ProfilePage() {
  const { locale } = useLocale();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  // Avoid hydration mismatch: useAuth reads localStorage on the client
  // (token/user present) while the server always starts unauthenticated.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!isAuthenticated) {
      router.replace(`/${locale}/login`);
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
