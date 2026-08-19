"use client";

import { Suspense, type ReactNode } from "react";
import { AuctionCapacityProvider } from "@/context/AuctionCapacityContext";
import { SupportChatProvider } from "@/context/SupportChatContext";
import RunnerUpOfferPrompt from "@/components/auction/RunnerUpOfferPrompt";
import SupportChatDock from "@/components/support/SupportChatDock";

function SupportChatLayer() {
  return (
    <SupportChatProvider>
      <SupportChatDock />
    </SupportChatProvider>
  );
}

export default function LayoutProviders({ children }: { children: ReactNode }) {
  return (
    <AuctionCapacityProvider>
      {children}
      <RunnerUpOfferPrompt />
      <Suspense fallback={null}>
        <SupportChatLayer />
      </Suspense>
    </AuctionCapacityProvider>
  );
}
