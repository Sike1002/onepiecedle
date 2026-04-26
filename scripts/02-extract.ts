/**
 * 02-extract — fetch wikitext + infobox + image for each Phase A character.
 * Output: scripts/data/02-raw.json
 */
import type { Tier } from "../lib/types";
import { banner, cachedFetchJson, log, readJson, writeJson } from "./lib/util";
import { parseInfobox } from "./lib/wikitext";

interface Target {
  id: string;
  name: string;
  wiki: string;
  pageTitle: string;
  fallbackPageTitle?: string;
  tier: Tier;
}

interface ParseResponse {
  parse?: { title: string; wikitext: { "*": string }; properties?: unknown };
  error?: { code: string; info: string };
}

interface PageImageResponse {
  query: {
    pages: Record<
      string,
      { title: string; thumbnail?: { source: string; width: number; height: number } }
    >;
  };
}

interface RawRecord {
  id: string;
  name: string;
  wiki: string;
  pageTitle: string;
  pageUrl: string;
  tier: Tier;
  infobox: Record<string, string>;
  wikitextSnippet: string;
  thumbnailUrl: string | null;
}

async function fetchParse(wiki: string, title: string): Promise<ParseResponse> {
  const url = `https://${wiki}/api.php?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&format=json&redirects=1`;
  return cachedFetchJson<ParseResponse>(url, `${wiki}/parse`, title);
}

async function fetchImage(wiki: string, title: string): Promise<string | null> {
  const url = `https://${wiki}/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(title)}&pithumbsize=800&piprop=thumbnail&format=json&redirects=1`;
  const res = await cachedFetchJson<PageImageResponse>(url, `${wiki}/image`, title);
  const page = Object.values(res.query?.pages ?? {})[0];
  return page?.thumbnail?.source ?? null;
}

async function extractOne(t: Target): Promise<RawRecord> {
  const titlesToTry = t.fallbackPageTitle ? [t.pageTitle, t.fallbackPageTitle] : [t.pageTitle];

  let parse: ParseResponse | null = null;
  let tried: string = t.pageTitle;
  for (const title of titlesToTry) {
    try {
      const res = await fetchParse(t.wiki, title);
      if (!res.error) {
        parse = res;
        tried = title;
        break;
      }
    } catch (err) {
      log("02", `  ${t.id}: error on ${title}: ${(err as Error).message}`);
    }
  }

  if (!parse || parse.error || !parse.parse) {
    log("02", `  ${t.id}: NO PAGE FOUND`);
    return {
      id: t.id,
      name: t.name,
      wiki: t.wiki,
      pageTitle: tried,
      pageUrl: `https://${t.wiki}/wiki/${encodeURIComponent(tried)}`,
      tier: t.tier,
      infobox: {},
      wikitextSnippet: "",
      thumbnailUrl: null,
    };
  }

  const actualTitle = parse.parse.title;
  const wikitext = parse.parse.wikitext["*"];
  const infobox = parseInfobox(wikitext);
  let thumbnailUrl: string | null = null;
  try {
    thumbnailUrl = await fetchImage(t.wiki, actualTitle);
  } catch {}

  return {
    id: t.id,
    name: t.name,
    wiki: t.wiki,
    pageTitle: actualTitle,
    pageUrl: `https://${t.wiki}/wiki/${encodeURIComponent(actualTitle)}`,
    tier: t.tier,
    infobox,
    wikitextSnippet: wikitext.slice(0, 2000),
    thumbnailUrl,
  };
}

async function main() {
  banner("Phase 02 — Extract");
  const targets = await readJson<Target[]>("scripts/data/01-pages-filtered.json");
  log("02", `Extracting ${targets.length} characters…`);
  const out: RawRecord[] = [];
  for (const t of targets) {
    try {
      const rec = await extractOne(t);
      const infoboxKeys = Object.keys(rec.infobox).length;
      log("02", `  ${rec.id}: ${infoboxKeys} infobox fields, img=${rec.thumbnailUrl ? "yes" : "no"}`);
      out.push(rec);
    } catch (err) {
      log("02", `  ${t.id}: FAILED — ${(err as Error).message}`);
    }
  }
  await writeJson("scripts/data/02-raw.json", out);

  // Spot-check summary
  const spot = ["mark-grayson", "omni-man", "atom-eve"];
  console.log("\n── Spot check ──");
  for (const id of spot) {
    const r = out.find((x) => x.id === id);
    if (!r) {
      console.log(`  [${id}] MISSING`);
      continue;
    }
    console.log(`  [${id}] ${r.pageUrl}`);
    for (const [k, v] of Object.entries(r.infobox).slice(0, 8)) {
      console.log(`    ${k} = ${v.slice(0, 80)}`);
    }
  }
  console.log("");
  log("02", `Done. ${out.length} raw records → scripts/data/02-raw.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
