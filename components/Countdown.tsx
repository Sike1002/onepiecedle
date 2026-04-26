"use client";

import { useEffect, useState } from "react";
import { formatCountdown, msUntilNextLocalMidnight } from "@/lib/dailyPuzzle";

export function Countdown({ prefix = "Next puzzle in" }: { prefix?: string }) {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    setMs(msUntilNextLocalMidnight());
    const id = setInterval(() => setMs(msUntilNextLocalMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  if (ms === null) return null;
  return (
    <span className="font-mono text-sm tabular-nums text-muted">
      {prefix} <span className="text-primary font-bold">{formatCountdown(ms)}</span>
    </span>
  );
}
