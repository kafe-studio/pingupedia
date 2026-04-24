#!/usr/bin/env node
// Commons image pipeline: pro zadany druh stahne N novych fotek z Wikimedia Commons
// z kategorie odpovidajici vedeckemu jmenu, validuje licenci, extrahuje
// autorstvi/URL a pripoji do frontmatter MD + ulozi JPEG do src/assets/penguins/<slug>/.
//
// Usage:
//   node scripts/fetch-commons-images.mjs <slug> [count=10]
//   node scripts/fetch-commons-images.mjs --all [count=10]
//
// Predpoklady: node 20+. Zadne npm balicky nejsou potreba krome uz-nainstalovaneho `yaml`.

import fs from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const SPECIES_DIR = path.resolve("src/content/species");
const ASSETS_DIR = path.resolve("src/assets/penguins");
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "pingupedia-image-fetcher/1.0 (kacirek.jiri@gmail.com)";
const TARGET_WIDTH = 1280;
const MAX_PER_AUTHOR = 2;

const ACCEPTED_LICENSE_PATTERNS = [
  /^cc[ -]by(?:[ -]sa)?([ -][0-9.]+)?$/i,
  /^cc0/i,
  /public domain/i,
  /^pd/i,
];

// Skip infografiky, mapy, ilustrace, kresby, diagramy — chceme jen fotky.
const INFOGRAPHIC_WORDS = [
  "map", "distribution", "range", "chart", "diagram", "graph",
  "illustration", "drawing", "painting", "sketch", "silhouette",
  "infographic", "logo", "taxonomy", "phylogenetic", "cladogram",
  "karte", "carte", "reparition", "répartition", "verbreitung",
];

// --- Commons API helpers ---------------------------------------------------

async function commonsApi(params) {
  const url = new URL(COMMONS_API);
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Commons API ${res.status}: ${url}`);
  return res.json();
}

async function listCategoryImages(categoryTitle, limit = 500) {
  const data = await commonsApi({
    action: "query",
    list: "categorymembers",
    cmtitle: `Category:${categoryTitle}`,
    cmtype: "file",
    cmlimit: limit,
  });
  return data?.query?.categorymembers || [];
}

async function listSubcategories(categoryTitle, limit = 50) {
  const data = await commonsApi({
    action: "query",
    list: "categorymembers",
    cmtitle: `Category:${categoryTitle}`,
    cmtype: "subcat",
    cmlimit: limit,
  });
  return (data?.query?.categorymembers || []).map((m) =>
    m.title.replace(/^Category:/, ""),
  );
}

async function gatherImageTitles(categoryTitle) {
  const seen = new Set();
  const result = [];
  // Main category first.
  for (const m of await listCategoryImages(categoryTitle)) {
    if (seen.has(m.title)) continue;
    seen.add(m.title);
    result.push(m);
  }
  // Subcategories (shallow, 1 level).
  const subs = await listSubcategories(categoryTitle);
  for (const sub of subs) {
    try {
      for (const m of await listCategoryImages(sub)) {
        if (seen.has(m.title)) continue;
        seen.add(m.title);
        result.push(m);
      }
    } catch {
      // ignore single-sub failures
    }
  }
  return result;
}

async function getImageInfo(title) {
  const data = await commonsApi({
    action: "query",
    prop: "imageinfo",
    titles: title,
    iiprop: "url|extmetadata|mime|size",
    iiurlwidth: TARGET_WIDTH,
  });
  const page = data?.query?.pages?.[0];
  return page?.imageinfo?.[0] ?? null;
}

// --- Metadata extrakce -----------------------------------------------------

function stripHtml(s) {
  if (!s) return "";
  return String(s)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLicense(imageinfo) {
  const em = imageinfo.extmetadata ?? {};
  const raw = stripHtml(em.LicenseShortName?.value);
  return raw.replace(/\s+/g, " ").trim();
}

function isAcceptedLicense(name) {
  if (!name) return false;
  const normalized = name.trim();
  return ACCEPTED_LICENSE_PATTERNS.some((re) => re.test(normalized));
}

function extractAuthor(imageinfo) {
  const em = imageinfo.extmetadata ?? {};
  const raw = stripHtml(em.Artist?.value);
  if (!raw) return "Unknown (Wikimedia Commons)";
  // Max 80 chars
  return raw.length > 80 ? raw.slice(0, 77) + "…" : raw;
}

function extractDescription(imageinfo) {
  const em = imageinfo.extmetadata ?? {};
  const candidates = [em.ImageDescription?.value, em.ObjectName?.value];
  for (const c of candidates) {
    const s = stripHtml(c);
    if (s && s.length > 5) return s.length > 140 ? s.slice(0, 137) + "…" : s;
  }
  return "";
}

function isRasterImage(imageinfo) {
  const mime = imageinfo.mime ?? "";
  return mime === "image/jpeg" || mime === "image/png";
}

function looksLikeInfographic(title, description) {
  const haystack = (title + " " + description).toLowerCase();
  return INFOGRAPHIC_WORDS.some((w) => haystack.includes(w));
}

// --- Frontmatter MD helpers ------------------------------------------------

const FRONTMATTER_RE = /^---\r?\n([\s\S]+?)\r?\n---\r?\n?([\s\S]*)$/;

async function readSpeciesMd(slug) {
  const file = path.join(SPECIES_DIR, `${slug}.md`);
  const raw = await fs.readFile(file, "utf8");
  const m = raw.match(FRONTMATTER_RE);
  if (!m) throw new Error(`No frontmatter in ${file}`);
  const data = parseYaml(m[1]);
  return { file, data, body: m[2] };
}

async function writeSpeciesMd(file, data, body) {
  const yaml = stringifyYaml(data, {
    lineWidth: 0,
    defaultStringType: "QUOTE_DOUBLE",
    defaultKeyType: "PLAIN",
  });
  const out = `---\n${yaml}---\n${body}`;
  await fs.writeFile(file, out, "utf8");
}

// --- Image download --------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function downloadImage(url, destPath, attempt = 1) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (res.status === 429 || res.status === 503) {
    if (attempt > 4) throw new Error(`Download ${res.status} after retries: ${url}`);
    const wait = 2000 * attempt;
    console.log(`   ⏳ ${res.status}, retry in ${wait}ms (attempt ${attempt})`);
    await sleep(wait);
    return downloadImage(url, destPath, attempt + 1);
  }
  if (!res.ok) throw new Error(`Download ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buf);
  await sleep(600); // throttle between downloads
  return buf.length;
}

// --- Per-species pipeline --------------------------------------------------

async function fetchImagesForSpecies(slug, count) {
  const { file, data, body } = await readSpeciesMd(slug);
  const nameLat = data.nameLat;
  const heroUrl = data.hero?.sourceUrl;
  const existingUrls = new Set(
    (data.gallery ?? []).map((g) => g.sourceUrl).concat(heroUrl ? [heroUrl] : []),
  );

  // Figure out next gallery index
  const existingCount = (data.gallery ?? []).length;
  const startIdx = existingCount + 1;

  console.log(`\n→ ${slug} (${nameLat})  existing gallery: ${existingCount}  target new: ${count}`);

  const candidates = await gatherImageTitles(nameLat);
  console.log(`  Category:${nameLat} (+subcats) — ${candidates.length} files`);

  const added = [];
  const authorCounts = new Map();
  for (const c of candidates) {
    if (added.length >= count) break;
    const title = c.title;
    if (!title.match(/\.(jpe?g|png)$/i)) continue;

    const info = await getImageInfo(title);
    if (!info) continue;
    if (!isRasterImage(info)) continue;

    const license = extractLicense(info);
    if (!isAcceptedLicense(license)) {
      console.log(`   skip ${title} — license: ${license}`);
      continue;
    }
    const description = extractDescription(info);
    if (looksLikeInfographic(title, description)) {
      console.log(`   skip ${title} — looks like infographic/map`);
      continue;
    }
    const sourceUrl = info.descriptionurl;
    if (existingUrls.has(sourceUrl)) {
      console.log(`   skip ${title} — already present`);
      continue;
    }
    const author = extractAuthor(info);
    const sameAuthor = authorCounts.get(author) ?? 0;
    if (sameAuthor >= MAX_PER_AUTHOR) {
      console.log(`   skip ${title} — author "${author}" already has ${sameAuthor} photos`);
      continue;
    }
    // Skip video/svg (should already be filtered by regex but just in case)
    const dlUrl = info.thumburl ?? info.url;
    if (!dlUrl) continue;
    // Skip very small images (likely low-quality thumbnails)
    if ((info.width ?? 0) < 800 || (info.height ?? 0) < 500) {
      console.log(`   skip ${title} — too small (${info.width}×${info.height})`);
      continue;
    }

    const idx = startIdx + added.length;
    const destName = `gallery-${idx}.jpg`;
    const destPath = path.join(ASSETS_DIR, slug, destName);

    console.log(`   + ${title} → ${destName}  (${license}, by ${author})`);

    try {
      const bytes = await downloadImage(dlUrl, destPath);
      added.push({
        src: `../../assets/penguins/${slug}/${destName}`,
        alt: description || `${data.nameCs}`,
        author,
        license,
        sourceUrl,
        bytes,
      });
      existingUrls.add(sourceUrl);
      authorCounts.set(author, sameAuthor + 1);
    } catch (err) {
      console.log(`   FAIL ${title}: ${err.message}`);
    }
  }

  if (added.length === 0) {
    console.log(`  no new images for ${slug}`);
    return;
  }

  // Append to frontmatter.gallery and save
  const newGallery = [
    ...(data.gallery ?? []),
    ...added.map(({ bytes: _b, ...rest }) => rest),
  ];
  data.gallery = newGallery;
  await writeSpeciesMd(file, data, body);
  console.log(`  ✓ saved ${slug}.md with +${added.length} new gallery entries`);
}

// --- CLI -------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("usage: fetch-commons-images.mjs <slug|--all> [count=10]");
    process.exit(1);
  }
  const target = args[0];
  const count = parseInt(args[1] ?? "10", 10);

  let slugs;
  if (target === "--all") {
    const files = await fs.readdir(SPECIES_DIR);
    slugs = files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  } else {
    slugs = [target];
  }

  for (const slug of slugs) {
    try {
      await fetchImagesForSpecies(slug, count);
    } catch (err) {
      console.error(`FAIL ${slug}: ${err.stack ?? err.message}`);
    }
  }
}

main().catch((err) => {
  console.error(err.stack ?? err.message);
  process.exit(1);
});
