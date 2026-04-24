#!/usr/bin/env node
// Pro vsechny species MD: projde gallery[] a pokud je entry ze skriptu
// (src cíli na gallery-N.jpg kde N >= 4), nahradí alt českým generickým
// textem `{nameCs} — fotografie z Wikimedia Commons`.
// Původní ručně napsaný alt pro gallery-1..3 se zachová.

import fs from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const SPECIES_DIR = path.resolve("src/content/species");
const FRONTMATTER_RE = /^---\r?\n([\s\S]+?)\r?\n---\r?\n?([\s\S]*)$/;

async function processFile(file) {
  const raw = await fs.readFile(file, "utf8");
  const m = raw.match(FRONTMATTER_RE);
  if (!m) return;
  const data = parseYaml(m[1]);
  if (!Array.isArray(data.gallery)) return;

  let changed = 0;
  const nameCs = data.nameCs;
  for (const entry of data.gallery) {
    const src = entry.src ?? "";
    const match = src.match(/gallery-(\d+)\.jpg/);
    if (!match) continue;
    const idx = Number(match[1]);
    if (idx < 4) continue;
    const newAlt = `${nameCs} — fotografie z Wikimedia Commons`;
    if (entry.alt !== newAlt) {
      entry.alt = newAlt;
      changed++;
    }
  }

  if (changed === 0) return;

  const yaml = stringifyYaml(data, {
    lineWidth: 0,
    defaultStringType: "QUOTE_DOUBLE",
    defaultKeyType: "PLAIN",
  });
  await fs.writeFile(file, `---\n${yaml}---\n${m[2]}`, "utf8");
  console.log(`✓ ${path.basename(file)}: ${changed} alts updated`);
}

async function main() {
  const files = await fs.readdir(SPECIES_DIR);
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    try {
      await processFile(path.join(SPECIES_DIR, f));
    } catch (err) {
      console.error(`FAIL ${f}: ${err.message}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
