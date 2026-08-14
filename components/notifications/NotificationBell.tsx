"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";

function NotificationList({
  recent,
  locale,
  onToggleRead,
  onItemOpen,
  emptyLabel,
  mutedColor,
  borderColor,
}: {
  recent: ReturnType<typeof useNotifications>["recent"];
  locale: string;
  onToggleRead: (id: number) => void;
  onItemOpen: (id: number, read: boolean) => void;
  emptyLabel: string;
  mutedColor: string;
  borderColor: string;
}) {
  if (recent.length === 0) {
    return (
      <p className="px-4 py-10 text-sm text-center" style={{ color: mutedColor }}>
        {emptyLabel}
      </p>
    );
  }

  return (
    <>
      {recent.map((item) => (
        <div
          key={item.id}
          className="border-b last:border-b-0"
          style={{ borderColor }}
        >
          <NotificationItem
            notification={item}
            locale={locale}
            compact
            onToggleRead={onToggleRead}
            onOpen={() => onItemOpen(item.id, item.is_read)}
          />
        </div>
      ))}
    </>
  );
}

export default function NotificationBell() {
  const { locale, t } = useLocale();
  const { getColor } = useTheme();
  const { recent, unreadCount, toggleRead, markRead } = useNotifications({
    filter: "all",
    perPage: 8,
  });
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (mobilePanelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const badgeLabel =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  const subtitle =
    unreadCount > 0
      ? t("notifications.unread_count").replace("{count}", String(unreadCount))
      : t("notifications.all_caught_up");

  const handleItemOpen = (id: number, read: boolean) => {
    if (!read) markRead(id, true);
    setOpen(false);
  };

  const renderViewAll = () => (
    <Link
      href={`/${locale}/notifications`}
      onClick={() => setOpen(false)}
      className="block w-full text-center text-sm font-semibold py-2.5 rounded-xl transition-opacity active:opacity-80 lg:py-2 lg:hover:opacity-80"
      style={{
        color: getColor("primary"),
        backgroundColor: `${getColor("primary")}10`,
      }}
    >
      {t("notifications.view_all")}
    </Link>
  );

  const mobileSheet =
    open && portalReady
      ? createPortal(
          <div className="fixed inset-0 z-[80] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label="Close notifications"
              onClick={() => setOpen(false)}
            />
            <div
              ref={mobilePanelRef}
              className="absolute inset-x-0 top-0 max-h-[min(85dvh,640px)] flex flex-col rounded-b-2xl border-b shadow-2xl overflow-hidden"
              style={{
                backgroundColor: getColor("surface"),
                borderColor: getColor("border"),
                paddingTop: "env(safe-area-inset-top)",
              }}
              role="dialog"
              aria-modal="true"
              aria-label={t("common.notifications")}
            >
              <div
                className="flex items-center justify-between gap-3 px-4 py-3.5 border-b shrink-0"
                style={{ borderColor: getColor("border") }}
              >
                <div className="min-w-0">
                  <p
                    className="text-base font-semibold"
                    style={{ color: getColor("primaryText") }}
                  >
                    {t("common.notifications")}
                  </p>
                  <p
                    className="text-[11px] mt-0.5 truncate"
                    style={{ color: getColor("mutedText") }}
                  >
                    {subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg"
                  style={{ color: getColor("primaryText") }}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" strokeWidth={1.6} />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <NotificationList
                  recent={recent}
                  locale={locale}
                  onToggleRead={toggleRead}
                  onItemOpen={handleItemOpen}
                  emptyLabel={t("notifications.empty")}
                  mutedColor={getColor("mutedText")}
                  borderColor={getColor("border")}
                />
              </div>

              <div
                className="border-t px-4 py-3 shrink-0"
                style={{
                  borderColor: getColor("border"),
                  paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
                }}
              >
                {renderViewAll()}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative h-8 w-8 lg:h-9 lg:w-9 flex items-center justify-center rounded-lg transition-colors active:scale-95"
        style={{ color: getColor("primaryText") }}
        aria-label={t("common.notifications")}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="w-4 h-4 lg:w-[18px] lg:h-[18px]" strokeWidth={1.7} />
        {badgeLabel && (
          <span
            className="absolute -top-0.5 -end-0.5 min-w-[15px] h-[15px] px-0.5 flex items-center justify-center rounded-full text-[8px] font-bold leading-none text-white lg:min-w-[16px] lg:h-4 lg:text-[9px]"
            style={{ backgroundColor: "#EF4444" }}
          >
            {badgeLabel}
          </span>
        )}
      </button>

      {/* Desktop anchored dropdown (stays relative to bell) */}
      {open && (
        <div
          className="hidden lg:block absolute end-0 z-[80] mt-2 w-[360px] rounded-2xl border shadow-xl overflow-hidden"
          style={{
            backgroundColor: getColor("surface"),
            borderColor: getColor("border"),
          }}
          role="dialog"
          aria-label={t("common.notifications")}
        >
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 border-b"
            style={{ borderColor: getColor("border") }}
          >
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: getColor("primaryText") }}
              >
                {t("common.notifications")}
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: getColor("mutedText") }}
              >
                {subtitle}
              </p>
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            <NotificationList
              recent={recent}
              locale={locale}
              onToggleRead={toggleRead}
              onItemOpen={handleItemOpen}
              emptyLabel={t("notifications.empty")}
              mutedColor={getColor("mutedText")}
              borderColor={getColor("border")}
            />
          </div>

          <div
            className="border-t px-4 py-3"
            style={{ borderColor: getColor("border") }}
          >
            {renderViewAll()}
          </div>
        </div>
      )}

      {mobileSheet}
    </div>
  );
}
