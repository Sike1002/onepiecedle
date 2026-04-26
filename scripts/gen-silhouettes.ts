/**
 * gen-silhouettes — Build true black-silhouette versions of every character
 * portrait into `public/silhouettes/{id}.webp`.
 *
 * Strategy:
 *  - If the source portrait has an alpha channel, recolor every visible pixel
 *    to pure black while preserving the alpha mask. The yellow frame in the UI
 *    shows through transparent regions, producing a clean shape-only image.
 *  - If the source portrait is opaque RGB (no alpha), background removal is
 *    not reliable from CSS or a simple threshold, so we skip and emit the id
 *    in `scripts/data/silhouettes-skipped.json`. The runtime pool excludes
 *    those characters from silhouette mode so the puzzle stays fair.
 */
import { mkdir, readdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

const SRC_DIR = "public/characters";
const OUT_DIR = "public/silhouettes";
const SKIP_LIST = "scripts/data/silhouettes-skipped.json";

async function ensureDir(p: string) {
  if (!existsSync(p)) await mkdir(p, { recursive: true });
}

async function buildSilhouette(srcPath: string, outPath: string): Promise<"alpha" | "skip"> {
  const img = sharp(srcPath);
  const meta = await img.metadata();
  if (!meta.hasAlpha) return "skip";

  // Pull raw RGBA, force every visible pixel (alpha > 0) to pure black.
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    out[i] = 0;
    out[i + 1] = 0;
    out[i + 2] = 0;
    out[i + 3] = a;
  }
  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(outPath);
  return "alpha";
}

async function main() {
  await ensureDir(OUT_DIR);
  await ensureDir(path.dirname(SKIP_LIST));

  const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith(".webp"));
  const skipped: string[] = [];
  let built = 0;

  for (const f of files) {
    const id = f.replace(/\.webp$/, "");
    const src = path.join(SRC_DIR, f);
    const out = path.join(OUT_DIR, f);
    const result = await buildSilhouette(src, out);
    if (result === "skip") {
      skipped.push(id);
    } else {
      built += 1;
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
