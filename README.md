# Onepiecedle

A daily One Piece character-guessing game in the style of Wordle / Loldle.
Six modes — **Classic**, **Quote**, **Silhouette**, **Emoji**, **Devil Fruit**,
**Deep-Cut** — each with its own daily puzzle and streak.

Built with Next.js 14, TypeScript, Tailwind CSS. Static-exportable, no backend.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm run lint
npm run build:static # ./out/
```

## Modes

- **Classic** — guess by 8 attributes (Gender, Race, Crew, Devil Fruit type, Haki, Origin, Status, First Arc).
- **Quote** — name the speaker of one line of dialogue.
- **Silhouette** — name the shadow; it brightens with each wrong guess.
- **Emoji** — read the emojis. Wrong guesses unlock more clues.
- **Devil Fruit** — match a Devil Fruit / ability profile to its eater.
- **Deep-Cut** — manga-only spoilers, gated behind an explicit warning.

## Project structure

```
app/                Next.js App Router pages (one per mode + home + archive)
components/         Shared UI (board, suggestions, modals, header)
lib/                Game logic — types, comparison, daily picker, streak/storage
data/characters.ts  Hand-curated seed of ~50 characters
public/characters/  Portrait WebPs (placeholder for v1)
public/silhouettes/ Generated silhouettes
scripts/            Asset generators (icons, hero, placeholders, silhouettes)
```

## Asset notes

The v1 ships with **placeholder portraits** (initials on a colored disc) so the
game is fully playable. Replace files in `public/characters/{id}.webp` with
real images, then re-run:

```bash
npx tsx scripts/gen-silhouettes.ts
```

The 7-step Fandom-scraping pipeline (`scripts/01-…07-emit.ts`) is copied from
the upstream Invincibledle project as a reference; adapting it to the One
Piece Fandom is a future expansion.

## Credits

- Forked architecture from [Invincibledle](https://github.com/Sike1002/invincibleidle).
- Character data summarised from the [One Piece Fandom](https://onepiece.fandom.com/) under CC BY-SA 3.0.
- Unofficial fan project — no affiliation with Eiichiro Oda, Shueisha, or Toei Animation.
