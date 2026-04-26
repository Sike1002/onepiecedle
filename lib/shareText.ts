import type { GameMode } from "./types";

/** Public URL of the deployed game. Swap when the real domain ships. */
export const APP_URL = "https://onepiecedle.app";

/** Day-number epoch. The number printed in the share text is the integer
 * days since this launch date (inclusive). Picked once; do not change —
 * it would renumber every share grid in existing screenshots. */
const EPOCH_Y = 2026;
const EPOCH_M = 1; // January
const EPOCH_D = 1;

const MODE_LABEL: Record<GameMode, string> = {
  classic: "Classic",
  quote: "Quote",
  silhouette: "Silhouette",
  emoji: "Emoji",
  devilfruit: "Devil Fruit",
  deepcut: "Deep-Cut",
};

export function dayNumber(date: Date = new Date()): number {
  const epoch = new Date(EPOCH_Y, EPOCH_M - 1, EPOCH_D);
  epoch.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const ms = target.getTime() - epoch.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
}

export interface ShareTextInput {
  mode: GameMode;
  /** Target date for the share (archive day or today). */
  date: Date;
  /** Player's guess count when they solved. */
  guesses: number;
  /** Emoji-grid body (e.g. '🟩🟨🟥' or '⬛⬛🟨'). Empty string for modes
   * that don't have a grid (Powers). */
  grid: string;
  /** Optional modifier tags appended to the title line, e.g. ["Pirate King", "Archive"]. */
  modifiers?: string[];
  /** Spoiler-free: pass `true` when this text might be seen publicly; we
   * still never include character name, only mode + counts. */
  spoilerFree?: boolean;
}

/** Build the canonical shareable text for all modes.
 *
 *   Onepiecedle Classic · Pirate King — Day 114  (Apr 24)
 *   Solved in 4 guesses
 *   🟥🟨🟥⬛🟨⬛🟩⬛
 *   🟩🟩🟩⬛🟩⬛🟩⬛
 *
 *   https://onepiecedle.app/classic
 *
 * The text never contains the character name or any other spoiler —
 * safe to paste anywhere.
 */
export function buildShareText(input: ShareTextInput): string {
  const { mode, date, guesses, grid, modifiers = [] } = input;
  const label = MODE_LABEL[mode];
  const tagSuffix = modifiers.length > 0 ? " · " + modifiers.join(" · ") : "";
  const day = dayNumber(date);
  const short = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const header = `Onepiecedle ${label}${tagSuffix} — Day ${day}  (${short})`;
  const body = `Solved in ${guesses} ${guesses === 1 ? "guess" : "guesses"}`;
  const gridBlock = grid ? `\n${grid}` : "";
  const url = `${APP_URL}/${mode === "deepcut" ? "deepcut" : mode}`;
  return `${header}\n${body}${gridBlock}\n\n${url}`;
}
