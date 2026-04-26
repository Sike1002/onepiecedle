import { localDateKey, yesterdayKey } from "./dailyPuzzle";
import { storageGet, storageSet } from "./storage";
import type { GameMode } from "./types";

export const GUESS_BUCKETS = [
  { label: "1–3", min: 1, max: 3 },
  { label: "4–6", min: 4, max: 6 },
  { label: "7–9", min: 7, max: 9 },
  { label: "10+", min: 10, max: Infinity },
] as const;

interface ModeStats {
  streak: number;
  bestStreak: number;
  lastWonDate: string | null;
  totalPlayed: number;
  totalWon: number;
  guesses: string[]; // character ids guessed today
  solved: boolean;
  /** Player chose to reveal — today's attempt ended without a win. */
  revealed: boolean;
  /** Lifetime count of revealed (given-up) days. Surfaced in stats. */
  totalRevealed: number;
  playDate: string; // date for which `guesses`/`solved`/`revealed` apply
  /** Count of wins bucketed by guess count, indexed to GUESS_BUCKETS. */
  guessDistribution: number[];
}

const DEFAULT: ModeStats = {
  streak: 0,
  bestStreak: 0,
  lastWonDate: null,
  totalPlayed: 0,
  totalWon: 0,
  guesses: [],
  solved: false,
  revealed: false,
  totalRevealed: 0,
  playDate: "",
  guessDistribution: [0, 0, 0, 0],
};

function bucketIndex(guessCount: number): number {
  for (let i = 0; i < GUESS_BUCKETS.length; i++) {
    const b = GUESS_BUCKETS[i];
    if (guessCount >= b.min && guessCount <= b.max) return i;
  }
  return GUESS_BUCKETS.length - 1;
}

function key(mode: GameMode) {
  return `onepiecedle.stats.${mode}`;
}

export function loadStats(mode: GameMode, today: string = localDateKey()): ModeStats {
  const raw = storageGet<ModeStats>(key(mode), DEFAULT);
  const s: ModeStats = { ...DEFAULT, ...raw };
  if (!Array.isArray(s.guessDistribution) || s.guessDistribution.length !== GUESS_BUCKETS.length) {
    s.guessDistribution = [0, 0, 0, 0];
  }

  // If playDate isn't today, reset today-state.
  if (s.playDate !== today) {
    s.guesses = [];
    s.solved = false;
    s.revealed = false;
    s.playDate = today;
  }

  // If last won was neither today nor yesterday, streak is broken.
  if (s.lastWonDate && s.lastWonDate !== today && s.lastWonDate !== yesterdayKey(today)) {
    s.streak = 0;
  }

  return s;
}

export function saveStats(mode: GameMode, stats: ModeStats): void {
  storageSet(key(mode), stats);
}

export function recordGuess(mode: GameMode, guessId: string, today: string = localDateKey()): ModeStats {
  const s = loadStats(mode, today);
  if (!s.guesses.includes(guessId)) {
    s.guesses = [...s.guesses, guessId];
  }
  saveStats(mode, s);
  return s;
}

export function recordWin(mode: GameMode, today: string = localDateKey()): ModeStats {
  const s = loadStats(mode, today);
  if (s.solved) return s; // idempotent
  s.solved = true;
  s.totalPlayed += 1;
  s.totalWon += 1;
  const bucket = bucketIndex(s.guesses.length);
  s.guessDistribution[bucket] = (s.guessDistribution[bucket] ?? 0) + 1;
  if (s.lastWonDate === yesterdayKey(today)) {
    s.streak += 1;
  } else if (s.lastWonDate === today) {
    // already counted
  } else {
    s.streak = 1;
  }
  if (s.streak > s.bestStreak) s.bestStreak = s.streak;
  s.lastWonDate = today;
  saveStats(mode, s);
  return s;
}

/** Mark today's attempt as revealed/given-up. Breaks the streak, counts as
 * a played-but-not-won day. Idempotent — repeated calls on the same day are
 * a no-op. */
export function recordReveal(mode: GameMode, today: string = localDateKey()): ModeStats {
  const s = loadStats(mode, today);
  if (s.solved || s.revealed) return s;
  s.revealed = true;
  s.totalPlayed += 1;
  s.totalRevealed += 1;
  s.streak = 0;
  saveStats(mode, s);
  return s;
}

export type { ModeStats };
