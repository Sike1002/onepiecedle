/**
 * 01-discover — list all character pages across both Fandom wikis.
 *
 * Output: scripts/data/01-pages.json (all pages) + 01-pages-filtered.json (25 Main-tier).
 */
import type { Tier } from "../lib/types";
import { banner, cachedFetchJson, log, writeJson } from "./lib/util";

const WIKIS = ["amazon-invincible.fandom.com", "comic-invincible.fandom.com"];

export interface Target {
  id: string;
  name: string;
  wiki: string;
  pageTitle: string;
  fallbackPageTitle?: string;
  tier: Tier;
}

/** Phase A: the 25 Main-tier characters. */
export const MAIN_TIER: Target[] = (<Omit<Target, "tier">[]>[
  { id: "mark-grayson", name: "Invincible", wiki: "amazon-invincible.fandom.com", pageTitle: "Mark_Grayson", fallbackPageTitle: "Invincible" },
  { id: "omni-man", name: "Omni-Man", wiki: "amazon-invincible.fandom.com", pageTitle: "Nolan_Grayson", fallbackPageTitle: "Omni-Man" },
  { id: "debbie-grayson", name: "Debbie Grayson", wiki: "amazon-invincible.fandom.com", pageTitle: "Debbie_Grayson" },
  { id: "atom-eve", name: "Atom Eve", wiki: "amazon-invincible.fandom.com", pageTitle: "Samantha_Eve_Wilkins", fallbackPageTitle: "Atom_Eve" },
  { id: "cecil-stedman", name: "Cecil Stedman", wiki: "amazon-invincible.fandom.com", pageTitle: "Cecil_Stedman" },
  { id: "robot", name: "Robot", wiki: "amazon-invincible.fandom.com", pageTitle: "Rudolph_Conners", fallbackPageTitle: "Robot" },
  { id: "rex-splode", name: "Rex Splode", wiki: "amazon-invincible.fandom.com", pageTitle: "Rex_Sloan", fallbackPageTitle: "Rex_Splode" },
  { id: "dupli-kate", name: "Dupli-Kate", wiki: "amazon-invincible.fandom.com", pageTitle: "Kate_Cha", fallbackPageTitle: "Dupli-Kate" },
  { id: "monster-girl", name: "Monster Girl", wiki: "amazon-invincible.fandom.com", pageTitle: "Amanda", fallbackPageTitle: "Monster_Girl" },
  { id: "bulletproof", name: "Bulletproof", wiki: "amazon-invincible.fandom.com", pageTitle: "Zandale_Randolph", fallbackPageTitle: "Bulletproof" },
  { id: "the-immortal", name: "The Immortal", wiki: "amazon-invincible.fandom.com", pageTitle: "The_Immortal" },
  { id: "allen-the-alien", name: "Allen the Alien", wiki: "amazon-invincible.fandom.com", pageTitle: "Allen_the_Alien" },
  { id: "battle-beast", name: "Battle Beast", wiki: "amazon-invincible.fandom.com", pageTitle: "Battle_Beast" },
  { id: "oliver-grayson", name: "Oliver Grayson", wiki: "amazon-invincible.fandom.com", pageTitle: "Oliver_Grayson" },
  { id: "anissa", name: "Anissa", wiki: "amazon-invincible.fandom.com", pageTitle: "Anissa" },
  { id: "conquest", name: "Conquest", wiki: "amazon-invincible.fandom.com", pageTitle: "Conquest" },
  { id: "thragg", name: "Thragg", wiki: "amazon-invincible.fandom.com", pageTitle: "Thragg" },
  { id: "thaedus", name: "Thaedus", wiki: "amazon-invincible.fandom.com", pageTitle: "Thaedus" },
  { id: "kregg", name: "Kregg", wiki: "amazon-invincible.fandom.com", pageTitle: "Kregg" },
  { id: "lucan", name: "Lucan", wiki: "amazon-invincible.fandom.com", pageTitle: "Lucan" },
  { id: "vidor", name: "Vidor", wiki: "amazon-invincible.fandom.com", pageTitle: "Vidor" },
  { id: "shapesmith", name: "Shapesmith", wiki: "amazon-invincible.fandom.com", pageTitle: "Rus_Livingston", fallbackPageTitle: "Shapesmith" },
  { id: "angstrom-levy", name: "Angstrom Levy", wiki: "amazon-invincible.fandom.com", pageTitle: "Angstrom_Levy" },
  { id: "damien-darkblood", name: "Damien Darkblood", wiki: "amazon-invincible.fandom.com", pageTitle: "Damien_Darkblood" },
  { id: "donald-ferguson", name: "Donald Ferguson", wiki: "amazon-invincible.fandom.com", pageTitle: "Donald_Ferguson" },
]).map((t) => ({ ...t, tier: "Main" }));

/** Phase B: the 25 Recurring-tier characters. */
export const RECURRING_TIER: Target[] = (<Omit<Target, "tier">[]>[
  { id: "darkwing-ii", name: "Darkwing II", wiki: "amazon-invincible.fandom.com", pageTitle: "Darkwing_II" },
  { id: "titan", name: "Titan", wiki: "amazon-invincible.fandom.com", pageTitle: "Titan" },
  { id: "mauler-twins", name: "Mauler Twins", wiki: "amazon-invincible.fandom.com", pageTitle: "Mauler_Twins" },
  { id: "powerplex", name: "Powerplex", wiki: "amazon-invincible.fandom.com", pageTitle: "Powerplex" },
  { id: "machine-head", name: "Machine Head", wiki: "amazon-invincible.fandom.com", pageTitle: "Machine_Head" },
  { id: "isotope", name: "Isotope", wiki: "amazon-invincible.fandom.com", pageTitle: "Isotope" },
  { id: "black-samson", name: "Black Samson", wiki: "amazon-invincible.fandom.com", pageTitle: "Black_Samson" },
  { id: "shrinking-rae", name: "Shrinking Rae", wiki: "amazon-invincible.fandom.com", pageTitle: "Shrinking_Rae" },
  { id: "red-rush", name: "Red Rush", wiki: "amazon-invincible.fandom.com", pageTitle: "Red_Rush" },
  { id: "war-woman", name: "War Woman", wiki: "amazon-invincible.fandom.com", pageTitle: "War_Woman" },
  { id: "martian-man", name: "Martian Man", wiki: "amazon-invincible.fandom.com", pageTitle: "Martian_Man" },
  { id: "art-rosenbaum", name: "Art Rosenbaum", wiki: "amazon-invincible.fandom.com", pageTitle: "Art_Rosenbaum" },
  { id: "william-clockwell", name: "William Clockwell", wiki: "amazon-invincible.fandom.com", pageTitle: "William_Clockwell" },
  { id: "amber-bennett", name: "Amber Bennett", wiki: "amazon-invincible.fandom.com", pageTitle: "Amber_Bennett" },
  { id: "rick-sheridan", name: "Rick Sheridan", wiki: "amazon-invincible.fandom.com", pageTitle: "Rick_Sheridan" },
  { id: "da-sinclair", name: "D.A. Sinclair", wiki: "amazon-invincible.fandom.com", pageTitle: "D.A._Sinclair" },
  { id: "aquarus", name: "Aquarus", wiki: "amazon-invincible.fandom.com", pageTitle: "Aquarus" },
  { id: "dinosaurus", name: "Dinosaurus", wiki: "amazon-invincible.fandom.com", pageTitle: "Dinosaurus" },
  { id: "kid-thor", name: "Kid Thor", wiki: "amazon-invincible.fandom.com", pageTitle: "Kid_Thor" },
  { id: "fightmaster", name: "Fightmaster", wiki: "amazon-invincible.fandom.com", pageTitle: "Fightmaster" },
  { id: "embrace", name: "Embrace", wiki: "amazon-invincible.fandom.com", pageTitle: "Embrace" },
  { id: "tether-tyrant", name: "Tether Tyrant", wiki: "amazon-invincible.fandom.com", pageTitle: "Tether_Tyrant" },
  { id: "furnace", name: "Furnace", wiki: "amazon-invincible.fandom.com", pageTitle: "Furnace" },
  { id: "magnattack", name: "Magnattack", wiki: "amazon-invincible.fandom.com", pageTitle: "Magnattack" },
  { id: "doc-seismic", name: "Doc Seismic", wiki: "amazon-invincible.fandom.com", pageTitle: "Doc_Seismic" },
]).map((t) => ({ ...t, tier: "Recurring" }));

/** Phase C: 30 Minor-tier deep-cut characters, mostly comic-only. */
export const MINOR_TIER: Target[] = (<Omit<Target, "tier">[]>[
  { id: "terra-grayson", name: "Terra Grayson", wiki: "comic-invincible.fandom.com", pageTitle: "Terra_Grayson" },
  { id: "markus-murphy", name: "Markus Murphy", wiki: "comic-invincible.fandom.com", pageTitle: "Markus_Murphy" },
  { id: "brit", name: "Brit", wiki: "amazon-invincible.fandom.com", pageTitle: "Brit" },
  { id: "captain-cosmic", name: "Captain Cosmic", wiki: "comic-invincible.fandom.com", pageTitle: "Captain_Cosmic" },
  { id: "bi-plane", name: "Bi-Plane", wiki: "amazon-invincible.fandom.com", pageTitle: "Bi-Plane" },
  { id: "best-tiger", name: "Best Tiger", wiki: "amazon-invincible.fandom.com", pageTitle: "Best_Tiger" },
  { id: "april-howsam", name: "April Howsam", wiki: "amazon-invincible.fandom.com", pageTitle: "April_Howsam" },
  { id: "ann-stevens", name: "Ann Stevens", wiki: "comic-invincible.fandom.com", pageTitle: "Ann_Samantha_Stevens" },
  { id: "lord-argall", name: "Lord Argall", wiki: "comic-invincible.fandom.com", pageTitle: "Lord_Argall" },
  { id: "thula", name: "Thula", wiki: "amazon-invincible.fandom.com", pageTitle: "Thula" },
  { id: "aquaria", name: "Aquaria", wiki: "amazon-invincible.fandom.com", pageTitle: "Aquaria" },
  { id: "andressa", name: "Andressa", wiki: "amazon-invincible.fandom.com", pageTitle: "Andressa" },
  { id: "kursk", name: "Kursk", wiki: "amazon-invincible.fandom.com", pageTitle: "Kursk" },
  { id: "elephant", name: "The Elephant", wiki: "comic-invincible.fandom.com", pageTitle: "Elephant" },
  { id: "big-brain", name: "Big Brain", wiki: "comic-invincible.fandom.com", pageTitle: "Big_Brain" },
  { id: "bolt", name: "Bolt", wiki: "comic-invincible.fandom.com", pageTitle: "Bolt" },
  { id: "brain-boy", name: "Brain Boy", wiki: "comic-invincible.fandom.com", pageTitle: "Brain_Boy" },
  { id: "chronodile", name: "Chronodile", wiki: "comic-invincible.fandom.com", pageTitle: "Chronodile" },
  { id: "gravitator", name: "Gravitator", wiki: "comic-invincible.fandom.com", pageTitle: "Gravitator" },
  { id: "green-ghost", name: "Green Ghost", wiki: "comic-invincible.fandom.com", pageTitle: "Green_Ghost" },
  { id: "gridlock", name: "Gridlock", wiki: "comic-invincible.fandom.com", pageTitle: "Gridlock" },
  { id: "iguana", name: "Iguana", wiki: "comic-invincible.fandom.com", pageTitle: "Iguana" },
  { id: "kaboomerang", name: "Kaboomerang", wiki: "comic-invincible.fandom.com", pageTitle: "Kaboomerang" },
  { id: "killcannon", name: "Killcannon", wiki: "comic-invincible.fandom.com", pageTitle: "Killcannon" },
  { id: "kinetic", name: "Kinetic", wiki: "comic-invincible.fandom.com", pageTitle: "Kinetic" },
  { id: "king-lizard", name: "King Lizard", wiki: "comic-invincible.fandom.com", pageTitle: "King_Lizard" },
  { id: "komodo-dragon", name: "Komodo Dragon", wiki: "comic-invincible.fandom.com", pageTitle: "Komodo_Dragon" },
  { id: "magmaniac", name: "Magmaniac", wiki: "comic-invincible.fandom.com", pageTitle: "Magmaniac" },
  { id: "mastermind", name: "Mastermind", wiki: "comic-invincible.fandom.com", pageTitle: "Mastermind" },
  { id: "adam-wilkins", name: "Adam Wilkins", wiki: "comic-invincible.fandom.com", pageTitle: "Adam_Wilkins" },
]).map((t) => ({ ...t, tier: "Minor" }));

export const TARGETS: Target[] = [...MAIN_TIER, ...RECURRING_TIER, ...MINOR_TIER];

interface CategoryResponse {
  query: { categorymembers: Array<{ pageid: number; title: string }> };
  continue?: { cmcontinue: string };
}

async function listCategory(wiki: string): Promise<Array<{ title: string; wiki: string }>> {
  const all: Array<{ title: string; wiki: string }> = [];
  let cmcontinue = "";
  let page = 0;
  while (true) {
    page++;
    const url = `https://${wiki}/api.php?action=query&list=categorymembers&cmtitle=Category:Characters&cmlimit=500&format=json${cmcontinue ? `&cmcontinue=${encodeURIComponent(cmcontinue)}` : ""}`;
    const res = await cachedFetchJson<CategoryResponse>(url, `${wiki}/category`, `characters-page-${page}`);
    for (const p of res.query.categorymembers) all.push({ title: p.title, wiki });
    if (!res.continue?.cmcontinue) break;
    cmcontinue = res.continue.cmcontinue;
    if (page > 5) break; // safety
  }
  return all;
}

async function main() {
  banner("Phase 01 — Discover");
  const all: Array<{ title: string; wiki: string }> = [];
  for (const wiki of WIKIS) {
    try {
      const pages = await listCategory(wiki);
      log("01", `${wiki}: ${pages.length} pages`);
      all.push(...pages);
    } catch (err) {
      log("01", `FAILED listing ${wiki}: ${(err as Error).message}`);
    }
  }
  await writeJson("scripts/data/01-pages.json", all);
  await writeJson("scripts/data/01-pages-filtered.json", TARGETS);
  log("01", `total pages across all wikis: ${all.length}`);
  log("01", `Phase A (Main) targets: ${MAIN_TIER.length}`);
  log("01", `Phase B (Recurring) targets: ${RECURRING_TIER.length}`);
  log("01", `Phase C (Minor) targets: ${MINOR_TIER.length}`);
  log("01", `TOTAL targets: ${TARGETS.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
