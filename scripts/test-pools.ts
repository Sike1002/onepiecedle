/** Static assertion that no post-S4 spoiler character appears in the
 * normal-mode pool. Run via `npm run test:pools`. */
import { normalPool, deepcutPool, fullPool } from "../lib/characterPools";
import { characters } from "../data/characters";

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

// Nothing in normalPool is flagged as post-S4 or unknown.
for (const c of normalPool) {
  if (c.canonVisibility !== "prime_s1_s4") {
    assert(false, `normalPool leak: ${c.id} has canonVisibility=${c.canonVisibility}`);
  }
  if (!c.safeForNormalModes) {
    assert(false, `normalPool leak: ${c.id} safeForNormalModes=false`);
  }
}

// Nothing safe-for-normal-modes leaks into deepcutPool (deepcut is a separate
// *answer* pool; safeForNormalModes and canonVisibility are independent of
// tier though, so this just confirms the canon flag drives pool membership).
for (const c of deepcutPool) {
  if (c.canonVisibility !== "post_s4_comic_spoiler") {
    assert(false, `deepcutPool member wrong visibility: ${c.id} ${c.canonVisibility}`);
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

// Normal-mode facts must be show-safe, not comic-finale facts. If a character
// appears in normalPool, their public source should be the Amazon/Prime wiki
// and their first appearance should be a show season.
for (const c of normalPool) {
  if (c.firstAppearanceSeason === "Comics-only") {
    assert(false, `normalPool leak: ${c.id} is marked Comics-only`);
  }
  if (c.sources.some((source) => source.includes("comic-invincible.fandom.com"))) {
    assert(false, `normalPool leak: ${c.id} uses comic wiki source`);
  }
}

const thragg = characters.find((c) => c.id === "thragg");
assert(Boolean(thragg), "thragg exists in character data");
if (thragg) {
  assert(normalIds.has(thragg.id), "thragg is available in normal modes after S4 debut");
  assert(thragg.status === "Alive", `thragg status is Prime-safe Alive (got ${thragg.status})`);
  assert(thragg.firstAppearanceSeason === 4, `thragg first appears in S4 (got ${thragg.firstAppearanceSeason})`);
  assert(
    thragg.sources.every((source) => source.includes("amazon-invincible.fandom.com")),
    `thragg uses Amazon source (${thragg.sources.join(", ")})`,
  );
}

console.log(
  `\nnormalPool=${normalPool.length} deepcutPool=${deepcutPool.length} fullPool=${fullPool.length}`,
);
if (failed > 0) {
  console.error(`\n${failed} assertions failed`);
  process.exit(1);
}
console.log("\nAll pool tests passed.");
