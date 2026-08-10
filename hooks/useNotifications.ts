"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_CHANGED_EVENT,
  toggleNotificationRead,
  type AppNotification,
} from "@/services/notifications";
import { useAuth } from "@/hooks/useAuth";

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;
    setNotifications(getNotifications());
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated) {
      setNotifications([]);
      return;
    }

    refresh();

    const onChange = () => refresh();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [mounted, isAuthenticated, refresh]);

  const unreadCount = useMemo(
    () => (isAuthenticated ? getUnreadCount() : 0),
    [isAuthenticated, notifications],
  );

  const markRead = useCallback((id: string, read = true) => {
    setNotifications(markNotificationRead(id, read));
  }, []);

  const toggleRead = useCallback((id: string) => {
    setNotifications(toggleNotificationRead(id));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(markAllNotificationsRead());
  }, []);

  return {
    mounted,
    notifications,
    unreadCount,
    recent: notifications.slice(0, 5),
    markRead,
    toggleRead,
    markAllRead,
    refresh,
  };
}
