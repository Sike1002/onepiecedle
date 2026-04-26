/**
 * gen-hero-image — Download the high-res Luffy infobox portrait from the
 * One Piece Fandom MediaWiki API, chroma-key out the sky-blue background,
 * and emit `public/characters/luffy-hero.webp` for the home page hero.
 *
 * Equivalent to `scripts/04-images.ts` but specialised for the larger
 * full-body cutout used by the home page.
 */
import { writeFile, mkdir } from "fs/promises";
import sharp from "sharp";

const UA = "Onepiecedle-fan-build/0.1 (fan project, non-commercial)";
const TARGET_W = 445;
const TARGET_H = 1100;
const BG_TOLERANCE = 60;

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

async function fetchLuffyImage(): Promise<Buffer> {
  const apiUrl = `https://onepiece.fandom.com/api.php?action=query&prop=pageimages&titles=Monkey_D._Luffy&format=json&pithumbsize=1400&redirects=1`;
  const res = await fetch(apiUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`API HTTP ${res.status}`);
  const json = (await res.json()) as PageImageResp;
  const first = Object.values(json.query?.pages ?? {})[0];
  const thumb = first?.thumbnail?.source;
  if (!thumb) throw new Error("no Luffy thumbnail in API response");
  // Drop the resize prefix to get the highest-resolution original.
  const fullUrl = thumb.replace(/\/scale-to-width-down\/\d+/, "");
  const img = await fetch(fullUrl, { headers: { "User-Agent": UA } });
  if (!img.ok) throw new Error(`image HTTP ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}

/** Sample corner pixels and chroma-key the background to alpha. Returns
 * a raw RGBA buffer + dimensions ready to feed back into Sharp. */
async function chromaKey(rawJpegOrPng: Buffer): Promise<{ data: Buffer; w: number; h: number }> {
  const { data, info } = await sharp(rawJpegOrPng)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
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

async function main() {
  await mkdir("public/characters", { recursive: true });
  console.log("fetching Luffy from One Piece Fandom…");
  const raw = await fetchLuffyImage();
  console.log(`  downloaded ${(raw.length / 1024).toFixed(0)} KB`);

  const { data, w, h } = await chromaKey(raw);
  console.log(`  source ${w}×${h}, chroma-keyed`);

  // Render into RGBA, then `contain` to the home-page hero box so the full
  // figure stays visible without cropping the head or feet.
  const buf = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .resize(TARGET_W, TARGET_H, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 92, alphaQuality: 100 })
    .toBuffer();
  await writeFile("public/characters/luffy-hero.webp", buf);
  console.log(`wrote luffy-hero.webp (${buf.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
