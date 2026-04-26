"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { localDateKey } from "./dailyPuzzle";

function parseDateParam(value: string | null): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Resolve today/archived-date state from a page's ?date= query param.
 *
 * Returns {targetDate, targetKey, practiceMode, today}. When practiceMode
 * is true the caller should:
 *   - use targetDate as the daily-puzzle seed
 *   - track guesses/solved in local state only (no lib/streak calls)
 *   - show an 'archive practice — streak unaffected' banner
 *
 * The practiceSolved state is kept here so callers don't each reimplement
 * it — they can choose whether to use it.
 */
export function useArchivePractice() {
  const sp = useSearchParams();
  const dateParam = sp.get("date");
  const today = useMemo(() => localDateKey(), []);
  const parsedDate = useMemo(() => parseDateParam(dateParam), [dateParam]);
  const targetDate = parsedDate ?? new Date();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const targetKey = useMemo(() => localDateKey(targetDate), [parsedDate]);
  const practiceMode = targetKey !== today;

  const [practiceGuessIds, setPracticeGuessIds] = useState<string[]>([]);
  const [practiceSolved, setPracticeSolved] = useState(false);

  function resetPractice() {
    setPracticeGuessIds([]);
    setPracticeSolved(false);
  }

  function addPracticeGuess(id: string) {
    setPracticeGuessIds((g) => (g.includes(id) ? g : [...g, id]));
  }

  return {
    today,
    targetDate,
    targetKey,
    practiceMode,
    practiceGuessIds,
    practiceSolved,
    setPracticeSolved,
    addPracticeGuess,
    resetPractice,
  };
}
