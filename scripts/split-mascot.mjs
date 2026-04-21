#!/usr/bin/env node
// Split src/assets/mascot/source.png (5×2 grid, 10 poses) into individual PNG files
// with white background flood-filled to transparent.
// Usage: node scripts/split-mascot.mjs
// Requires: sharp (already in dependencies)

import sharp from "sharp";
import { access, mkdir } from "node:fs/promises";
import { join } from "node:path";

const SOURCE = "src/assets/mascot/source.png";
const OUT_DIR = "src/assets/mascot";
const COLS = 5;
const ROWS = 2;
const WHITE_THRESHOLD = 240; // pixels with all channels ≥ this count as background

const POSES = [
  "ahoj", "plave", "detektiv", "cte", "radost",
  "otazka", "palec", "wow", "srdce", "vajicko",
];

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// Flood-fill white background from edges. Mutates `data` in place (RGBA buffer).
function floodFillTransparent(data, W, H) {
  const visited = new Uint8Array(W * H);
  const stack = [];

  const seed = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    stack.push(x, y);
  };

  for (let x = 0; x < W; x++) { seed(x, 0); seed(x, H - 1); }
  for (let y = 0; y < H; y++) { seed(0, y); seed(W - 1, y); }

  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const vi = y * W + x;
    if (visited[vi]) continue;
    const idx = vi * 4;
    if (data[idx] < WHITE_THRESHOLD || data[idx + 1] < WHITE_THRESHOLD || data[idx + 2] < WHITE_THRESHOLD) continue;
    visited[vi] = 1;
    data[idx + 3] = 0; // alpha → 0
    stack.push(x + 1, y);
    stack.push(x - 1, y);
    stack.push(x, y + 1);
    stack.push(x, y - 1);
  }
}

async function extractPose(source, left, top, width, height, outPath) {
  // Extract region, add alpha channel, then flood-fill white BG to transparent.
  const { data, info } = await sharp(source)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  floodFillTransparent(data, info.width, info.height);

  // Rebuild PNG, trim transparent borders.
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

async function main() {
  if (!(await fileExists(SOURCE))) {
    console.error(`✗ Source missing: ${SOURCE}`);
    console.error(`  Save your mascot sheet there, then re-run this script.`);
    process.exit(1);
  }

  const meta = await sharp(SOURCE).metadata();
  if (!meta.width || !meta.height) {
    console.error(`✗ Could not read image dimensions from ${SOURCE}`);
    process.exit(1);
  }

  const cellW = Math.floor(meta.width / COLS);
  const cellH = Math.floor(meta.height / ROWS);
  console.log(`→ Source ${meta.width}×${meta.height}, cell ${cellW}×${cellH}`);

  await mkdir(OUT_DIR, { recursive: true });

  for (let i = 0; i < POSES.length; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const pose = POSES[i];
    const out = join(OUT_DIR, `${pose}.png`);
    await extractPose(SOURCE, col * cellW, row * cellH, cellW, cellH, out);
    console.log(`✓ ${pose.padEnd(10)} [${col},${row}] → ${out}`);
  }

  console.log(`\nDone. ${POSES.length} mascot poses written to ${OUT_DIR}/.`);
}

main().catch((err) => {
  console.error("✗ Split failed:", err.message);
  process.exit(1);
});
