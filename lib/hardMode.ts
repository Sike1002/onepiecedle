import { hashDate } from "./dailyPuzzle";
import { storageGet, storageSet } from "./storage";
import type { ClassicColumnKey } from "./compareCharacter";

const KEY = "onepiecedle.hardMode";
const WINS_KEY = "onepiecedle.hardWins";
/** Number of hard-mode wins required to earn the Pirate King badge. */
export const BADGE_THRESHOLD = 3;

export function isHardModeOn(): boolean {
  return storageGet<boolean>(KEY, false);
}

export function setHardMode(on: boolean): void {
  storageSet<boolean>(KEY, on);
}

/** Lifetime count of hard-mode wins (across any mode). Used to unlock the
 * small Pirate King badge on the landing page. */
export function getHardWins(): number {
  return storageGet<number>(WINS_KEY, 0);
}

export function bumpHardWins(): number {
  const next = getHardWins() + 1;
  storageSet<number>(WINS_KEY, next);
  return next;
}

export function hasBadge(): boolean {
  return getHardWins() >= BADGE_THRESHOLD;
}

/** Deterministically pick 3 of the 8 classic columns to hide for a given date.
 * Same hidden columns globally per day so shares stay comparable. */
export function hiddenColumns(date: Date = new Date()): Set<ClassicColumnKey> {
  const allKeys: ClassicColumnKey[] = [
    "gender",
    "race",
    "affiliation",
    "devilFruitType",
    "haki",
    "origin",
    "status",
    "firstArcNumber",
  ];
  const base = hashDate(date);
  // Derive an ordering by pseudo-random scoring each column from the date hash.
  const ranked = allKeys
    .map((k, i) => ({ k, score: ((base >> i) ^ (base * (i + 7))) & 0xffff }))
    .sort((a, b) => a.score - b.score);
  return new Set(ranked.slice(0, 3).map((r) => r.k));
}
