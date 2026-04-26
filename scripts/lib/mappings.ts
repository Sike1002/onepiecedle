import type {
  Affiliation,
  Alignment,
  Gender,
  Origin,
  PowerType,
  Species,
  Status,
} from "../../lib/types";

/** Canonicalize a raw wiki string using a lookup table + fuzzy fallback. */
function lookup<T extends string>(
  raw: string,
  table: Record<string, T>,
  fallback: T,
  aliases: Array<[RegExp, T]> = [],
): { value: T; mapped: boolean } {
  const norm = raw.trim();
  if (!norm) return { value: fallback, mapped: false };
  if (table[norm]) return { value: table[norm], mapped: true };
  const lower = norm.toLowerCase();
  for (const [rx, v] of aliases) {
    if (rx.test(lower)) return { value: v, mapped: true };
  }
  return { value: fallback, mapped: false };
}

/* ─────────── Gender ─────────── */

export function mapGender(raw: string): { value: Gender; mapped: boolean } {
  const t: Record<string, Gender> = {
    Male: "Male",
    Female: "Female",
    "Non-binary": "Non-binary",
    "N/A": "N/A",
  };
  return lookup(raw, t, "N/A", [
    [/^male/, "Male"],
    [/^female/, "Female"],
    [/non[- ]?binary|enby/, "Non-binary"],
  ]);
}

/* ─────────── Species ─────────── */

export function mapSpecies(raw: string): { value: Species[]; mapped: boolean } {
  const norm = raw.trim();
  if (!norm) return { value: ["Human"], mapped: false };

  const explicit: Record<string, Species[]> = {
    Human: ["Human"],
    Viltrumite: ["Viltrumite"],
    "Half-Viltrumite": ["Half-Viltrumite"],
    "Viltrumite-Human Hybrid": ["Half-Viltrumite", "Human"],
    "Viltrumite/Thraxan Hybrid": ["Half-Viltrumite", "Thraxan"],
    "Thraxan/Viltrumite Hybrid": ["Half-Viltrumite", "Thraxan"],
    "Viltrumite-Thraxan Hybrid": ["Half-Viltrumite", "Thraxan"],
    "Thraxan-Viltrumite Hybrid": ["Half-Viltrumite", "Thraxan"],
    Thraxan: ["Thraxan"],
    Martian: ["Martian"],
    Unopan: ["Mantis-Alien"],
    "Mantis-Alien": ["Mantis-Alien"],
    Demon: ["Demon"],
    Sequid: ["Unknown-Alien"],
  };
  if (explicit[norm]) return { value: explicit[norm], mapped: true };

  const lower = norm.toLowerCase();
  if (/viltrumite.*thraxan|thraxan.*viltrumite/.test(lower))
    return { value: ["Half-Viltrumite", "Thraxan"], mapped: true };
  if (/viltrumite.*human|human.*viltrumite|hybrid/.test(lower))
    return { value: ["Half-Viltrumite", "Human"], mapped: true };
  if (/viltrumite/.test(lower)) return { value: ["Viltrumite"], mapped: true };
  if (/human/.test(lower)) return { value: ["Human"], mapped: true };
  if (/thraxan/.test(lower)) return { value: ["Thraxan"], mapped: true };
  if (/martian/.test(lower)) return { value: ["Martian"], mapped: true };
  if (/demon/.test(lower)) return { value: ["Demon"], mapped: true };
  if (/unopan|mantis/.test(lower)) return { value: ["Mantis-Alien"], mapped: true };
  if (/alien|extraterrestrial|dornian|sequid/.test(lower))
    return { value: ["Unknown-Alien"], mapped: true };
  // Any non-empty unrecognized species is probably an alien race we don't have an enum for.
  if (norm.length > 0) return { value: ["Unknown-Alien"], mapped: false };
  return { value: ["Human"], mapped: false };
}

/* ─────────── Alignment ─────────── */

export function mapAlignment(raw: string): { value: Alignment; mapped: boolean } {
  const t: Record<string, Alignment> = {
    Hero: "Hero",
    Villain: "Villain",
    "Anti-hero": "Anti-hero",
    Antihero: "Anti-hero",
    Neutral: "Neutral",
    Civilian: "Civilian",
  };
  return lookup(raw, t, "Neutral", [
    [/villain|antagonist/, "Villain"],
    [/anti[- ]?hero/, "Anti-hero"],
    [/hero|protagonist|good/, "Hero"],
    [/civilian|non[- ]?powered/, "Civilian"],
  ]);
}

/* ─────────── Affiliation ─────────── */

export function mapAffiliation(raw: string): { values: Affiliation[]; unmapped: string[] } {
  const tokens = raw
    .split(/[,;\n]|\s{2,}|\s·\s|\s\/\s/)
    .map((t) => t.trim())
    .filter(Boolean);

  const table: Record<string, Affiliation> = {
    "Guardians of the Globe": "Guardians of the Globe",
    "Teen Team": "Teen Team",
    GDA: "GDA",
    "Global Defense Agency": "GDA",
    "Viltrum Empire": "Viltrum Empire",
    "Viltrumite Empire": "Viltrum Empire",
    "Coalition of Planets": "Coalition of Planets",
    Reanimen: "Reanimen",
    "Mauler Twins": "Mauler Twins",
    "Invincible Inc.": "Invincible Inc.",
    "Invincible Inc": "Invincible Inc.",
    Independent: "Independent",
    None: "Independent",
  };

  const out: Affiliation[] = [];
  const unmapped: string[] = [];
  for (const tok of tokens) {
    const v = table[tok];
    if (v) {
      if (!out.includes(v)) out.push(v);
      continue;
    }
    const lower = tok.toLowerCase();
    if (/guardians/.test(lower) && !out.includes("Guardians of the Globe"))
      out.push("Guardians of the Globe");
    else if (/teen\s*team/.test(lower) && !out.includes("Teen Team")) out.push("Teen Team");
    else if (/gda|global\s*defense/.test(lower) && !out.includes("GDA")) out.push("GDA");
    else if (/viltrum/.test(lower) && !out.includes("Viltrum Empire")) out.push("Viltrum Empire");
    else if (/coalition/.test(lower) && !out.includes("Coalition of Planets"))
      out.push("Coalition of Planets");
    else if (/reanimen/.test(lower) && !out.includes("Reanimen")) out.push("Reanimen");
    else if (/mauler/.test(lower) && !out.includes("Mauler Twins")) out.push("Mauler Twins");
    else unmapped.push(tok);
  }
  if (out.length === 0) out.push("Independent");
  return { values: out.slice(0, 3), unmapped };
}

/* ─────────── PowerType ─────────── */

export function mapPowers(raw: string): { values: PowerType[]; unmapped: string[] } {
  const tokens = raw
    .split(/[,;\n]|\s{2,}|\s·\s|\s\/\s/)
    .map((t) => t.trim())
    .filter(Boolean);

  const table: Record<string, PowerType> = {
    Flight: "Flight",
    "Super Strength": "Super Strength",
    "Superhuman Strength": "Super Strength",
    "Super Speed": "Super Speed",
    "Superhuman Speed": "Super Speed",
    Durability: "Durability",
    "Superhuman Durability": "Durability",
    Invulnerability: "Durability",
    "Energy Projection": "Energy Projection",
    "Energy Manipulation": "Energy Projection",
    "Energy Blasts": "Energy Projection",
    "Matter Manipulation": "Matter Manipulation",
    "Molecular Manipulation": "Matter Manipulation",
    Shapeshifting: "Shapeshifting",
    Technology: "Technology",
    "Tech/Gadgets": "Technology",
    Gadgets: "Technology",
    "Shadow Magic": "Shadow Magic",
    "Shadow Manipulation": "Shadow Magic",
    Regeneration: "Regeneration",
    Healing: "Regeneration",
    Immortality: "Regeneration",
    "Enhanced Intellect": "Enhanced Intellect",
    "Super Intelligence": "Enhanced Intellect",
    Genius: "Enhanced Intellect",
    None: "None",
  };

  const out: PowerType[] = [];
  const unmapped: string[] = [];
  for (const tok of tokens) {
    const v = table[tok];
    if (v) {
      if (!out.includes(v)) out.push(v);
      continue;
    }
    const lower = tok.toLowerCase();
    if (/flight|flying/.test(lower) && !out.includes("Flight")) out.push("Flight");
    else if (/strength/.test(lower) && !out.includes("Super Strength")) out.push("Super Strength");
    else if (/speed/.test(lower) && !out.includes("Super Speed")) out.push("Super Speed");
    else if (/durab|invulnerab|tough/.test(lower) && !out.includes("Durability"))
      out.push("Durability");
    else if (/energy/.test(lower) && !out.includes("Energy Projection"))
      out.push("Energy Projection");
    else if (/matter|molecul/.test(lower) && !out.includes("Matter Manipulation"))
      out.push("Matter Manipulation");
    else if (/shapeshift|morph/.test(lower) && !out.includes("Shapeshifting"))
      out.push("Shapeshifting");
    else if (/tech|gadget|arsenal|suit/.test(lower) && !out.includes("Technology"))
      out.push("Technology");
    else if (/shadow/.test(lower) && !out.includes("Shadow Magic")) out.push("Shadow Magic");
    else if (/regen|heal|immort/.test(lower) && !out.includes("Regeneration"))
      out.push("Regeneration");
    else if (/intellect|genius|mind/.test(lower) && !out.includes("Enhanced Intellect"))
      out.push("Enhanced Intellect");
    else unmapped.push(tok);
  }
  // Keep only the first 4 signature powers.
  return { values: out.slice(0, 4).length > 0 ? out.slice(0, 4) : ["None"], unmapped };
}

/* ─────────── Origin ─────────── */

export function mapOrigin(raw: string): { value: Origin; mapped: boolean } {
  const t: Record<string, Origin> = {
    Earth: "Earth",
    Viltrum: "Viltrum",
    Thraxa: "Thraxa",
    Mars: "Mars",
    Hell: "Hell",
    Talescria: "Talescria",
    Unknown: "Unknown",
  };
  return lookup(raw, t, "Unknown", [
    [/earth|usa|united states|america/, "Earth"],
    [/viltrum/, "Viltrum"],
    [/thraxa/, "Thraxa"],
    [/mars/, "Mars"],
    [/hell|infernal/, "Hell"],
    [/talescria|unopa/, "Talescria"],
  ]);
}

/* ─────────── Status ─────────── */

export function mapStatus(raw: string): { value: Status; mapped: boolean } {
  const t: Record<string, Status> = {
    Alive: "Alive",
    Deceased: "Deceased",
    Dead: "Deceased",
    Revived: "Revived",
    Resurrected: "Revived",
    Unknown: "Unknown",
  };
  return lookup(raw, t, "Unknown", [
    [/alive|living/, "Alive"],
    [/deceased|dead|killed/, "Deceased"],
    [/revived|resurrect/, "Revived"],
  ]);
}
