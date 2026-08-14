"use client";

import Link from "next/link";
import {
  Award,
  Bell,
  Gavel,
  Handshake,
  ShieldCheck,
  Tag,
  Wallet,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import {
  getNotificationHref,
  type AppNotification,
  type NotificationIcon,
} from "@/services/notifications";

const iconMap: Record<string, typeof Bell> = {
  gavel: Gavel,
  tag: Tag,
  handshake: Handshake,
  wallet: Wallet,
  user: ShieldCheck,
  certificate: Award,
  bell: Bell,
};

function iconFromType(type: string): typeof Bell {
  if (type.includes("auction") || type.includes("bid")) return Gavel;
  if (type.includes("offer") || type.includes("listing")) return Tag;
  if (type.includes("wallet")) return Wallet;
  if (type.includes("kyc") || type.includes("emirates")) return ShieldCheck;
  if (type.includes("certificate") || type.includes("valuation")) return Award;
  if (type.includes("purchase") || type.includes("private") || type.includes("deal")) {
    return Handshake;
  }
  return Bell;
}

function resolveIcon(icon: NotificationIcon | undefined, type: string) {
  if (icon && iconMap[icon]) return iconMap[icon];
  return iconFromType(type);
}

interface NotificationItemProps {
  notification: AppNotification;
  locale: string;
  compact?: boolean;
  onToggleRead: (id: number) => void;
  onOpen?: () => void;
}

export default function NotificationItem({
  notification,
  locale,
  compact = false,
  onToggleRead,
  onOpen,
}: NotificationItemProps) {
  const { t } = useLocale();
  const { getColor } = useTheme();
  const Icon = resolveIcon(notification.icon, notification.type);
  const href = getNotificationHref(notification, locale);

  const content = (
    <div
      className={`flex gap-2.5 sm:gap-3 ${compact ? "px-3 py-3 sm:px-3.5" : "px-3.5 py-3.5 sm:px-4 sm:py-4"} transition-colors`}
      style={{
        backgroundColor: notification.is_read
          ? "transparent"
          : `${getColor("primary")}08`,
      }}
    >
      <div
        className={`shrink-0 rounded-full flex items-center justify-center ${compact ? "h-8 w-8 sm:h-9 sm:w-9" : "h-9 w-9 sm:h-10 sm:w-10"}`}
        style={{
          backgroundColor: notification.is_read
            ? `${getColor("border")}80`
            : `${getColor("primary")}15`,
          color: notification.is_read
            ? getColor("mutedText")
            : getColor("primary"),
        }}
      >
        <Icon
          className={compact ? "w-3.5 h-3.5 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-4.5 sm:h-4.5"}
          strokeWidth={1.8}
        />
      </div>

      <div className="min-w-0 flex-1 text-start">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`leading-snug break-words ${compact ? "text-[13px] sm:text-sm" : "text-sm sm:text-[15px]"} ${notification.is_read ? "font-medium" : "font-semibold"}`}
            style={{ color: getColor("primaryText") }}
          >
            {notification.title}
          </p>
          {!notification.is_read && (
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: getColor("error") || "#EF4444" }}
              aria-hidden
            />
          )}
        </div>
        <p
          className={`mt-0.5 leading-relaxed break-words ${compact ? "text-[11px] sm:text-xs line-clamp-2" : "text-xs sm:text-sm"}`}
          style={{ color: getColor("secondaryText") }}
        >
          {notification.body}
        </p>
        <div className="mt-2 flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <span
            className="text-[10px] sm:text-[11px]"
            style={{ color: getColor("mutedText") }}
          >
            {notification.created_at_human}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleRead(notification.id);
            }}
            className="text-[10px] sm:text-[11px] font-medium hover:opacity-80 transition-opacity touch-manipulation"
            style={{ color: getColor("primary") }}
          >
            {notification.is_read
              ? t("notifications.mark_unread")
              : t("notifications.mark_read")}
          </button>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onOpen} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
