"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date | string;
  onExpire?: () => void;
  className?: string;
}

export default function CountdownTimer({
  targetDate,
  onExpire,
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer(); // Instant Play
    const interval = setInterval(updateTimer, 1000); // Update every second

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  // Number formatting (add a zero before the odd number: 3 -> 03)
  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div
      className={`flex items-center gap-1 font-mono text-sm font-medium tracking-wider ${className}`}
    >
      <span className="bg-gray-100 px-2 py-1 rounded">
        {formatNumber(timeLeft.days)}d
      </span>
      <span>:</span>
      <span className="bg-gray-100 px-2 py-1 rounded">
        {formatNumber(timeLeft.hours)}h
      </span>
      <span>:</span>
      <span className="bg-gray-100 px-2 py-1 rounded">
        {formatNumber(timeLeft.minutes)}m
      </span>
      <span>:</span>
      <span className="bg-gray-100 px-2 py-1 rounded">
        {formatNumber(timeLeft.seconds)}s
      </span>
    </div>
  );
}
