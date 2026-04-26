"use client";

import { useMemo } from "react";
import Fuse from "fuse.js";
import type { OnePieceCharacter } from "./types";

/** Shared typeahead hook — Fuse fuzzy-match on name + aliases, excluding
 * already-guessed ids. */
export function useTypeahead(
  query: string,
  excludeIds: Set<string>,
  pool: OnePieceCharacter[],
  limit: number = 6,
): OnePieceCharacter[] {
  const fuse = useMemo(
    () => new Fuse(pool, { keys: ["name", "aliases"], threshold: 0.35, includeScore: true }),
    [pool],
  );
  return useMemo(() => {
    if (!query.trim()) return [];
    return fuse
      .search(query)
      .filter((r) => !excludeIds.has(r.item.id))
      .slice(0, limit)
      .map((r) => r.item);
  }, [query, fuse, excludeIds, limit]);
}
