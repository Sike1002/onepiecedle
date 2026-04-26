/**
 * gen-hero-image — Build a stylised "Luffy hero" placeholder for the home
 * page. SVG-based, transparent background, matches the pirate palette. Drop
 * a real Luffy portrait into `public/characters/luffy-hero.webp` later to
 * replace it without code changes.
 */
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";

const W = 445;
const H = 1100;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- Coat / body -->
  <rect x="${W / 2 - 110}" y="${H / 2 - 60}" width="220" height="320" rx="32" fill="#9c2a2a" stroke="#0e0e10" stroke-width="8"/>
  <!-- Sash -->
  <rect x="${W / 2 - 110}" y="${H / 2 + 110}" width="220" height="32" fill="#f4d35e" stroke="#0e0e10" stroke-width="6"/>
  <!-- Shorts -->
  <rect x="${W / 2 - 100}" y="${H / 2 + 250}" width="200" height="180" rx="14" fill="#1a4e7a" stroke="#0e0e10" stroke-width="8"/>
  <!-- Head -->
  <circle cx="${W / 2}" cy="${H / 2 - 140}" r="98" fill="#f5deb3" stroke="#0e0e10" stroke-width="8"/>
  <!-- Hair -->
  <path d="M ${W / 2 - 92} ${H / 2 - 158} Q ${W / 2} ${H / 2 - 252} ${W / 2 + 92} ${H / 2 - 158} Z"
        fill="#0e0e10"/>
  <!-- Scar under eye -->
  <line x1="${W / 2 - 28}" y1="${H / 2 - 116}" x2="${W / 2 - 12}" y2="${H / 2 - 100}"
        stroke="#9c2a2a" stroke-width="5" stroke-linecap="round"/>
  <!-- Eyes -->
  <circle cx="${W / 2 - 26}" cy="${H / 2 - 132}" r="6" fill="#0e0e10"/>
  <circle cx="${W / 2 + 30}" cy="${H / 2 - 132}" r="6" fill="#0e0e10"/>
  <!-- Smile -->
  <path d="M ${W / 2 - 30} ${H / 2 - 100} Q ${W / 2} ${H / 2 - 76} ${W / 2 + 30} ${H / 2 - 100}"
        fill="none" stroke="#0e0e10" stroke-width="5" stroke-linecap="round"/>
  <!-- Straw hat brim -->
  <ellipse cx="${W / 2}" cy="${H / 2 - 232}" rx="156" ry="22" fill="#f5deb3" stroke="#0e0e10" stroke-width="8"/>
  <!-- Hat dome -->
  <path d="M ${W / 2 - 84} ${H / 2 - 232} Q ${W / 2} ${H / 2 - 318} ${W / 2 + 84} ${H / 2 - 232} Z"
        fill="#f5deb3" stroke="#0e0e10" stroke-width="8"/>
  <!-- Hat ribbon -->
  <rect x="${W / 2 - 84}" y="${H / 2 - 244}" width="168" height="22" fill="#9c2a2a" stroke="#0e0e10" stroke-width="5"/>
</svg>`;

async function main() {
  await mkdir("public/characters", { recursive: true });
  const buf = await sharp(Buffer.from(svg)).webp({ quality: 92, alphaQuality: 100 }).toBuffer();
  await writeFile("public/characters/luffy-hero.webp", buf);
  console.log(`wrote luffy-hero.webp (${buf.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
