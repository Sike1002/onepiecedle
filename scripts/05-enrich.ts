/**
 * 05-enrich — merge hand-curated quotes/emojis/power descriptions onto canonical records.
 * Output: scripts/data/05-enriched.json
 */
import { banner, log, readJson, writeJson } from "./lib/util";
import { ENRICHMENT } from "./lib/enrichment";
import type { CanonVisibility, Difficulty, InvincibleCharacter, Tier } from "../lib/types";

/** Default canon visibility by tier when enrichment doesn't override it.
 * Main/Recurring records from the comic wiki need explicit review before
 * normal-mode exposure; tier alone is not enough to prove Prime-safe facts. */
function defaultCanonByTier(tier: Tier, sources: string[]): CanonVisibility {
  if (
    tier !== "Minor" &&
    sources.some((source) => source.includes("comic-invincible.fandom.com"))
  ) {
    return "unknown_review";
  }
  return tier === "Minor" ? "post_s4_comic_spoiler" : "prime_s1_s4";
}

/** Default difficulty by tier — Main characters are widely recognized,
 * Recurring takes some attention, Minor is deep comic territory. */
function defaultDifficultyByTier(tier: Tier): Difficulty {
  if (tier === "Main") return "easy";
  if (tier === "Recurring") return "medium";
  return "hard";
}

interface PartialCharacter extends Omit<InvincibleCharacter, "quotes" | "emojis" | "powerDescription" | "portraitUrl"> {
  rawThumbnailUrl?: string | null;
  _debugInfobox?: Record<string, string>;
}

async function main() {
  banner("Phase 05 — Enrich");
  const canonical = await readJson<PartialCharacter[]>("scripts/data/03-canonical.json");

  const enriched: InvincibleCharacter[] = [];
  let missing = 0;
  const addedNotes: Record<string, string[]> = {};

  for (const c of canonical) {
    const e = ENRICHMENT[c.id];
    const notes: string[] = c._reviewNotes ? [c._reviewNotes] : [];
    // Enrichment is AUTHORITATIVE on alignment and powerType (wiki has neither).
    const alignment = e?.alignment ?? c.alignment;
    const powerType = e?.powerType ?? c.powerType;
    const species = e?.speciesOverride ?? c.species;
    const status = e?.statusOverride ?? c.status;
    // If species was overridden, re-derive origin from the new species.
    let origin = c.origin;
    if (e?.speciesOverride) {
      if (species.includes("Martian")) origin = "Mars";
      else if (species.includes("Thraxan") && !species.includes("Human")) origin = "Thraxa";
      else if (species.includes("Demon")) origin = "Hell";
      else if (species.includes("Mantis-Alien")) origin = "Talescria";
      else if (
        species.includes("Viltrumite") &&
        !species.includes("Half-Viltrumite") &&
        !species.includes("Human")
      )
        origin = "Viltrum";
    }
    if (!e) notes.push("no enrichment — alignment/powers defaulted from canonicalizer");
    if (e?.speciesOverride)
      notes.push(`species overridden by enrichment: ${e.speciesOverride.join("+")}`);
    if (e?.statusOverride) notes.push(`status overridden by enrichment: ${e.statusOverride}`);

    const canonVisibility: CanonVisibility =
      e?.canonVisibility ?? defaultCanonByTier(c.tier, c.sources);
    const safeForNormalModes = canonVisibility === "prime_s1_s4";
    if (canonVisibility === "unknown_review")
      notes.push("canonVisibility=unknown_review → excluded from normal modes until classified");
    if (e?.canonVisibility)
      notes.push(`canonVisibility overridden by enrichment: ${e.canonVisibility}`);

    const difficulty: Difficulty = e?.difficulty ?? defaultDifficultyByTier(c.tier);
    if (difficulty === "review")
      notes.push("difficulty=review → excluded from every puzzle pool until cleared");
    if (e?.difficulty)
      notes.push(`difficulty overridden by enrichment: ${e.difficulty}`);

    const record: InvincibleCharacter = {
      id: c.id,
      name: c.name,
      fullName: c.fullName,
      aliases: c.aliases,
      gender: c.gender,
      species,
      alignment,
      affiliation: c.affiliation,
      powerType,
      origin,
      status,
      firstAppearanceSeason: c.firstAppearanceSeason,
      quotes: e?.quotes ?? [],
      emojis: e?.emojis ?? ["❓", "❓", "❓", "❓", "❓", "❓"],
      powerDescription: e?.powerDescription ?? "",
      portraitUrl: `/characters/${c.id}.webp`,
      tier: c.tier,
      canonVisibility,
      safeForNormalModes,
      difficulty,
      spoilerWarning: e?.spoilerWarning ?? null,
      sources: c.sources,
      _needs_review: true,
      _reviewNotes: notes.length > 0 ? notes.join("; ") : null,
    };
    if (!e) {
      missing++;
      addedNotes[c.id] = ["no enrichment data"];
    }
    enriched.push(record);
  }

  await writeJson("scripts/data/05-enriched.json", enriched);
  log("05", `enriched ${enriched.length} records (${missing} had no enrichment data)`);
  console.log("\n── Enrichment summary ──");
  for (const r of enriched) {
    const e = ENRICHMENT[r.id];
    const tag = e ? "✓" : "⚠️";
    console.log(`  ${tag} ${r.id.padEnd(22)} ${r.alignment.padEnd(10)} ${r.powerType.join("+")}`);
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
