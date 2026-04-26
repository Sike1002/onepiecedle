"use client";

import { useEffect, useState } from "react";
import { localDateKey } from "./dailyPuzzle";
import {
  loadStats as loadStatsRaw,
  recordGuess as recordGuessRaw,
  recordWin as recordWinRaw,
  type ModeStats,
} from "./streak";
import type { GameMode } from "./types";

/** Encapsulates the state + write helpers that every mode page needs:
 * load stats on mount, track guess ids, track solved. Returns everything
 * the page needs to render + record results. */
export function useDailyModeStats(mode: GameMode, today: string = localDateKey()) {
  const [stats, setStats] = useState<ModeStats | null>(null);
  const [guessIds, setGuessIds] = useState<string[]>([]);

  useEffect(() => {
    const s = loadStatsRaw(mode, today);
    setStats(s);
    setGuessIds(s.guesses);
  }, [mode, today]);

  function recordGuess(id: string) {
    const s = recordGuessRaw(mode, id, today);
    setGuessIds(s.guesses);
    setStats(s);
    return s;
  }

  function recordWin() {
    const s = recordWinRaw(mode, today);
    setStats(s);
    return s;
  }

  const solved = stats?.solved ?? false;

  return { stats, guessIds, solved, recordGuess, recordWin, setStats, setGuessIds };
}
