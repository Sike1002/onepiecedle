/**
 * gen-placeholders — Build placeholder portrait WebPs for every character in
 * `data/characters.ts`. Each placeholder is a solid pirate-themed background
 * with the character's initials and a small colored accent ring. The output
 * has a real alpha channel so `gen-silhouettes.ts` can produce a clean
 * shape-only silhouette for the Silhouette mode.
 *
 * Replace these later by either (a) hand-dropping real portraits into
 * `public/characters/` (same id-based filenames), or (b) writing a focused
 * Fandom-image fetch script — the rest of the pipeline doesn't care.
 */
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";
import { characters } from "../data/characters";

const OUT = "public/characters";
const SIZE = 320;

/** Pirate-flag palette: pick a deterministic color per character so portraits
 * don't all look identical at a glance. Yellow / red / parchment / ocean. */
const PALETTE: Array<{ bg: string; ring: string; ink: string }> = [
  { bg: "#1a4e7a", ring: "#f4d35e", ink: "#fdf6e3" }, // ocean
  { bg: "#9c2a2a", ring: "#f4d35e", ink: "#fdf6e3" }, // straw-hat red
  { bg: "#2a3b1a", ring: "#f4d35e", ink: "#fdf6e3" }, // moss
  { bg: "#3b2a1a", ring: "#f4d35e", ink: "#fdf6e3" }, // brown wood
  { bg: "#0e0e10", ring: "#f4d35e", ink: "#fdf6e3" }, // jolly black
  { bg: "#5a3a1a", ring: "#f4d35e", ink: "#fdf6e3" }, // sepia
];

function initials(name: string): string {
  const tokens = name.split(/[^A-Za-z0-9]/).filter(Boolean);
  if (tokens.length === 0) return "?";
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return (tokens[0][0] + tokens[tokens.length - 1][0]).toUpperCase();
}

function svgFor(name: string, idx: number): string {
  const c = PALETTE[idx % PALETTE.length];
  const init = initials(name);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
      <rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="${c.bg}"/>
      <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2 - 18}" fill="none" stroke="${c.ring}" stroke-width="6"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
            fill="${c.ink}" font-family="Impact, 'Arial Black', sans-serif"
            font-weight="900" font-size="${SIZE * 0.42}" letter-spacing="2">${init}</text>
    </svg>
  `.trim();
}

async function ensureDir(p: string) {
  if (!existsSync(p)) await mkdir(p, { recursive: true });
}

async function buildPortrait(id: string, name: string, idx: number) {
  const out = path.join(OUT, `${id}.webp`);
  const svg = svgFor(name, idx);
  // Render SVG into RGBA buffer with a transparent surrounding region so the
  // silhouette generator has alpha to work with. We then composite the colored
  // disc onto a transparent canvas of the same size — the alpha mask matches
  // the disc, and `gen-silhouettes` will turn that into a solid black disc.
  const disc = Buffer.from(svg);
  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      // Render the SVG card, then mask it to a circle so the silhouette is round.
      {
        input: await sharp(disc).png().toBuffer(),
        blend: "over",
      },
      {
        // circular alpha mask
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
            <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2 - 4}" fill="#fff"/>
          </svg>`,
        ),
        blend: "dest-in",
      },
    ])
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(out);
}

async function main() {
  await ensureDir(OUT);
  let i = 0;
  for (const c of characters) {
    await buildPortrait(c.id, c.name, i);
    i++;
  }
  console.log(`placeholders: built=${characters.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
