#!/usr/bin/env node
// Re-encode all src/assets/penguins/*/gallery-<N>.jpg where N >= 4 into
// max 1280px width, JPEG quality 82, progressive. Keeps originals sized
// sensibly for Astro image pipeline while trimming git repo weight.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ASSETS_DIR = path.resolve("src/assets/penguins");
const MAX_WIDTH = 1280;
const QUALITY = 82;

async function compressOne(file) {
  const input = await fs.readFile(file);
  const before = input.length;
  const img = sharp(input);
  const meta = await img.metadata();
  const width = meta.width ?? 0;
  const resizeTo = width > MAX_WIDTH ? MAX_WIDTH : width;
  const buf = await img
    .resize({ width: resizeTo, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
    .toBuffer();
  if (buf.length >= before) {
    return { skipped: true, before, after: buf.length };
  }
  await fs.writeFile(file, buf);
  return { skipped: false, before, after: buf.length };
}

async function main() {
  const dirs = await fs.readdir(ASSETS_DIR, { withFileTypes: true });
  let totalBefore = 0, totalAfter = 0, count = 0;
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const slugDir = path.join(ASSETS_DIR, d.name);
    const files = await fs.readdir(slugDir);
    for (const f of files) {
      const m = f.match(/^gallery-(\d+)\.jpg$/);
      if (!m) continue;
      if (Number(m[1]) < 4) continue;
      const file = path.join(slugDir, f);
      try {
        const r = await compressOne(file);
        totalBefore += r.before;
        totalAfter += r.after;
        count++;
        const savedKB = ((r.before - r.after) / 1024).toFixed(0);
        console.log(
          `  ${d.name}/${f}  ${(r.before / 1024).toFixed(0)} → ${(r.after / 1024).toFixed(0)} KB  (-${savedKB} KB)${r.skipped ? " [skip, not smaller]" : ""}`,
        );
      } catch (err) {
        console.error(`FAIL ${file}: ${err.message}`);
      }
    }
  }
  console.log(
    `\n✓ ${count} files  ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(totalAfter / 1024 / 1024).toFixed(1)} MB`,
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
