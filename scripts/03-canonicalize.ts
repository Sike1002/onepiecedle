/**
 * 03-canonicalize — map wiki values into the project's enum schema.
 * Output: scripts/data/03-canonical.json + scripts/data/03-unmapped.json
 */
import { banner, log, readJson, writeJson } from "./lib/util";
import {
  mapAffiliation,
  mapAlignment,
  mapGender,
  mapOrigin,
  mapPowers,
  mapSpecies,
  mapStatus,
} from "./lib/mappings";
import type { InvincibleCharacter, Tier } from "../lib/types";

interface RawRecord {
  id: string;
  name: string;
  wiki: string;
  pageTitle: string;
  pageUrl: string;
  tier: Tier;
  infobox: Record<string, string>;
  wikitextSnippet: string;
  thumbnailUrl: string | null;
}

type PartialCharacter = Omit<InvincibleCharacter, "quotes" | "emojis" | "powerDescription" | "portraitUrl" | "tier"> & {
  tier: Tier;
  rawThumbnailUrl: string | null;
  _debugInfobox: Record<string, string>;
};

function pick(infobox: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    if (infobox[k]) return infobox[k];
  }
  return "";
}

function parseSeason(raw: string): number | "Comics-only" {
  if (!raw) return "Comics-only";
  // TV episode code like "1x02", "S1E02", or "Season 1".
  const mX = raw.match(/\b([1-4])x\d+\b/i);
  if (mX) return Number(mX[1]);
  const mS = raw.match(/season\s*([1-4])/i);
  if (mS) return Number(mS[1]);
  const mSE = raw.match(/\bs([1-4])(?:e\d+)?\b/i);
  if (mSE) return Number(mSE[1]);
  if (/comic/i.test(raw)) return "Comics-only";
  const num = raw.match(/^([1-4])$/);
  if (num) return Number(num[1]);
  return "Comics-only";
}

function parseOrigin(born: string, home: string): string {
  // Look for an explicit "Planet: X" first.
  const planetMatch = (home + " " + born).match(/Planet:\s*([A-Za-z]+)/i);
  if (planetMatch) return planetMatch[1];
  // Fallback to named worlds in either field.
  const combined = `${born} ${home}`.toLowerCase();
  if (/viltrum/.test(combined)) return "Viltrum";
  if (/thraxa/.test(combined)) return "Thraxa";
  if (/\bmars\b|martian/.test(combined)) return "Mars";
  if (/hell|infernal/.test(combined)) return "Hell";
  if (/talescria|unopa/.test(combined)) return "Talescria";
  if (/earth|chicago|usa|united states|america/.test(combined)) return "Earth";
  return "";
}

/** Clean an "other names" / "aliases" field into a compact array. */
function parseAliases(
  otherNames: string,
  fullName: string,
  displayName: string,
): string[] {
  if (!otherNames) {
    if (fullName && fullName !== displayName) return [fullName];
    return [];
  }
  const pieces = otherNames
    .split(/[,;]|\s·\s/)
    .map((s) => s.trim())
    // Strip labels and parentheticals.
    .map((s) =>
      s
        .replace(/^(Codenames?|Nicknames?|Other Names?|Titles?|Aliases?):?/i, "")
        .replace(/\(.*?\)/g, "")
        .replace(/[^\x00-\x7F]+/g, "") // drop non-ASCII (CJK, ligatures)
        .replace(/\s{2,}/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .filter((s) => s.toLowerCase() !== displayName.toLowerCase())
    .filter((s) => s.length >= 2 && s.length <= 40);
  const unique = Array.from(new Set(pieces));
  if (fullName && fullName !== displayName && !unique.includes(fullName)) unique.unshift(fullName);
  return unique.slice(0, 5);
}

/** Clean fullName — strip parentheticals, CJK characters, and "(birth name)" suffixes. */
function cleanFullName(raw: string, fallback: string): string {
  if (!raw) return fallback;
  const cleaned = raw
    .replace(/\(.*?\)/g, "")
    .replace(/[^\x00-\x7F]+/g, "") // drop non-ASCII
    .replace(/\s{2,}/g, " ")
    .trim()
    .split(/,/)[0]
    .trim();
  return cleaned || fallback;
}

// deriveAliases is now handled by parseAliases(otherNames, fullName, displayName) directly.

function canonicalize(rec: RawRecord): { out: PartialCharacter; unmapped: Record<string, string[]> } {
  const ib = rec.infobox;
  const unmapped: Record<string, string[]> = {};
  const notes: string[] = [];

  const genderRaw = pick(ib, ["gender", "sex"]);
  const gender = mapGender(genderRaw);
  if (!gender.mapped && genderRaw) (unmapped.gender ||= []).push(genderRaw);
  if (!genderRaw) notes.push("gender missing from infobox");

  const speciesRaw = pick(ib, ["species", "race"]);
  const species = mapSpecies(speciesRaw);
  if (!species.mapped && speciesRaw) (unmapped.species ||= []).push(speciesRaw);
  if (!speciesRaw) notes.push("species missing from infobox");
  // Infer Viltrumite from affiliation if species was missing/unmapped.
  const affiliationRawPeek = pick(ib, ["affiliation", "team", "teams", "organization", "allies", "group"]);
  if (
    (!speciesRaw || !species.mapped) &&
    /viltrum\s*empire/i.test(affiliationRawPeek)
  ) {
    species.value = ["Viltrumite"];
    species.mapped = true;
  }

  // Note: the Invincible wiki infobox has no alignment field; enrichment is authoritative.
  const alignmentRaw = pick(ib, ["alignment", "allegiance", "side"]);
  const alignment = mapAlignment(alignmentRaw);
  if (!alignment.mapped && alignmentRaw) (unmapped.alignment ||= []).push(alignmentRaw);

  const affiliationRaw = affiliationRawPeek;
  const affiliation = mapAffiliation(affiliationRaw);
  if (affiliation.unmapped.length) unmapped.affiliation = affiliation.unmapped;

  // Wiki infobox has no powers field either; enrichment carries the authoritative list.
  const powersRaw = pick(ib, ["powers", "abilities", "power_type", "skills"]);
  const powers = mapPowers(powersRaw);
  if (powers.unmapped.length) unmapped.powers = powers.unmapped;

  const originExplicit = pick(ib, ["origin", "birthplace", "homeworld", "home_planet", "homeland"]);
  const originDerived = originExplicit || parseOrigin(pick(ib, ["born"]), pick(ib, ["home"]));
  const origin = mapOrigin(originDerived);
  if (!origin.mapped && originDerived) (unmapped.origin ||= []).push(originDerived);
  if (!originDerived) notes.push("origin could not be derived — defaulted to Unknown");

  // For species with a canonical homeworld, prefer that over the scraped origin
  // (wiki "home" often lists current residence, not origin — Viltrumites living on Earth).
  if (species.value.includes("Viltrumite") && !species.value.includes("Half-Viltrumite")) {
    origin.value = "Viltrum";
  } else if (species.value.includes("Thraxan")) {
    origin.value = "Thraxa";
  } else if (species.value.includes("Martian")) {
    origin.value = "Mars";
  } else if (species.value.includes("Demon")) {
    origin.value = "Hell";
  } else if (species.value.includes("Mantis-Alien")) {
    origin.value = "Talescria";
  } else if (origin.value === "Unknown" && species.value.length === 1 && species.value[0] === "Human") {
    // Humans default to Earth if nothing else found.
    origin.value = "Earth";
  }

  const statusRaw = pick(ib, ["status", "state", "living_status"]);
  const status = mapStatus(statusRaw);
  if (!status.mapped && statusRaw) (unmapped.status ||= []).push(statusRaw);

  const firstAppearanceRaw = pick(ib, [
    "first_appearance",
    "only_appearance",
    "first",
    "debut",
    "season",
  ]);
  const firstAppearanceSeason = parseSeason(firstAppearanceRaw);
  if (firstAppearanceSeason === "Comics-only" && !firstAppearanceRaw)
    notes.push("first-appearance defaulted to Comics-only (missing)");

  const fullNameRaw = pick(ib, ["real_name", "full_name", "birth_name", "name"]) || rec.name;
  const fullName = cleanFullName(fullNameRaw, rec.name);
  const aliases = parseAliases(pick(ib, ["other_names", "aliases", "also_known_as", "alias"]), fullName, rec.name);

  const needsReview =
    Object.keys(unmapped).length > 0 || notes.length > 0 || !species.mapped || !gender.mapped;

  const out: PartialCharacter = {
    id: rec.id,
    name: rec.name,
    fullName,
    aliases,
    gender: gender.value,
    species: species.value,
    alignment: alignment.value,
    affiliation: affiliation.values,
    powerType: powers.values,
    origin: origin.value,
    status: status.value,
    firstAppearanceSeason,
    tier: rec.tier,
    sources: [rec.pageUrl],
    _needs_review: needsReview,
    _reviewNotes: notes.length > 0 ? notes.join("; ") : null,
    rawThumbnailUrl: rec.thumbnailUrl,
    _debugInfobox: rec.infobox,
  };
  return { out, unmapped };
}

async function main() {
  banner("Phase 03 — Canonicalize");
  const raw = await readJson<RawRecord[]>("scripts/data/02-raw.json");

  const canonical: PartialCharacter[] = [];
  const allUnmapped: Record<string, Record<string, string[]>> = {};
  let fullyMapped = 0;

  for (const r of raw) {
    const { out, unmapped } = canonicalize(r);
    canonical.push(out);
    if (Object.keys(unmapped).length > 0) allUnmapped[r.id] = unmapped;
    if (!out._needs_review) fullyMapped++;
  }

  await writeJson("scripts/data/03-canonical.json", canonical);
  await writeJson("scripts/data/03-unmapped.json", allUnmapped);

  log("03", `canonicalized ${canonical.length} records`);
  log("03", `  fully mapped: ${fullyMapped}`);
  log("03", `  needs review: ${canonical.length - fullyMapped}`);
  const unmappedCount = Object.keys(allUnmapped).length;
  if (unmappedCount > canonical.length * 0.1) {
    log("03", `⚠️  MORE THAN 10% UNMAPPED — review scripts/data/03-unmapped.json before proceeding`);
  }

  console.log("\n── Per-character review flags ──");
  for (const c of canonical) {
    const flag = c._needs_review ? "⚠️" : "✓";
    console.log(`  ${flag} ${c.id.padEnd(22)} ${c.species.join("/")} / ${c.alignment} / ${c.powerType.join("+")}`);
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
