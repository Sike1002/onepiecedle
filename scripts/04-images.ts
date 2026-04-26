/**
 * 04-images — download portraits, smart-crop, resize 512×512, convert WebP.
 * Output: public/characters/{id}.webp + scripts/data/04-images.json
 */
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import sharp from "sharp";
import { banner, cachedFetchBinary, log, readJson, writeJson } from "./lib/util";

interface CanonRecord {
  id: string;
  name: string;
  rawThumbnailUrl: string | null;
}

/** Generate a fallback monogram SVG (converted to WebP) when no image available. */
async function generatePlaceholder(id: string, name: string): Promise<Buffer> {
  const PALETTE = ["#fbbf24", "#2563eb", "#dc2626", "#10b981", "#a855f7", "#f97316"];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  const color = PALETTE[Math.abs(h) % PALETTE.length];
  const initials = name
    .replace(/[()]/g, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#0a0a0a"/>
  <circle cx="50" cy="50" r="44" fill="${color}" stroke="#000" stroke-width="4"/>
  <text x="50" y="64" font-family="Impact, sans-serif" font-size="42" font-weight="900"
        text-anchor="middle" fill="#0a0a0a">${initials}</text>
</svg>`;
  return sharp(Buffer.from(svg)).resize(512, 512).webp({ quality: 85 }).toBuffer();
}

async function processOne(rec: CanonRecord): Promise<{ id: string; ok: boolean; source: "wiki" | "placeholder"; bytes: number }> {
  const outPath = `public/characters/${rec.id}.webp`;
  await mkdir("public/characters", { recursive: true });

  if (existsSync(outPath)) {
    const { statSync } = await import("fs");
    return { id: rec.id, ok: true, source: "wiki", bytes: statSync(outPath).size };
  }

  if (!rec.rawThumbnailUrl) {
    const buf = await generatePlaceholder(rec.id, rec.name);
    await writeFile(outPath, buf);
    return { id: rec.id, ok: true, source: "placeholder", bytes: buf.length };
  }

  try {
    const cachedPath = await cachedFetchBinary(rec.rawThumbnailUrl, "images", rec.id);
    const { readFile } = await import("fs/promises");
    const raw = await readFile(cachedPath);
    // Anchor to the top edge — Fandom portraits usually frame head-at-top, so
    // a cover-crop from center or 'attention' (entropy) picks the torso for
    // full-body hero poses and cuts the face. Top-anchoring keeps the face.
    const optimized = await sharp(raw)
      .resize(512, 512, { fit: "cover", position: "top" })
      .webp({ quality: 85 })
      .toBuffer();
    await writeFile(outPath, optimized);
    return { id: rec.id, ok: true, source: "wiki", bytes: optimized.length };
  } catch (err) {
    log("04", `  ${rec.id}: download failed (${(err as Error).message}), using placeholder`);
    const buf = await generatePlaceholder(rec.id, rec.name);
    await writeFile(outPath, buf);
    return { id: rec.id, ok: true, source: "placeholder", bytes: buf.length };
  }
}

async function main() {
  banner("Phase 04 — Images");
  const records = await readJson<CanonRecord[]>("scripts/data/03-canonical.json");
  const results: Array<{ id: string; ok: boolean; source: "wiki" | "placeholder"; bytes: number }> = [];
  for (const r of records) {
    const res = await processOne(r);
    log("04", `  ${res.id}: ${res.source} (${(res.bytes / 1024).toFixed(0)} KB)`);
    results.push(res);
  }
  await writeJson("scripts/data/04-images.json", results);
  const wikiCount = results.filter((r) => r.source === "wiki").length;
  log("04", `done — ${wikiCount} wiki portraits, ${results.length - wikiCount} placeholders`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
