/**
 * 06-validate — schema checks, duplicate detection, gap analysis.
 * Produces scripts/data/06-validation.json and fails if any errors present.
 */
import { existsSync, statSync } from "fs";
import { banner, log, readJson, writeJson } from "./lib/util";
import type {
  Affiliation,
  Alignment,
  Gender,
  InvincibleCharacter,
  Origin,
  PowerType,
  Species,
  Status,
} from "../lib/types";

const GENDERS: Gender[] = ["Male", "Female", "Non-binary", "N/A"];
const SPECIES: Species[] = [
  "Human",
  "Viltrumite",
  "Half-Viltrumite",
  "Thraxan",
  "Martian",
  "Mantis-Alien",
  "Demon",
  "Unknown-Alien",
];
const ALIGNMENTS: Alignment[] = ["Hero", "Villain", "Anti-hero", "Neutral", "Civilian"];
const AFFILIATIONS: Affiliation[] = [
  "Guardians of the Globe",
  "Teen Team",
  "GDA",
  "Viltrum Empire",
  "Coalition of Planets",
  "Reanimen",
  "Mauler Twins",
  "Invincible Inc.",
  "Independent",
];
const POWER_TYPES: PowerType[] = [
  "Flight",
  "Super Strength",
  "Super Speed",
  "Durability",
  "Energy Projection",
  "Matter Manipulation",
  "Shapeshifting",
  "Technology",
  "Shadow Magic",
  "Regeneration",
  "Enhanced Intellect",
  "None",
];
const ORIGINS: Origin[] = ["Earth", "Viltrum", "Thraxa", "Mars", "Hell", "Talescria", "Unknown"];
const STATUSES: Status[] = ["Alive", "Deceased", "Revived", "Unknown"];

async function main() {
  banner("Phase 06 — Validate");
  const records = await readJson<InvincibleCharacter[]>("scripts/data/05-enriched.json");

  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();

  for (const c of records) {
    const ctx = `[${c.id}]`;
    if (ids.has(c.id)) errors.push(`${ctx} duplicate id`);
    ids.add(c.id);
    if (names.has(c.name.toLowerCase())) warnings.push(`${ctx} duplicate name: ${c.name}`);
    names.add(c.name.toLowerCase());

    if (!GENDERS.includes(c.gender)) errors.push(`${ctx} invalid gender: ${c.gender}`);
    for (const s of c.species)
      if (!SPECIES.includes(s)) errors.push(`${ctx} invalid species: ${s}`);
    if (!ALIGNMENTS.includes(c.alignment)) errors.push(`${ctx} invalid alignment: ${c.alignment}`);
    for (const a of c.affiliation)
      if (!AFFILIATIONS.includes(a)) errors.push(`${ctx} invalid affiliation: ${a}`);
    for (const p of c.powerType)
      if (!POWER_TYPES.includes(p)) errors.push(`${ctx} invalid powerType: ${p}`);
    if (!ORIGINS.includes(c.origin)) errors.push(`${ctx} invalid origin: ${c.origin}`);
    if (!STATUSES.includes(c.status)) errors.push(`${ctx} invalid status: ${c.status}`);
    if (
      typeof c.firstAppearanceSeason === "number" &&
      (c.firstAppearanceSeason < 1 || c.firstAppearanceSeason > 4)
    )
      errors.push(`${ctx} season out of range: ${c.firstAppearanceSeason}`);

    if (c.emojis.length !== 6) warnings.push(`${ctx} emojis length ${c.emojis.length} ≠ 6`);
    for (const q of c.quotes)
      if (q.length > 200) warnings.push(`${ctx} quote > 200 chars: "${q.slice(0, 60)}…"`);
    if (c.powerDescription.length > 140)
      warnings.push(`${ctx} powerDescription ${c.powerDescription.length} chars (target ≤ 120)`);
    if (!c.powerDescription) warnings.push(`${ctx} powerDescription empty`);

    const imgPath = `public/characters/${c.id}.webp`;
    if (!existsSync(imgPath)) errors.push(`${ctx} missing portrait file`);
    else {
      const size = statSync(imgPath).size;
      if (size > 150_000) warnings.push(`${ctx} portrait ${(size / 1024).toFixed(0)} KB > 150 KB`);
    }
  }

  // Distribution checks
  const alignmentCounts = ALIGNMENTS.map((a) => ({
    a,
    n: records.filter((r) => r.alignment === a).length,
  }));
  for (const { a, n } of alignmentCounts) {
    if (n < 2) warnings.push(`distribution: only ${n} character(s) with alignment=${a}`);
  }

  // Canon visibility: surface review items and flag risk of empty normal pool
  const canonCounts = {
    prime_s1_s4: records.filter((r) => r.canonVisibility === "prime_s1_s4").length,
    post_s4_comic_spoiler: records.filter((r) => r.canonVisibility === "post_s4_comic_spoiler").length,
    unknown_review: records.filter((r) => r.canonVisibility === "unknown_review").length,
  };
  for (const r of records) {
    if (r.canonVisibility === "unknown_review") {
      warnings.push(`${r.id} canonVisibility=unknown_review — review S4 vs post-S4 classification`);
    }
  }
  if (canonCounts.prime_s1_s4 < 15) {
    errors.push(
      `normal-mode pool too small: only ${canonCounts.prime_s1_s4} S4-safe characters (need ≥15 for puzzles)`,
    );
  }

  const report = {
    total: records.length,
    errors,
    warnings,
    alignmentCounts,
    speciesCounts: SPECIES.map((s) => ({ s, n: records.filter((r) => r.species.includes(s)).length })),
    canonCounts,
  };
  await writeJson("scripts/data/06-validation.json", report);

  console.log(`\n── Validation ──`);
  console.log(`  records: ${records.length}`);
  console.log(`  errors:   ${errors.length}`);
  console.log(`  warnings: ${warnings.length}`);
  if (errors.length > 0) {
    console.log(`\nERRORS:`);
    for (const e of errors.slice(0, 20)) console.log(`  ✗ ${e}`);
  }
  if (warnings.length > 0 && warnings.length <= 30) {
    console.log(`\nWARNINGS:`);
    for (const w of warnings) console.log(`  · ${w}`);
  }
  if (errors.length > 0) {
    log("06", `FAILED with ${errors.length} errors — emit aborted`);
    process.exit(2);
  }
  log("06", `OK`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
