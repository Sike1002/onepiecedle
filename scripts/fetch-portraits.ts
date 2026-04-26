/**
 * fetch-portraits — Pull real character portraits from the One Piece Fandom
 * MediaWiki API and write them into `public/characters/{id}.webp`.
 *
 * Strategy:
 *  - Each character in `data/characters.ts` has a Fandom URL in `sources[0]`.
 *  - The MediaWiki `pageimages` API returns the infobox image for that page.
 *  - We download the raw image, smart-crop the face area (top-anchored), and
 *    re-encode as 512×512 WebP so the existing UI cell sizing keeps working.
 *  - Output replaces any existing placeholder for that id. Silhouette
 *    generator should be re-run after this.
 *
 * Attribution: images from onepiece.fandom.com are CC BY-SA 3.0 — credited
 * in `data/characters.ts` and the global footer.
 */
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";
import { characters } from "../data/characters";

const OUT_DIR = "public/characters";
const CACHE_DIR = "scripts/data/cache/fandom-images";
const SIZE = 512;
/** Distance from the corner-sampled background color below which a pixel is
 * dropped to alpha=0. Tuned for Fandom's sky-blue anime infobox backdrop;
 * higher tolerance bleeds into hair/clothing matching the tint, lower
 * leaves a visible halo around the figure. */
const BG_TOLERANCE = 60;
const UA = "Onepiecedle-fan-build/0.1 (fan project, non-commercial; contact via github.com/Sike1002/onepiecedle)";

interface PageImageResp {
  query?: {
    pages?: Record<string, { thumbnail?: { source: string; width: number; height: number }; pageimage?: string }>;
  };
}

interface RGB { r: number; g: number; b: number }

function rgbDist(a: RGB, b: RGB): number {
  const dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function avgRGB(samples: RGB[]): RGB {
  const sum = samples.reduce((acc, s) => ({ r: acc.r + s.r, g: acc.g + s.g, b: acc.b + s.b }), { r: 0, g: 0, b: 0 });
  return { r: sum.r / samples.length, g: sum.g / samples.length, b: sum.b / samples.length };
}

/** Sample the four corners of the source image and use the average as the
 * "background" color for chroma-key. Returns an RGBA buffer where pixels
 * within `BG_TOLERANCE` of that color are alpha=0. */
async function chromaKey(src: Buffer): Promise<{ data: Buffer; w: number; h: number }> {
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = info;
  const at = (x: number, y: number): RGB => {
    const i = (y * w + x) * channels;
    return { r: data[i], g: data[i + 1], b: data[i + 2] };
  };
  const bg = avgRGB([at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)]);
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * channels;
      const o = (y * w + x) * 4;
      const isBg = rgbDist({ r: data[i], g: data[i + 1], b: data[i + 2] }, bg) <= BG_TOLERANCE;
      out[o] = data[i];
      out[o + 1] = data[i + 1];
      out[o + 2] = data[i + 2];
      out[o + 3] = isBg ? 0 : 255;
    }
  }
  return { data: out, w, h };
}

function pageTitleFromSource(url: string | undefined): string | null {
  if (!url) return null;
  const m = url.match(/\/wiki\/([^?#]+)/);
  if (!m) return null;
  return decodeURIComponent(m[1]);
}

/** Strip Fandom's resize prefix to get the original full-resolution image URL. */
function rawSourceFromThumb(thumbUrl: string): string {
  // Thumbnails are like
  //   .../images/X/YY/Foo.png/revision/latest/scale-to-width-down/244?cb=...
  // The full image is at
  //   .../images/X/YY/Foo.png/revision/latest?cb=...
  return thumbUrl.replace(/\/scale-to-width-down\/\d+/, "");
}

async function fetchJson(url: string): Promise<PageImageResp> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return (await res.json()) as PageImageResp;
}

async function fetchBytes(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function fetchAndCrop(id: string, title: string): Promise<{ ok: true; bytes: number } | { ok: false; reason: string }> {
  const apiUrl = `https://onepiece.fandom.com/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(title)}&format=json&pithumbsize=720&redirects=1`;
  const cacheKey = path.join(CACHE_DIR, `${id}.bin`);

  let raw: Buffer;
  if (existsSync(cacheKey)) {
    raw = await readFile(cacheKey);
  } else {
    const json = await fetchJson(apiUrl);
    const pages = json.query?.pages ?? {};
    const first = Object.values(pages)[0];
    const thumb = first?.thumbnail?.source;
    if (!thumb) return { ok: false, reason: "no infobox image" };
    const fullUrl = rawSourceFromThumb(thumb);
    raw = await fetchBytes(fullUrl);
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(cacheKey, raw);
    // Be polite to the wiki — small spacing between requests.
    await new Promise((r) => setTimeout(r, 300));
  }

  const out = path.join(OUT_DIR, `${id}.webp`);
  // Step 1 — chroma-key the original (full-resolution) image so the
  // background drops to alpha=0. Doing this before resize avoids losing
  // edge detail to interpolation.
  const meta = await sharp(raw).metadata();
  let alphaSrc: Buffer;
  let alphaInfo: { width: number; height: number; channels: 1 | 2 | 3 | 4 };
  if (meta.hasAlpha) {
    const r = await sharp(raw).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    alphaSrc = r.data;
    alphaInfo = { width: r.info.width, height: r.info.height, channels: 4 };
  } else {
    const k = await chromaKey(raw);
    alphaSrc = k.data;
    alphaInfo = { width: k.w, height: k.h, channels: 4 };
  }

  // Step 2 — top-anchored cover crop to a square so the face survives in
  // full-body poses. WebP at q=86 keeps each portrait ~25–60 KB.
  const optimized = await sharp(alphaSrc, { raw: alphaInfo })
    .resize(SIZE, SIZE, { fit: "cover", position: "top" })
    .webp({ quality: 86, alphaQuality: 100 })
    .toBuffer();
  await writeFile(out, optimized);
  return { ok: true, bytes: optimized.length };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let success = 0;
  let failed = 0;
  const failures: Array<{ id: string; reason: string }> = [];

  for (const c of characters) {
    const title = pageTitleFromSource(c.sources[0]);
    if (!title) {
      failed++;
      failures.push({ id: c.id, reason: "no source url" });
      console.log(`  ${c.id}: SKIP (no source url)`);
      continue;
    }
    try {
      const r = await fetchAndCrop(c.id, title);
      if (r.ok) {
        success++;
        console.log(`  ${c.id}: ok (${(r.bytes / 1024).toFixed(0)} KB) ← ${title}`);
      } else {
        failed++;
        failures.push({ id: c.id, reason: r.reason });
        console.log(`  ${c.id}: FAIL — ${r.reason}`);
      }
    } catch (err) {
      failed++;
      failures.push({ id: c.id, reason: (err as Error).message });
      console.log(`  ${c.id}: ERROR — ${(err as Error).message}`);
    }
  }

  console.log("");
  console.log(`portraits: success=${success} failed=${failed}`);
  if (failures.length) {
    console.log("failures:");
    for (const f of failures) console.log(`  - ${f.id}: ${f.reason}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
