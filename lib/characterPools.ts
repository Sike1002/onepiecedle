import { characters } from "@/data/characters";
import type { GameMode, OnePieceCharacter } from "./types";

/** Portraits whose source image is opaque (no alpha channel), so the
 * silhouette generator could not produce a clean shape-only mask. Excluded
 * from silhouette mode's answer pool. Populated by `scripts/gen-silhouettes.ts`
 * into `scripts/data/silhouettes-skipped.json`; mirrored here so the runtime
 * doesn't need to read the file. */
const NO_SILHOUETTE: ReadonlySet<string> = new Set<string>([]);

/** Anime-aired characters minus any flagged 'review'. Normal modes (Classic /
 * Quote / Silhouette / Emoji / Devil Fruit) pull both daily answers and
 * typeahead suggestions from this pool only, so nothing manga-only or
 * unreviewed can leak. */
export const normalPool: OnePieceCharacter[] = characters.filter(
  (c) => c.safeForNormalModes && c.difficulty !== "review",
);

/** Silhouette-eligible subset of normalPool — drops any character whose
 * portrait can't be turned into a clean black-on-transparent silhouette. */
export const silhouettePool: OnePieceCharacter[] = normalPool.filter(
  (c) => !NO_SILHOUETTE.has(c.id),
);

/** Manga-only / post-anime pool minus 'review' — Deep-Cut answers draw from
 * here, and the typeahead on the Deep-Cut page allows these too. */
export const deepcutPool: OnePieceCharacter[] = characters.filter(
  (c) => c.canonVisibility === "manga_only_spoiler" && c.difficulty !== "review",
);

/** Full list — only used on the Deep-Cut typeahead (so players there can
 * guess any character, including anime-safe ones). Never used by normal
 * modes. */
export const fullPool: OnePieceCharacter[] = characters;

/** Typeahead pool for a given game mode. Deep-Cut uses the full pool so
 * players can guess across canon boundaries; all other modes use normalPool
 * only so the suggestion list itself doesn't leak spoiler names. */
export function typeaheadPoolFor(mode: GameMode): OnePieceCharacter[] {
  return mode === "deepcut" ? fullPool : normalPool;
}

/** Answer pool for a given game mode — Deep-Cut is spoiler-only, Silhouette
 * is normalPool minus characters without a generated silhouette asset, and
 * everything else is the anime-safe normalPool. */
export function answerPoolFor(mode: GameMode): OnePieceCharacter[] {
  if (mode === "deepcut") return deepcutPool;
  if (mode === "silhouette") return silhouettePool;
  return normalPool;
}
