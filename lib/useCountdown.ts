"use client";

import { useEffect, useState } from "react";
import { formatCountdown, msUntilNextLocalMidnight } from "./dailyPuzzle";

/** Live ticking HH:MM:SS to local midnight.
 *
 * SSR-safe: returns the `placeholder` string until the component mounts on the
 * client, which is the whole point — `new Date()` on the server and on the
 * client produce different strings and cause React hydration mismatches. */
export function useCountdown(placeholder: string = "--:--:--"): string {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    setMs(msUntilNextLocalMidnight());
    const id = setInterval(() => setMs(msUntilNextLocalMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  return ms === null ? placeholder : formatCountdown(ms);
}
