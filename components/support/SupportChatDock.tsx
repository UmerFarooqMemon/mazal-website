"use client";

import { useState } from "react";
import { MessageCircle, Plus, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useSupportChat } from "@/context/SupportChatContext";
import SupportChatWindow from "@/components/support/SupportChatWindow";
import { featureFlags } from "@/config/featureFlags";

export default function SupportChatDock() {
  const { t } = useLocale();
  const { getColor, getGradient } = useTheme();
  const { isAuthenticated } = useAuth();
  const {
    conversations,
    openWindows,
    inboxOpen,
    totalUnread,
    loadingInbox,
    refreshInbox,
    openInbox,
    closeInbox,
    openConversation,
    startConversation,
  } = useSupportChat();

  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [creating, setCreating] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!featureFlags.auctions || !isAuthenticated) {
    return null;
  }

  const handleCreate = async () => {
    const subject = newSubject.trim();
    const body = newBody.trim();
    if (!subject || !body) {
      setError(t("support.compose_required"));
      return;
    }

    setCreating(true);
    setError(null);
    try {
      await startConversation({ subject, body });
      setNewSubject("");
      setNewBody("");
      setComposeOpen(false);
      closeInbox();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("support.compose_failed"),
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed bottom-0 end-0 z-[90] pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end gap-3 p-3 sm:p-4">
        {inboxOpen && (
          <div
            className="w-[320px] sm:w-[360px] rounded-2xl border shadow-[0_16px_40px_rgba(0,0,0,0.18)] overflow-hidden"
            style={{
              backgroundColor: getColor("surface"),
              borderColor: getColor("border"),
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: getColor("border") }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: getColor("primaryText") }}
              >
                {t("support.inbox_title")}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="size-8 inline-flex items-center justify-center rounded-full"
                  style={{ color: getColor("primary") }}
                  onClick={() => setComposeOpen((prev) => !prev)}
                  aria-label={t("support.new_conversation")}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="size-8 inline-flex items-center justify-center rounded-full"
                  style={{ color: getColor("mutedText") }}
                  onClick={closeInbox}
                  aria-label={t("support.close_inbox")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {composeOpen && (
              <div
                className="px-4 py-3 border-b space-y-2"
                style={{ borderColor: getColor("border") }}
              >
                <input
                  value={newSubject}
                  onChange={(event) => setNewSubject(event.target.value)}
                  placeholder={t("support.subject_placeholder")}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: getColor("border"),
                    color: getColor("primaryText"),
                    backgroundColor: getColor("background"),
                  }}
                />
                <textarea
                  value={newBody}
                  onChange={(event) => setNewBody(event.target.value)}
                  rows={3}
                  placeholder={t("support.message_placeholder")}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none"
                  style={{
                    borderColor: getColor("border"),
                    color: getColor("primaryText"),
                    backgroundColor: getColor("background"),
                  }}
                />
                {error && (
                  <p className="text-xs" style={{ color: getColor("error") }}>
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => void handleCreate()}
                  className="w-full rounded-xl py-2 text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: getGradient("primaryButton") }}
                >
                  {creating ? t("common.loading") : t("support.start_chat")}
                </button>
              </div>
            )}

            <div className="max-h-[320px] overflow-y-auto">
              {loadingInbox ? (
                <p
                  className="px-4 py-6 text-sm"
                  style={{ color: getColor("mutedText") }}
                >
                  {t("common.loading")}
                </p>
              ) : conversations.length === 0 ? (
                <p
                  className="px-4 py-6 text-sm"
                  style={{ color: getColor("mutedText") }}
                >
                  {t("support.inbox_empty")}
                </p>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => {
                      openConversation(conversation.id, conversation.subject);
                      closeInbox();
                    }}
                    className="w-full text-start px-4 py-3 border-b hover:opacity-90"
                    style={{ borderColor: getColor("border") }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: getColor("primaryText") }}
                      >
                        {conversation.subject}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                          style={{ backgroundColor: getColor("primary") }}
                        >
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs mt-1 truncate"
                      style={{ color: getColor("mutedText") }}
                    >
                      {conversation.status}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          {openWindows.map((windowState) => (
            <SupportChatWindow key={windowState.conversationId} windowState={windowState} />
          ))}

          <button
            type="button"
            onClick={() => {
              if (inboxOpen) {
                closeInbox();
              } else {
                void refreshInbox();
                openInbox();
              }
            }}
            className="relative size-14 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.18)] inline-flex items-center justify-center text-white"
            style={{ background: getGradient("primaryButton") }}
            aria-label={t("support.open_chat")}
          >
            <MessageCircle className="w-6 h-6" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -end-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold inline-flex items-center justify-center">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
