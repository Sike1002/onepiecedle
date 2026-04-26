/** Static assertions for the Onepiecedle runtime pools. Run via
 * `npm run test:pools`. */
import { existsSync } from "fs";
import { normalPool, deepcutPool, fullPool, silhouettePool } from "../lib/characterPools";
import { characters } from "../data/characters";
import type { OnePieceCharacter } from "../lib/types";

let failed = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`✗ ${msg}`);
    failed++;
  } else {
    console.log(`✓ ${msg}`);
  }
}

// Pool sizes are sane.
assert(normalPool.length >= 15, `normalPool has ≥15 characters (got ${normalPool.length})`);
assert(deepcutPool.length >= 5, `deepcutPool has ≥5 characters (got ${deepcutPool.length})`);
assert(fullPool.length === characters.length, `fullPool equals source list`);

function hasOnePieceSource(c: OnePieceCharacter) {
  return c.sources.some((source) => source.includes("onepiece.fandom.com/wiki/"));
}

function hasUniqueIds(pool: OnePieceCharacter[], name: string) {
  const seen = new Set<string>();
  for (const c of pool) {
    assert(!seen.has(c.id), `${name} id is unique: ${c.id}`);
    seen.add(c.id);
  }
}

// Nothing in normalPool is manga-only, unreviewed, or unsafe.
for (const c of normalPool) {
  if (c.canonVisibility !== "anime_aired") {
    assert(false, `normalPool leak: ${c.id} has canonVisibility=${c.canonVisibility}`);
  }
  if (!c.safeForNormalModes) {
    assert(false, `normalPool leak: ${c.id} safeForNormalModes=false`);
  }
  if (c.difficulty === "review") {
    assert(false, `normalPool leak: ${c.id} difficulty=review`);
  }
}

// Deep-Cut answers are manga-only spoilers and not normal-mode safe.
for (const c of deepcutPool) {
  if (c.canonVisibility !== "manga_only_spoiler") {
    assert(false, `deepcutPool member wrong visibility: ${c.id} ${c.canonVisibility}`);
  }
  if (c.safeForNormalModes) {
    assert(false, `deepcutPool leak: ${c.id} safeForNormalModes=true`);
  }
  if (c.difficulty === "review") {
    assert(false, `deepcutPool leak: ${c.id} difficulty=review`);
  }
}

// Normal and deepcut pools should be disjoint today because canonVisibility
// is the discriminator.
const normalIds = new Set(normalPool.map((c) => c.id));
for (const c of deepcutPool) {
  if (normalIds.has(c.id)) {
    assert(false, `pool overlap: ${c.id} appears in both normal and deepcut`);
  }
}
assert(true, `normalPool and deepcutPool are disjoint`);

hasUniqueIds(characters, "characters");
hasUniqueIds(fullPool, "fullPool");
hasUniqueIds(normalPool, "normalPool");
hasUniqueIds(deepcutPool, "deepcutPool");

const fullIds = new Set(fullPool.map((c) => c.id));
for (const c of characters) {
  const ctx = c.id;
  assert(fullIds.has(c.id), `fullPool includes ${ctx}`);
  assert(c.name.trim().length > 0, `${ctx} has name`);
  assert(c.fullName.trim().length > 0, `${ctx} has fullName`);
  assert(c.race.length > 0, `${ctx} has race`);
  assert(c.affiliation.length > 0, `${ctx} has affiliation`);
  assert(c.haki.length > 0, `${ctx} has haki list`);
  assert(c.quotes.length >= 1, `${ctx} has at least one quote`);
  assert(c.emojis.length === 6, `${ctx} has exactly 6 emojis`);
  assert(c.powerDescription.trim().length > 0, `${ctx} has powerDescription`);
  assert(hasOnePieceSource(c), `${ctx} has One Piece Wiki source`);
  assert(existsSync(`public${c.portraitUrl}`), `${ctx} portrait exists`);
  if (c.devilFruitType === "None") {
    assert(c.devilFruitName === null, `${ctx} has no Devil Fruit name when type=None`);
  } else {
    assert(Boolean(c.devilFruitName), `${ctx} has Devil Fruit name for ${c.devilFruitType}`);
  }
  if (c.safeForNormalModes) {
    assert(c.canonVisibility === "anime_aired", `${ctx} normal-safe implies anime_aired`);
  }
  if (c.canonVisibility === "manga_only_spoiler") {
    assert(!c.safeForNormalModes, `${ctx} manga-only implies not normal-safe`);
  }
}

const silhouetteIds = new Set(silhouettePool.map((c) => c.id));
for (const c of silhouettePool) {
  assert(normalIds.has(c.id), `silhouettePool member is normal-safe: ${c.id}`);
  assert(existsSync(`public/silhouettes/${c.id}.webp`), `${c.id} silhouette exists`);
}
for (const c of normalPool) {
  if (!silhouetteIds.has(c.id)) {
    assert(!existsSync(`public/silhouettes/${c.id}.webp`), `${c.id} intentionally excluded from silhouettePool`);
  }
}

console.log(
  `\nnormalPool=${normalPool.length} deepcutPool=${deepcutPool.length} fullPool=${fullPool.length}`,
);
if (failed > 0) {
  console.error(`\n${failed} assertions failed`);
  process.exit(1);
}
console.log("\nAll pool tests passed.");
