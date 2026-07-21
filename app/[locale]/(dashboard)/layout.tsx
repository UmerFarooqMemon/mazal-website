"use client";
import { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleProvider } from "@/context/LocaleContext";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui";
import {
  FileText,
  Car,
  Settings,
  Users,
  ArrowLeft,
} from "lucide-react";

function DashboardSidebar() {
  const { t, locale } = useLocale();
  const pathname = usePathname();
  const isRTL = locale === "ar";

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
      className={`w-64 bg-white border-r border-gray-200 min-h-screen p-6 ${isRTL ? "text-right" : "text-left"}`}
    >
      {/* Back to Home */}
      <Link
        href={`/${locale}`}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#041443] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t("common.back") || "Back"}</span>
      </Link>

      {/* Dashboard Title */}
      <h2 className="text-lg font-bold text-[#041443] mb-6">
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#0A3B9E]/10 text-[#0A3B9E] font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              } ${isRTL ? "flex-row-reverse" : ""}`}
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
  const validLocale = locale === "ar" || locale === "en" ? locale : "en";
  const dir = validLocale === "ar" ? "rtl" : "ltr";

  return (
    <LocaleProvider initialLocale={validLocale as "ar" | "en"}>
      <div
        className="flex min-h-screen bg-[#FAFAF8]"
        dir={dir}
        lang={validLocale}
        data-locale-root
      >
        <DashboardSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </LocaleProvider>
  );
}
