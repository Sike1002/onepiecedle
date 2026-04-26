"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { localDateKey } from "./dailyPuzzle";
import {
  loadStats as loadStatsRaw,
  recordGuess as recordGuessRaw,
  recordReveal as recordRevealRaw,
  recordWin as recordWinRaw,
  type ModeStats,
} from "./streak";
import type { GameMode } from "./types";

function parseDateParam(value: string | null): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Unified game state — picks between persistent daily stats and ephemeral
 * archive-practice state based on the ?date= query param. Writes to
 * localStorage only on today's puzzle; archive practice never touches the
 * streak.
 *
 * Returns the same shape every mode page needs:
 *   { stats, guessIds, solved, recordGuess, recordWin,
 *     practiceMode, targetDate, targetKey, today }
 */
export function useModeGameState(mode: GameMode) {
  const sp = useSearchParams();
  const dateParam = sp.get("date");
  const today = useMemo(() => localDateKey(), []);
  const parsedDate = useMemo(() => parseDateParam(dateParam), [dateParam]);
  const targetDate = parsedDate ?? new Date();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const targetKey = useMemo(() => localDateKey(targetDate), [parsedDate]);
  const practiceMode = targetKey !== today;

  const [persistentStats, setPersistentStats] = useState<ModeStats | null>(null);
  const [persistentGuessIds, setPersistentGuessIds] = useState<string[]>([]);
  const [practiceGuessIds, setPracticeGuessIds] = useState<string[]>([]);
  const [practiceSolved, setPracticeSolved] = useState(false);

  useEffect(() => {
    if (practiceMode) {
      // archived day — reset ephemeral state, skip persistent load
      setPersistentStats(null);
      setPersistentGuessIds([]);
      setPracticeGuessIds([]);
      setPracticeSolved(false);
      return;
    }
    const s = loadStatsRaw(mode, today);
    setPersistentStats(s);
    setPersistentGuessIds(s.guesses);
  }, [mode, today, targetKey, practiceMode]);

  function recordGuess(id: string): { guesses: string[] } {
    if (practiceMode) {
      let next = practiceGuessIds;
      if (!practiceGuessIds.includes(id)) {
        next = [...practiceGuessIds, id];
        setPracticeGuessIds(next);
      }
      return { guesses: next };
    }
    const s = recordGuessRaw(mode, id, today);
    setPersistentGuessIds(s.guesses);
    setPersistentStats(s);
    return { guesses: s.guesses };
  }

  function recordWin() {
    if (practiceMode) {
      setPracticeSolved(true);
      return null;
    }
    const s = recordWinRaw(mode, today);
    setPersistentStats(s);
    return s;
  }

  const [practiceRevealed, setPracticeRevealed] = useState(false);

  function recordReveal() {
    if (practiceMode) {
      setPracticeRevealed(true);
      return null;
    }
    const s = recordRevealRaw(mode, today);
    setPersistentStats(s);
    return s;
  }

  const guessIds = practiceMode ? practiceGuessIds : persistentGuessIds;
  const solved = practiceMode ? practiceSolved : persistentStats?.solved ?? false;
  const revealed = practiceMode ? practiceRevealed : persistentStats?.revealed ?? false;

  return {
    stats: practiceMode ? null : persistentStats,
    guessIds,
    solved,
    revealed,
    recordGuess,
    recordWin,
    recordReveal,
    practiceMode,
    targetDate,
    targetKey,
    today,
  };
}
