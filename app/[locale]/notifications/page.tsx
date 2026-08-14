"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { getLoginHref } from "@/lib/auth-redirect";
import { BackButton, Button } from "@/components/ui";
import NotificationItem from "@/components/notifications/NotificationItem";
import type { NotificationFilter } from "@/services/notifications";

export default function NotificationsPage() {
  const { locale, t } = useLocale();
  const { getColor } = useTheme();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const { notifications, unreadCount, toggleRead, markAllRead, loading: listLoading } =
    useNotifications({ filter, perPage: 50 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!isAuthenticated) {
      router.replace(getLoginHref(locale, `/${locale}/notifications`));
    }
  }, [mounted, isAuthenticated, loading, locale, router]);

  if (!mounted || loading || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
      </div>
    );
  }

  const filters: { key: NotificationFilter; label: string }[] = [
    { key: "all", label: t("notifications.filter_all") },
    { key: "unread", label: t("notifications.filter_unread") },
    { key: "read", label: t("notifications.filter_read") },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: getColor("background") }}
    >
      <section className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-5 sm:mb-6">
            <BackButton href={`/${locale}`} size="sm" className="mb-4 sm:mb-5" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5">
                  <div
                    className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${getColor("primary")}12`,
                      color: getColor("primary"),
                    }}
                  >
                    <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" strokeWidth={1.8} />
                  </div>
                  <h1
                    className="text-[24px] sm:text-[34px] font-serif leading-tight truncate"
                    style={{ color: getColor("primaryText") }}
                  >
                    {t("common.notifications")}
                  </h1>
                </div>
                <p
                  className="text-xs sm:text-base leading-relaxed"
                  style={{ color: getColor("secondaryText") }}
                >
                  {unreadCount > 0
                    ? t("notifications.page_subtitle_unread").replace(
                        "{count}",
                        String(unreadCount),
                      )
                    : t("notifications.page_subtitle")}
                </p>
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full shrink-0 w-full sm:w-auto"
                  onClick={markAllRead}
                >
                  {t("notifications.mark_all_read")}
                </Button>
              )}
            </div>
          </div>

          <div className="mb-4 sm:mb-5 -mx-3 px-3 sm:mx-0 sm:px-0 overflow-x-auto">
            <div
              className="inline-flex min-w-full sm:min-w-0 p-1 rounded-full border gap-1"
              style={{
                backgroundColor: getColor("surface"),
                borderColor: getColor("border"),
              }}
            >
              {filters.map((item) => {
                const active = filter === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilter(item.key)}
                    className="flex-1 sm:flex-none px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap touch-manipulation"
                    style={{
                      backgroundColor: active
                        ? getColor("primary")
                        : "transparent",
                      color: active ? "#fff" : getColor("secondaryText"),
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="rounded-xl sm:rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: getColor("surface"),
              borderColor: getColor("border"),
            }}
          >
            {listLoading && notifications.length === 0 ? (
              <p
                className="px-5 py-14 text-sm text-center"
                style={{ color: getColor("mutedText") }}
              >
                {t("common.loading")}
              </p>
            ) : notifications.length === 0 ? (
              <p
                className="px-5 py-14 text-sm text-center"
                style={{ color: getColor("mutedText") }}
              >
                {t("notifications.empty")}
              </p>
            ) : (
              <div>
                {notifications.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      borderBottom:
                        index < notifications.length - 1
                          ? `1px solid ${getColor("border")}`
                          : undefined,
                    }}
                  >
                    <NotificationItem
                      notification={item}
                      locale={locale}
                      onToggleRead={toggleRead}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
