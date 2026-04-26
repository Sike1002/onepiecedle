import { answerPoolFor } from "./characterPools";
import type { GameMode, OnePieceCharacter } from "./types";

export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function hashDate(date: Date = new Date()): number {
  const dayString = localDateKey(date);
  let hash = 0;
  for (let i = 0; i < dayString.length; i++) {
    hash = (hash << 5) - hash + dayString.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const MODE_OFFSET: Record<GameMode, number> = {
  classic: 0,
  quote: 1,
  silhouette: 2,
  emoji: 3,
  devilfruit: 4,
  deepcut: 5,
};

export function getDailyCharacter(
  mode: GameMode,
  date: Date = new Date(),
): OnePieceCharacter {
  // Pool is canon-scoped: normal modes get anime-aired characters, deepcut
  // gets the manga-only spoiler list. Keeps spoilers out of the normal lane.
  const pool = answerPoolFor(mode);
  const index = (hashDate(date) + MODE_OFFSET[mode] * 17) % pool.length;
  return pool[index];
}

export function msUntilNextLocalMidnight(now: Date = new Date()): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

export function formatCountdown(ms: number): string {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function yesterdayKey(today: string): string {
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return localDateKey(dt);
}
