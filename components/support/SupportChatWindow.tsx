"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Send, X } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { useSupportChat, type OpenChatWindow } from "@/context/SupportChatContext";
import {
  getSupportConversation,
  sendSupportMessage,
  type SupportMessage,
} from "@/services/support";

const POLL_INTERVAL_MS = 4000;

interface SupportChatWindowProps {
  windowState: OpenChatWindow;
}

export default function SupportChatWindow({ windowState }: SupportChatWindowProps) {
  const { locale, t } = useLocale();
  const { getColor, getGradient } = useTheme();
  const { closeConversation, toggleMinimize, updateLastMessageId, refreshInbox } =
    useSupportChat();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<number | null>(windowState.lastMessageId);

  const scrollToBottom = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, []);

  const fetchMessages = useCallback(
    async (incremental = false) => {
      try {
        const response = await getSupportConversation(
          locale,
          windowState.conversationId,
          incremental ? lastMessageIdRef.current : null,
        );
        const incoming = response.data.messages || [];
        if (incremental && incoming.length > 0) {
          setMessages((prev) => {
            const seen = new Set(prev.map((message) => message.id));
            const merged = [...prev];
            incoming.forEach((message) => {
              if (!seen.has(message.id)) merged.push(message);
            });
            return merged.sort((a, b) => a.id - b.id);
          });
        } else if (!incremental) {
          setMessages(incoming);
        }

        const latestId =
          incoming.length > 0
            ? incoming[incoming.length - 1].id
            : lastMessageIdRef.current;
        if (latestId != null) {
          lastMessageIdRef.current = latestId;
          updateLastMessageId(windowState.conversationId, latestId);
        }
        setError(null);
      } catch (err) {
        if (!incremental) {
          setError(
            err instanceof Error ? err.message : t("support.chat_load_failed"),
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [
      locale,
      t,
      updateLastMessageId,
      windowState.conversationId,
    ],
  );

  useEffect(() => {
    lastMessageIdRef.current = windowState.lastMessageId;
    setLoading(true);
    void fetchMessages(false);
  }, [fetchMessages, windowState.conversationId, windowState.lastMessageId]);

  useEffect(() => {
    if (windowState.minimized) return;
    const interval = window.setInterval(() => {
      void fetchMessages(true);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [fetchMessages, windowState.minimized]);

  useEffect(() => {
    if (!windowState.minimized) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, windowState.minimized]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError(null);
    try {
      const response = await sendSupportMessage(
        locale,
        windowState.conversationId,
        body,
      );
      const message = response.data.message;
      if (message) {
        setMessages((prev) => [...prev, message]);
        lastMessageIdRef.current = message.id;
        updateLastMessageId(windowState.conversationId, message.id);
      }
      setDraft("");
      await refreshInbox();
      scrollToBottom();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("support.chat_send_failed"),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="w-[320px] sm:w-[340px] rounded-t-2xl border shadow-[0_16px_40px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col"
      style={{
        backgroundColor: getColor("surface"),
        borderColor: getColor("border"),
        maxHeight: windowState.minimized ? "auto" : "420px",
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2.5 text-white shrink-0"
        style={{ background: getGradient("primaryButton") }}
      >
        <button
          type="button"
          className="flex-1 text-start text-sm font-semibold truncate"
          onClick={() => toggleMinimize(windowState.conversationId)}
        >
          {windowState.subject}
        </button>
        <button
          type="button"
          className="size-7 inline-flex items-center justify-center rounded-full hover:bg-white/15"
          onClick={() => toggleMinimize(windowState.conversationId)}
          aria-label={t("support.chat_minimize")}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="size-7 inline-flex items-center justify-center rounded-full hover:bg-white/15"
          onClick={() => closeConversation(windowState.conversationId)}
          aria-label={t("support.chat_close")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!windowState.minimized && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-[220px] max-h-[300px]"
          >
            {loading ? (
              <p className="text-xs" style={{ color: getColor("mutedText") }}>
                {t("common.loading")}
              </p>
            ) : messages.length === 0 ? (
              <p className="text-xs" style={{ color: getColor("mutedText") }}>
                {t("support.chat_empty")}
              </p>
            ) : (
              messages.map((message) => {
                const isUser = message.sender_type === "user";
                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[85%] rounded-2xl px-3 py-2 text-sm"
                      style={{
                        backgroundColor: isUser
                          ? `${getColor("primary")}14`
                          : getColor("primaryLight"),
                        color: getColor("primaryText"),
                      }}
                    >
                      {!isUser && (
                        <p
                          className="text-[10px] font-semibold mb-1"
                          style={{ color: getColor("mutedText") }}
                        >
                          {message.sender_name}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words">
                        {message.body}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {error && (
            <p className="px-3 pb-1 text-xs" style={{ color: getColor("error") }}>
              {error}
            </p>
          )}

          <div
            className="border-t px-2 py-2 flex items-end gap-2"
            style={{ borderColor: getColor("border") }}
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={2}
              placeholder={t("support.chat_placeholder")}
              className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: getColor("border"),
                color: getColor("primaryText"),
                backgroundColor: getColor("background"),
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />
            <button
              type="button"
              disabled={sending || !draft.trim()}
              onClick={() => void handleSend()}
              className="size-10 shrink-0 rounded-full inline-flex items-center justify-center text-white disabled:opacity-40"
              style={{ background: getGradient("primaryButton") }}
              aria-label={t("support.chat_send")}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
