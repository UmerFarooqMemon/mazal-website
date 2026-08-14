"use client";
import { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleProvider } from "@/context/LocaleContext";
import { useLocale } from "@/context/LocaleContext";
import { Button, BackButton } from "@/components/ui";
import {
  FileText,
  Car,
  Settings,
  Users,
} from "lucide-react";
import { getLocaleDir, normalizeLocale } from "@/lib/locale";

function DashboardSidebar() {
  const { t, locale } = useLocale();
  const pathname = usePathname();

  const sidebarLinks = [
    {
      href: `/${locale}/trader/overview`,
      label: t("dashboard.certificate_requests") || "Certificate Requests",
      icon: FileText,
    },
    {
      href: `/${locale}/trader/listings-manager`,
      label: t("dashboard.listings_manager") || "Listings Manager",
      icon: Car,
    },
    {
      href: `/${locale}/trader/crm`,
      label: t("dashboard.crm") || "CRM",
      icon: Users,
    },
    {
      href: `/${locale}/trader/settings`,
      label: t("common.settings") || "Settings",
      icon: Settings,
    },
  ];

  return (
    <div
      className={`w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] min-h-screen p-6 text-start`}
    >
      {/* Back to Home */}
      <BackButton href={`/${locale}`} className="mb-6" size="sm">
        {t("common.back") || "Back"}
      </BackButton>

      {/* Dashboard Title */}
      <h2 className="text-lg font-bold text-[var(--color-text-dark)] mb-6">
        {t("common.dashboard") || "DASHBOARD"}
      </h2>

      {/* Sidebar Links */}
      <nav className="space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.includes(link.href.split("/").pop() || "");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${ isActive ? "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] font-medium" : "text-[var(--color-muted-text)] hover:bg-[var(--color-background)]" }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Order Valuation Button */}
      <div className="mt-8">
        <Link href={`/${locale}/certificates/request`}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            className="rounded-full"
          >
            {t("certificates.order_valuation") || "ORDER A VALUATION"}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const validLocale = normalizeLocale(locale);
  const dir = getLocaleDir(validLocale);

  return (
    <LocaleProvider initialLocale={validLocale}>
      <div
        className="flex min-h-screen bg-[var(--color-background)]"
        dir={dir}
        lang={validLocale}
        data-locale-root
      >
        <DashboardSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </LocaleProvider>
  );
}
