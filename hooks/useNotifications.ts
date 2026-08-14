"use client";

import { useCallback, useEffect, useState } from "react";
import {
  emitNotificationsChanged,
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  NOTIFICATIONS_CHANGED_EVENT,
  type AppNotification,
  type NotificationFilter,
} from "@/services/notifications";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/context/LocaleContext";

const UNREAD_POLL_MS = 60_000;

export function useNotifications(options?: {
  filter?: NotificationFilter;
  perPage?: number;
}) {
  const filter = options?.filter ?? "all";
  const perPage = options?.perPage ?? 20;
  const { locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined" || !isAuthenticated) return;
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        listNotifications({ locale, filter, perPage }),
        getUnreadCount(locale),
      ]);
      setNotifications(list.data?.items ?? []);
      setUnreadCount(count);
    } catch {
      /* keep last successful list */
    } finally {
      setLoading(false);
    }
  }, [filter, isAuthenticated, locale, perPage]);

  const refreshUnread = useCallback(async () => {
    if (typeof window === "undefined" || !isAuthenticated) return;
    try {
      setUnreadCount(await getUnreadCount(locale));
    } catch {
      /* keep last known count */
    }
  }, [isAuthenticated, locale]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    void refresh();

    const onChange = () => {
      void refresh();
    };
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChange);
    window.addEventListener("focus", onChange);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChange);
      window.removeEventListener("focus", onChange);
    };
  }, [mounted, isAuthenticated, refresh]);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    const timer = window.setInterval(() => {
      void refreshUnread();
    }, UNREAD_POLL_MS);
    return () => window.clearInterval(timer);
  }, [mounted, isAuthenticated, refreshUnread]);

  const markRead = useCallback(
    async (id: number, read = true) => {
      setNotifications((prev) => {
        const next = prev.map((item) =>
          item.id === id
            ? {
                ...item,
                is_read: read,
                read_at: read ? new Date().toISOString() : null,
              }
            : item,
        );
        if (filter === "unread" && read) {
          return next.filter((item) => item.id !== id);
        }
        if (filter === "read" && !read) {
          return next.filter((item) => item.id !== id);
        }
        return next;
      });
      setUnreadCount((count) => {
        const current = notifications.find((item) => item.id === id);
        if (!current || current.is_read === read) return count;
        return read ? Math.max(0, count - 1) : count + 1;
      });
      try {
        if (read) {
          await markNotificationRead(id, locale);
        } else {
          await markNotificationUnread(id, locale);
        }
        emitNotificationsChanged();
      } catch {
        void refresh();
      }
    },
    [filter, locale, notifications, refresh],
  );

  const toggleRead = useCallback(
    (id: number) => {
      const current = notifications.find((item) => item.id === id);
      if (!current) return;
      void markRead(id, !current.is_read);
    },
    [markRead, notifications],
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        is_read: true,
        read_at: item.read_at || new Date().toISOString(),
      })),
    );
    setUnreadCount(0);
    try {
      await markAllNotificationsRead(locale);
      emitNotificationsChanged();
    } catch {
      void refresh();
    }
  }, [locale, refresh]);

  return {
    mounted,
    loading,
    notifications,
    unreadCount,
    recent: notifications.slice(0, 8),
    markRead,
    toggleRead,
    markAllRead,
    refresh,
  };
}
