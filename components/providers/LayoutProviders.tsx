"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { AuctionCapacityProvider } from "@/context/AuctionCapacityContext";
import { SupportChatProvider } from "@/context/SupportChatContext";
import RunnerUpOfferPrompt from "@/components/auction/RunnerUpOfferPrompt";
import SupportChatDock from "@/components/support/SupportChatDock";
import SupportDeepLinkListener from "@/components/support/SupportDeepLinkListener";

function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <>{children}</>;
}

export default function LayoutProviders({ children }: { children: ReactNode }) {
  return (
    <AuctionCapacityProvider>
      <SupportChatProvider>
        {children}
        <ClientOnly>
          <RunnerUpOfferPrompt />
          <SupportChatDock />
          <Suspense fallback={null}>
            <SupportDeepLinkListener />
          </Suspense>
        </ClientOnly>
      </SupportChatProvider>
    </AuctionCapacityProvider>
  );
}
