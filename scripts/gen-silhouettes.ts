/**
 * gen-silhouettes — Build true black-silhouette versions of every character
 * portrait into `public/silhouettes/{id}.webp`.
 *
 * Strategy:
 *  1. If the source portrait has an alpha channel, recolor every visible
 *     pixel to pure black while preserving the alpha mask.
 *  2. If the source is opaque RGB, sample the four corner pixels to estimate
 *     a background color (Fandom anime infobox portraits are typically on a
 *     near-uniform sky-blue or white field), then build an alpha mask by
 *     thresholding pixel distance from the background color. Pixels within
 *     `BG_TOLERANCE` of the background become transparent; everything else
 *     becomes black. A small Gaussian blur on the alpha mask softens jagged
 *     edges and removes single-pixel JPEG noise.
 *
 *  Pixels near the edge of the canvas that survive the threshold (anime
 *  text boxes, copyright tags) are usually rare; a 4 px erosion would
 *  remove them but also eats into thin limbs, so we skip it. If a
 *  particular character looks bad, hand-source a clean PNG.
 */
import { mkdir, readdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

const SRC_DIR = "public/characters";
const OUT_DIR = "public/silhouettes";
const SKIP_LIST = "scripts/data/silhouettes-skipped.json";

/** Color distance tolerance below which a pixel is considered "background".
 * Higher values bleed into hair/clothing matching the background tint;
 * lower values leave halo around the figure. 60 is a good middle for the
 * sky-blue Fandom anime infobox backdrop. */
const BG_TOLERANCE = 60;

async function ensureDir(p: string) {
  if (!existsSync(p)) await mkdir(p, { recursive: true });
}

interface RGB { r: number; g: number; b: number }

function rgbDist(a: RGB, b: RGB): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function avgRGB(samples: RGB[]): RGB {
  const sum = samples.reduce((acc, s) => ({ r: acc.r + s.r, g: acc.g + s.g, b: acc.b + s.b }), {
    r: 0,
    g: 0,
    b: 0,
  });
  return { r: sum.r / samples.length, g: sum.g / samples.length, b: sum.b / samples.length };
}

/** Estimate the background color from the four corners of an RGB image. */
function estimateBgColor(data: Buffer, w: number, h: number, ch: number): RGB {
  const at = (x: number, y: number): RGB => {
    const i = (y * w + x) * ch;
    return { r: data[i], g: data[i + 1], b: data[i + 2] };
  };
  return avgRGB([at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)]);
}

/** Build a transparent-bg silhouette from an opaque source. */
async function buildFromOpaque(srcPath: string, outPath: string): Promise<void> {
  const { data, info } = await sharp(srcPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const bg = estimateBgColor(data, width, height, channels);

  // Allocate RGBA output. Black where pixel is far from background, transparent where close.
  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const o = (y * width + x) * 4;
      const dist = rgbDist({ r: data[i], g: data[i + 1], b: data[i + 2] }, bg);
      const fg = dist > BG_TOLERANCE;
      out[o] = 0;
      out[o + 1] = 0;
      out[o + 2] = 0;
      out[o + 3] = fg ? 255 : 0;
    }
  }
  await sharp(out, { raw: { width, height, channels: 4 } })
    .blur(0.5) // soften 1-px noise on the alpha edge
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(outPath);
}

/** Build a transparent-bg silhouette from a source that already has alpha. */
async function buildFromAlpha(srcPath: string, outPath: string): Promise<void> {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    out[i] = 0;
    out[i + 1] = 0;
    out[i + 2] = 0;
    out[i + 3] = data[i + 3];
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(outPath);
}

async function main() {
  await ensureDir(OUT_DIR);
  await ensureDir(path.dirname(SKIP_LIST));

  const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith(".webp") && !f.includes("hero"));
  const skipped: string[] = [];
  let built = 0;

  for (const f of files) {
    const id = f.replace(/\.webp$/, "");
    const src = path.join(SRC_DIR, f);
    const out = path.join(OUT_DIR, f);
    const meta = await sharp(src).metadata();
    try {
      if (meta.hasAlpha) {
        await buildFromAlpha(src, out);
      } else {
        await buildFromOpaque(src, out);
      }
      built++;
    } catch (err) {
      skipped.push(id);
      console.log(`  ${id}: skipped — ${(err as Error).message}`);
    }
  }

  await writeFile(SKIP_LIST, JSON.stringify(skipped, null, 2) + "\n");
  console.log(`silhouettes: built=${built} skipped=${skipped.length}`);
  if (skipped.length) console.log("  skipped:", skipped.join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
