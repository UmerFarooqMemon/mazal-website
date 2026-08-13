"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";

export default function UserDashboardRedirectPage() {
  const { locale } = useLocale();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${locale}/dashboard`);
  }, [locale, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
    </div>
  );
}
