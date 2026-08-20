"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSupportChat } from "@/context/SupportChatContext";

/** Opens a chat window from `?support={conversationId}` after mount. */
export default function SupportDeepLinkListener() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { conversations, openConversation } = useSupportChat();
  const handledSupportParam = useRef<string | null>(null);

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

  return null;
}
