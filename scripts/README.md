# Invincibledle data pipeline

Run scripts in numbered order. Each writes an artifact to `scripts/data/`, so the pipeline is resumable and debuggable.

```bash
npx tsx scripts/01-discover.ts
npx tsx scripts/02-extract.ts
npx tsx scripts/03-canonicalize.ts
npx tsx scripts/04-images.ts
npx tsx scripts/05-enrich.ts
npx tsx scripts/06-validate.ts
npx tsx scripts/07-emit.ts
```

Or all at once:

```bash
npm run pipeline
```

## Artifacts

- `scripts/data/01-pages.json` — every character page from both wikis
- `scripts/data/01-pages-filtered.json` — 25 Main-tier Phase A targets
- `scripts/data/02-raw.json` — raw infobox + wikitext per character
- `scripts/data/03-canonical.json` — mapped to enum schema; `_needs_review: true` where defaulted
- `scripts/data/03-unmapped.json` — wiki values the canonicalizer didn't recognize
- `scripts/data/04-images.json` — portrait download results (success/fail per id)
- `scripts/data/05-enriched.json` — final record per character, ready to emit
- `scripts/data/cache/{wiki}/{page}.json` — per-request cache, honored across runs

The final outputs are `data/characters.ts` and `data/validation-report.md`.
