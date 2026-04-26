import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";

// Stylised Jolly Roger / Straw Hat icon. Yellow disc, black skull-and-crossbones
// silhouette, and a red brand bar at the bottom — matches the pirate palette
// used in the rest of the app.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0e0e10"/>
  <circle cx="256" cy="256" r="230" fill="#f4d35e" stroke="#0e0e10" stroke-width="16"/>
  <!-- Straw hat brim -->
  <ellipse cx="256" cy="200" rx="170" ry="34" fill="#f5deb3" stroke="#0e0e10" stroke-width="10"/>
  <!-- Hat dome -->
  <path d="M 152 200 Q 256 80 360 200 Z" fill="#f5deb3" stroke="#0e0e10" stroke-width="10"/>
  <!-- Hat ribbon -->
  <rect x="160" y="186" width="192" height="24" fill="#9c2a2a" stroke="#0e0e10" stroke-width="6"/>
  <!-- Skull -->
  <ellipse cx="256" cy="320" rx="86" ry="92" fill="#0e0e10"/>
  <ellipse cx="222" cy="316" rx="18" ry="22" fill="#f4d35e"/>
  <ellipse cx="290" cy="316" rx="18" ry="22" fill="#f4d35e"/>
  <rect x="246" y="350" width="20" height="34" fill="#f4d35e"/>
  <!-- Crossed bones -->
  <rect x="138" y="380" width="236" height="20" fill="#0e0e10" transform="rotate(-22 256 390)"/>
  <rect x="138" y="380" width="236" height="20" fill="#0e0e10" transform="rotate(22 256 390)"/>
  <!-- Brand strip -->
  <rect x="100" y="448" width="312" height="32" fill="#9c2a2a" stroke="#0e0e10" stroke-width="6"/>
  <text x="256" y="471" font-family="Impact, sans-serif" font-size="22" font-weight="900"
        text-anchor="middle" fill="#fdf6e3" letter-spacing="3">ONEPIECEDLE</text>
</svg>`;

async function main() {
  await mkdir("public", { recursive: true });
  for (const size of [192, 512]) {
    const buf = await sharp(Buffer.from(svg)).resize(size, size).png({ quality: 90 }).toBuffer();
    await writeFile(`public/icon-${size}.png`, buf);
    console.log(`wrote icon-${size}.png (${buf.length} bytes)`);
  }
  const appleBuf = await sharp(Buffer.from(svg)).resize(180, 180).png().toBuffer();
  await writeFile("public/apple-icon.png", appleBuf);
  console.log(`wrote apple-icon.png (${appleBuf.length} bytes)`);
  const favBuf = await sharp(Buffer.from(svg)).resize(64, 64).png().toBuffer();
  await writeFile("public/favicon.png", favBuf);
  console.log(`wrote favicon.png (${favBuf.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
