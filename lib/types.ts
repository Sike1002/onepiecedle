export type Gender = "Male" | "Female" | "Non-binary" | "N/A";

/** Major in-world races / species. Mirrors One Piece's biological tribes. */
export type Race =
  | "Human"
  | "Fishman"
  | "Merfolk"
  | "Mink"
  | "Giant"
  | "Skypiean"
  | "Shandian"
  | "Birkan"
  | "Lunarian"
  | "Dwarf"
  | "Long-Leg Tribe"
  | "Long-Arm Tribe"
  | "Snakeneck Tribe"
  | "Three-Eye Tribe"
  | "Cyborg"
  | "Other";

/** Crew or organizational affiliation. Multi-valued — a character can be ex-Marine and current Revolutionary, etc. */
export type Crew =
  | "Straw Hat Pirates"
  | "Heart Pirates"
  | "Red Hair Pirates"
  | "Whitebeard Pirates"
  | "Beasts Pirates"
  | "Big Mom Pirates"
  | "Blackbeard Pirates"
  | "Roger Pirates"
  | "Rocks Pirates"
  | "Don Quixote Pirates"
  | "Buggy Pirates"
  | "Kid Pirates"
  | "Kuja Pirates"
  | "Sun Pirates"
  | "Cross Guild"
  | "Marines"
  | "World Government"
  | "Cipher Pol"
  | "Seven Warlords"
  | "Revolutionary Army"
  | "Baroque Works"
  | "Wano Samurai"
  | "Independent";

/** Devil Fruit power category. None for non-fruit users. */
export type DevilFruitType =
  | "None"
  | "Paramecia"
  | "Logia"
  | "Zoan"
  | "Mythical Zoan"
  | "Ancient Zoan"
  | "Smile";

export type Haki = "None" | "Observation" | "Armament" | "Conqueror's";

/** Sea / region of birth. */
export type Origin =
  | "East Blue"
  | "West Blue"
  | "North Blue"
  | "South Blue"
  | "Grand Line"
  | "New World"
  | "Sky Island"
  | "Fishman Island"
  | "Wano"
  | "Unknown";

export type Status = "Alive" | "Deceased" | "Unknown";

export type Tier = "Main" | "Recurring" | "Minor";

/** Index of the character's first major arc appearance (1 = Romance Dawn,
 * larger = later in the story). Used for the numeric Classic-mode column
 * with up/down hints. "Manga-only" for characters who never appeared in any
 * pre-current-arc anime episode. */
export type FirstArc = number | "Manga-only";

/** Anime is considered the safe canon. Anything that only happened in the
 * manga past the latest aired anime episode is a spoiler.
 *
 *  - "anime_aired"          — appears in the aired anime; safe for normal modes
 *  - "manga_only_spoiler"   — manga-only beats that would spoil future anime
 *  - "unknown_review"       — classifier unsure; default excluded from normal
 *    modes until a human clears it.
 */
export type CanonVisibility = "anime_aired" | "manga_only_spoiler" | "unknown_review";

/** Curation difficulty tier. 'review' is excluded from any puzzle pool until
 * a human signs off. Players never see this directly. */
export type Difficulty = "easy" | "medium" | "hard" | "review";

export interface OnePieceCharacter {
  id: string;
  name: string;
  fullName: string;
  aliases: string[];
  gender: Gender;
  race: Race[];
  affiliation: Crew[];
  devilFruitType: DevilFruitType;
  /** Optional named Devil Fruit (e.g. "Gomu Gomu no Mi", "Hito Hito no Mi: Model Nika") — for hint surfaces / Devil Fruit mode. */
  devilFruitName: string | null;
  haki: Haki[];
  origin: Origin;
  status: Status;
  /** First arc the character appears in. Smaller = earlier in the story. */
  firstArcNumber: FirstArc;
  quotes: string[];
  emojis: string[];
  /** Short prose describing their abilities — used in Devil Fruit (powers) mode. */
  powerDescription: string;
  portraitUrl: string;
  tier: Tier;
  /** Is this character/data safe to show in normal modes (Classic, Quote,
   * Silhouette, Emoji, Devil Fruit)? Derived from canonVisibility at emit time. */
  safeForNormalModes: boolean;
  canonVisibility: CanonVisibility;
  /** Curation difficulty tier. 'review' is excluded from any puzzle pool. */
  difficulty: Difficulty;
  /** Optional short warning surfaced alongside a spoiler-gated reveal. */
  spoilerWarning?: string | null;
  /** Approximate bounty in berries — surfaced in flavor text only, not used
   * for matching. null for non-pirates / unknown. */
  bounty: number | null;
  sources: string[];
  _needs_review: boolean;
  _reviewNotes: string | null;
}

export type GameMode = "classic" | "quote" | "silhouette" | "emoji" | "devilfruit" | "deepcut";

export type MatchResult = "exact" | "partial" | "none";

export interface NumericMatch {
  result: MatchResult;
  direction?: "up" | "down";
}

export interface ClassicComparison {
  gender: MatchResult;
  race: MatchResult;
  affiliation: MatchResult;
  devilFruitType: MatchResult;
  haki: MatchResult;
  origin: MatchResult;
  status: MatchResult;
  firstArcNumber: NumericMatch;
  solved: boolean;
}
