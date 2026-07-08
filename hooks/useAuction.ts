"use client";
import { useState, useEffect } from "react";
import { socket } from "@/lib/socket"; // I will write it later

export function useAuction(auctionId: string) {
  const [currentBid, setCurrentBid] = useState(0);
  const [bidderCount, setBidderCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Join the auction room when the page opens
    socket.emit("join-auction", auctionId);

    // Receive price updates
    socket.on("bid-updated", (data) => {
      setCurrentBid(data.newPrice);
      setBidderCount(data.totalBidders);
    });

    return () => {
      socket.off("bid-updated");
      socket.emit("leave-auction", auctionId);
    };
  }, [auctionId]);

  const placeBid = (amount: number) => {
    socket.emit("place-bid", { auctionId, amount });
  };

  return { currentBid, bidderCount, timeLeft, placeBid };
}
