"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/hooks/useAuth";
import {
  createSupportConversation,
  listSupportConversations,
  type SupportConversation,
} from "@/services/support";

export interface OpenChatWindow {
  conversationId: number;
  subject: string;
  minimized: boolean;
  lastMessageId: number | null;
}

export interface StartSupportConversationInput {
  subject: string;
  body: string;
  context_type?: string;
  context_id?: number | string;
}

interface SupportChatContextValue {
  conversations: SupportConversation[];
  openWindows: OpenChatWindow[];
  inboxOpen: boolean;
  totalUnread: number;
  loadingInbox: boolean;
  refreshInbox: () => Promise<void>;
  openInbox: () => void;
  closeInbox: () => void;
  openConversation: (
    conversationId: number,
    subject?: string,
    lastMessageId?: number | null,
  ) => void;
  closeConversation: (conversationId: number) => void;
  toggleMinimize: (conversationId: number) => void;
  updateLastMessageId: (
    conversationId: number,
    lastMessageId: number | null,
  ) => void;
  startConversation: (
    input: StartSupportConversationInput,
  ) => Promise<number | null>;
}

const SupportChatContext = createContext<SupportChatContextValue | undefined>(
  undefined,
);

const MAX_OPEN_WINDOWS = 3;

export function SupportChatProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<SupportConversation[]>(
    [],
  );
  const [openWindows, setOpenWindows] = useState<OpenChatWindow[]>([]);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const handledSupportParam = useRef<string | null>(null);

  const refreshInbox = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      return;
    }

    setLoadingInbox(true);
    try {
      const response = await listSupportConversations(locale, 20, 1);
      setConversations(response.data.conversations || []);
    } catch {
      // Keep the last inbox snapshot.
    } finally {
      setLoadingInbox(false);
    }
  }, [isAuthenticated, locale]);

  useEffect(() => {
    void refreshInbox();
  }, [refreshInbox]);

  useEffect(() => {
    if (!isAuthenticated) {
      setOpenWindows([]);
      setInboxOpen(false);
    }
  }, [isAuthenticated]);

  const openConversation = useCallback(
    (
      conversationId: number,
      subject = "Support",
      lastMessageId: number | null = null,
    ) => {
      setInboxOpen(false);
      setOpenWindows((prev) => {
        const existing = prev.find(
          (window) => window.conversationId === conversationId,
        );
        if (existing) {
          return prev.map((window) =>
            window.conversationId === conversationId
              ? { ...window, minimized: false, subject: subject || window.subject }
              : window,
          );
        }

        const next = [
          ...prev,
          {
            conversationId,
            subject,
            minimized: false,
            lastMessageId,
          },
        ];

        if (next.length <= MAX_OPEN_WINDOWS) return next;
        return next.slice(next.length - MAX_OPEN_WINDOWS);
      });
    },
    [],
  );

  const closeConversation = useCallback((conversationId: number) => {
    setOpenWindows((prev) =>
      prev.filter((window) => window.conversationId !== conversationId),
    );
  }, []);

  const toggleMinimize = useCallback((conversationId: number) => {
    setOpenWindows((prev) =>
      prev.map((window) =>
        window.conversationId === conversationId
          ? { ...window, minimized: !window.minimized }
          : window,
      ),
    );
  }, []);

  const updateLastMessageId = useCallback(
    (conversationId: number, lastMessageId: number | null) => {
      setOpenWindows((prev) =>
        prev.map((window) =>
          window.conversationId === conversationId
            ? { ...window, lastMessageId }
            : window,
        ),
      );
    },
    [],
  );

  const startConversation = useCallback(
    async (input: StartSupportConversationInput) => {
      const response = await createSupportConversation(locale, input);
      const conversation = response.data.conversation;
      if (!conversation?.id) return null;

      await refreshInbox();
      openConversation(conversation.id, conversation.subject);
      return conversation.id;
    },
    [locale, openConversation, refreshInbox],
  );

  useEffect(() => {
    const supportId = searchParams.get("support");
    if (!supportId || !isAuthenticated) return;
    if (handledSupportParam.current === supportId) return;

    handledSupportParam.current = supportId;
    const conversationId = Number(supportId);
    if (!Number.isFinite(conversationId)) return;

    const match = conversations.find((item) => item.id === conversationId);
    openConversation(conversationId, match?.subject || "Support");
  }, [conversations, isAuthenticated, openConversation, searchParams]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ conversationId?: number }>).detail;
      if (detail?.conversationId) {
        openConversation(detail.conversationId);
        void refreshInbox();
      }
    };

    window.addEventListener("support-chat-open", handler);
    return () => window.removeEventListener("support-chat-open", handler);
  }, [openConversation, refreshInbox]);

  const totalUnread = useMemo(
    () =>
      conversations.reduce(
        (sum, conversation) => sum + (conversation.unread_count || 0),
        0,
      ),
    [conversations],
  );

  const value = useMemo(
    () => ({
      conversations,
      openWindows,
      inboxOpen,
      totalUnread,
      loadingInbox,
      refreshInbox,
      openInbox: () => setInboxOpen(true),
      closeInbox: () => setInboxOpen(false),
      openConversation,
      closeConversation,
      toggleMinimize,
      updateLastMessageId,
      startConversation,
    }),
    [
      closeConversation,
      conversations,
      inboxOpen,
      loadingInbox,
      openConversation,
      openWindows,
      refreshInbox,
      startConversation,
      toggleMinimize,
      totalUnread,
      updateLastMessageId,
    ],
  );

  return (
    <SupportChatContext.Provider value={value}>
      {children}
    </SupportChatContext.Provider>
  );
}

export function useSupportChat() {
  const context = useContext(SupportChatContext);
  if (!context) {
    throw new Error("useSupportChat must be used within SupportChatProvider");
  }
  return context;
}

export function openSupportChatConversation(conversationId: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("support-chat-open", { detail: { conversationId } }),
  );
}
