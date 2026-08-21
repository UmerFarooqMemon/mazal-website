"use client";

import { useEffect, useRef, useState } from "react";

const DIGIT_STRIP = "0123456789";

type RollingDigitProps = {
  digit: string;
  /** Extra full spins before landing (slot feel). */
  spins?: number;
  durationMs?: number;
  delayMs?: number;
  className?: string;
};

/**
 * Single digit reel — rolls through 0–9 then lands on `digit`.
 */
export function RollingDigit({
  digit,
  spins = 0,
  durationMs = 700,
  delayMs = 0,
  className = "",
}: RollingDigitProps) {
  const target = Number.parseInt(digit, 10);
  const safeTarget = Number.isFinite(target) ? ((target % 10) + 10) % 10 : 0;
  const [offset, setOffset] = useState(safeTarget);
  const [animate, setAnimate] = useState(false);
  const offsetRef = useRef(safeTarget);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setAnimate(false);
      offsetRef.current = safeTarget;
      setOffset(safeTarget);
      return;
    }

    const from = offsetRef.current;
    const fromDigit = ((from % 10) + 10) % 10;
    let forward = (safeTarget - fromDigit + 10) % 10;
    if (forward === 0 && spins === 0) {
      // Value unchanged — no motion.
      return;
    }
    if (forward === 0) forward = 10;
    const travel = spins * 10 + forward;

    setAnimate(false);
    setOffset(from);

    const startId = window.setTimeout(() => {
      setAnimate(true);
      const next = from + travel;
      offsetRef.current = next;
      setOffset(next);
    }, delayMs + 16);

    return () => window.clearTimeout(startId);
  }, [safeTarget, spins, delayMs, digit]);

  const onTransitionEnd = () => {
    // Snap reel back to a short strip position without a visual jump.
    setAnimate(false);
    offsetRef.current = safeTarget;
    setOffset(safeTarget);
  };

  return (
    <span
      className={`relative inline-block overflow-hidden align-baseline ${className}`}
      style={{ height: "1em", lineHeight: 1 }}
      aria-hidden
    >
      <span
        className="inline-flex flex-col will-change-transform"
        onTransitionEnd={onTransitionEnd}
        style={{
          transform: `translateY(${-offset}em)`,
          transition: animate
            ? `transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1)`
            : "none",
        }}
      >
        {Array.from({ length: 40 }, (_, i) => (
          <span key={i} className="flex h-[1em] items-center justify-center">
            {DIGIT_STRIP[i % 10]}
          </span>
        ))}
      </span>
    </span>
  );
}

type RollingNumberProps = {
  value: string;
  spins?: number;
  durationMs?: number;
  staggerMs?: number;
  className?: string;
  digitClassName?: string;
};

/** Rolls each character of a numeric string (e.g. "09"). */
export function RollingNumber({
  value,
  spins = 1,
  durationMs = 900,
  staggerMs = 70,
  className = "",
  digitClassName = "",
}: RollingNumberProps) {
  const chars = value.split("");

  return (
    <span className={`inline-flex ${className}`} aria-label={value}>
      {chars.map((ch, i) =>
        /\d/.test(ch) ? (
          <RollingDigit
            key={i}
            digit={ch}
            spins={spins}
            durationMs={durationMs}
            delayMs={i * staggerMs}
            className={digitClassName}
          />
        ) : (
          <span key={i} className={digitClassName}>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
