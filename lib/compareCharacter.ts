import type {
  ClassicComparison,
  FirstArc,
  MatchResult,
  NumericMatch,
  OnePieceCharacter,
} from "./types";

function compareArrays<T extends string>(a: T[], b: T[]): MatchResult {
  const as = [...a].sort();
  const bs = [...b].sort();
  const overlap = as.filter((x) => bs.includes(x));
  if (overlap.length === as.length && overlap.length === bs.length && as.length === bs.length) {
    return "exact";
  }
  if (overlap.length > 0) return "partial";
  return "none";
}

function compareNumeric(g: FirstArc, a: FirstArc): NumericMatch {
  if (g === a) return { result: "exact" };
  if (typeof g !== "number" || typeof a !== "number") return { result: "none" };
  return { result: "none", direction: a > g ? "up" : "down" };
}

export function compareClassic(
  guess: OnePieceCharacter,
  answer: OnePieceCharacter,
): ClassicComparison {
  return {
    gender: guess.gender === answer.gender ? "exact" : "none",
    race: compareArrays(guess.race, answer.race),
    affiliation: compareArrays(guess.affiliation, answer.affiliation),
    devilFruitType: guess.devilFruitType === answer.devilFruitType ? "exact" : "none",
    haki: compareArrays(guess.haki, answer.haki),
    origin: guess.origin === answer.origin ? "exact" : "none",
    status: guess.status === answer.status ? "exact" : "none",
    firstArcNumber: compareNumeric(guess.firstArcNumber, answer.firstArcNumber),
    solved: guess.id === answer.id,
  };
}

export const CLASSIC_COLUMNS = [
  { key: "gender", label: "Gender" },
  { key: "race", label: "Race" },
  { key: "affiliation", label: "Crew" },
  { key: "devilFruitType", label: "DF Type" },
  { key: "haki", label: "Haki" },
  { key: "origin", label: "Origin" },
  { key: "status", label: "Status" },
  { key: "firstArcNumber", label: "Arc" },
] as const;

export type ClassicColumnKey = (typeof CLASSIC_COLUMNS)[number]["key"];
