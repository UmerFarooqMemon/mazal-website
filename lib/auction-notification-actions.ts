import type { AppNotification } from "@/services/notifications";
import { openSupportChatConversation } from "@/context/SupportChatContext";

export const AUCTION_CAPACITY_REFRESH_EVENT = "auction-capacity-refresh";
export const WALLET_REFRESH_EVENT = "wallet-refresh";
export const RUNNER_UP_CHECK_EVENT = "runner-up-offer-check";

function dataId(
  data: AppNotification["data"] | undefined,
  keys: string[],
): string | null {
  if (!data) return null;
  for (const key of keys) {
    const value = data[key];
    if (value != null && String(value).trim() !== "") {
      return String(value);
    }
  }
  return null;
}

export function handleAuctionNotificationSideEffects(
  notification: Pick<AppNotification, "type" | "data" | "body">,
): { toastMessage?: string } {
  const type = notification.type;
  let toastMessage: string | undefined;

  switch (type) {
    case "auction_outbid":
      window.dispatchEvent(new Event(AUCTION_CAPACITY_REFRESH_EVENT));
      break;

    case "auction_deposit_release_approved":
      window.dispatchEvent(new Event(AUCTION_CAPACITY_REFRESH_EVENT));
      window.dispatchEvent(new Event(WALLET_REFRESH_EVENT));
      break;

    case "auction_deposit_release_rejected": {
      window.dispatchEvent(new Event(AUCTION_CAPACITY_REFRESH_EVENT));
      const adminNote =
        dataId(notification.data, ["admin_note", "note"]) ||
        notification.body?.trim() ||
        undefined;
      if (adminNote) toastMessage = adminNote;
      break;
    }

    case "auction_deposit_release_requested":
      window.dispatchEvent(new Event(AUCTION_CAPACITY_REFRESH_EVENT));
      break;

    case "auction_runner_up_offered":
      window.dispatchEvent(new Event(RUNNER_UP_CHECK_EVENT));
      break;

    case "support_message_received": {
      const conversationId = dataId(notification.data, ["conversation_id"]);
      if (conversationId) {
        openSupportChatConversation(Number(conversationId));
      }
      break;
    }

    case "auction_won":
      window.dispatchEvent(new Event(AUCTION_CAPACITY_REFRESH_EVENT));
      break;

    default:
      break;
  }

  return { toastMessage };
}
