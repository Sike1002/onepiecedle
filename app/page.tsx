"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useState } from "react";
import { normalPool } from "@/lib/characterPools";
import { loadStats, type ModeStats } from "@/lib/streak";
import { useSpoilerAck } from "@/lib/spoilerAck";
import { getHardWins, hasBadge, BADGE_THRESHOLD } from "@/lib/hardMode";
import type { GameMode } from "@/lib/types";
import { useCountdown } from "@/lib/useCountdown";
import { useClientDateLabel } from "@/lib/useClientDateLabel";
import "./home.css";

interface ModeCard {
  mode: GameMode;
  title: string;
  description: string;
  href: string;
  accent: "blue" | "yellow" | "blood";
  corner?: string;
  Icon: () => JSX.Element;
}

const IconGrid = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IconQuote = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M7 7h4v4H7zM13 7h4v4h-4zM7 13c0 3 2 5 4 5M13 13c0 3 2 5 4 5" />
  </svg>
);
const IconMoon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  </svg>
);
const IconSmile = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 10h.01M16 10h.01M8 15c1.2 1.2 2.6 1.8 4 1.8s2.8-.6 4-1.8" />
  </svg>
);
const IconFruit = () => (
  // Devil Fruit — round fruit with curling stem swirls
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M12 4 C8 8 6 11 6 15 C6 19 9 22 12 22 C15 22 18 19 18 15 C18 11 16 8 12 4 Z" />
    <path d="M9 12 Q12 9 15 12" />
    <path d="M10 16 Q12 14 14 16" />
  </svg>
);
const IconBook = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4zM4 16h16" />
  </svg>
);

const MODES: ModeCard[] = [
  {
    mode: "classic",
    title: "Classic",
    description: "Guess by attribute — 8 columns, green for exact.",
    href: "/classic",
    accent: "yellow",
    Icon: IconGrid,
  },
  {
    mode: "quote",
    title: "Quote",
    description: "Who said that? One line, one guess at a time.",
    href: "/quote",
    accent: "blood",
    corner: "Hot",
    Icon: IconQuote,
  },
  {
    mode: "silhouette",
    title: "Silhouette",
    description: "Name the shadow. Details sharpen each round.",
    href: "/silhouette",
    accent: "blue",
    corner: "New",
    Icon: IconMoon,
  },
  {
    mode: "emoji",
    title: "Emoji",
    description: "Read the emojis. Miss a guess, unlock a clue.",
    href: "/emoji",
    accent: "yellow",
    Icon: IconSmile,
  },
  {
    mode: "devilfruit",
    title: "Devil Fruit",
    description: "Match the ability profile to its eater.",
    href: "/devilfruit",
    accent: "blood",
    Icon: IconFruit,
  },
  {
    mode: "deepcut",
    title: "Deep-Cut",
    description: "Manga-only answers. Spoiler-gated.",
    href: "/deepcut",
    accent: "blue",
    corner: "🔒 Spoiler",
    Icon: IconBook,
  },
];

/** Normal (non-deepcut) modes, in priority order for the 'Continue' CTA. */
const PRIMARY_MODE_ORDER: GameMode[] = ["classic", "quote", "silhouette", "emoji", "devilfruit"];

function titleFor(mode: GameMode): string {
  return MODES.find((m) => m.mode === mode)?.title ?? "Classic";
}
function hrefFor(mode: GameMode): string {
  return MODES.find((m) => m.mode === mode)?.href ?? "/classic";
}

export default function Home() {
  const countdown = useCountdown();
  const today = useClientDateLabel();
  const characterCount = normalPool.length;
  const [modeStats, setModeStats] = useState<Partial<Record<GameMode, ModeStats>>>({});
  const [pirateKingBadge, setPirateKingBadge] = useState<{ unlocked: boolean; wins: number } | null>(null);
  const { ack: spoilerAck } = useSpoilerAck();

  useEffect(() => {
    const s: Partial<Record<GameMode, ModeStats>> = {};
    for (const m of MODES) s[m.mode] = loadStats(m.mode);
    setModeStats(s);
    setPirateKingBadge({ unlocked: hasBadge(), wins: getHardWins() });
  }, []);

  /** Pick the primary CTA target: prefer the leftmost unfinished normal mode,
   * fall back to Classic if all solved or stats not loaded yet. */
  const primary = (() => {
    for (const mode of PRIMARY_MODE_ORDER) {
      const s = modeStats[mode];
      if (s && !s.solved) return { mode, label: `Continue ${titleFor(mode)} →`, href: hrefFor(mode) };
    }
    return { mode: "classic" as GameMode, label: "Play Classic →", href: "/classic" };
  })();

  return (
    <div className="home-root">
      {/* Decorative red splatter in the top-right corner — wanted-poster ink */}
      <svg
        className="splat"
        style={{ top: "-30px", right: "-40px", width: "220px", height: "220px", opacity: 0.85 }}
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <path d="M100 10 L120 55 L170 40 L140 85 L185 110 L135 120 L150 170 L100 135 L50 170 L60 120 L15 100 L55 85 L30 35 L80 55 Z" />
      </svg>
      <div className="cloud c1" />
      <div className="cloud c2" />
      <div className="cloud c3" />

      <div className="wrap">
        <div className="top">
          <div className="brand">
            <span className="brand-mark">☠</span>
            <span>Onepiecedle</span>
          </div>
          <div className="top-right">
            <span className="pill">
              <span className="dot" />
              Daily{today ? ` · ${today}` : ""}
            </span>
            <Link href="/archive" className="pill">
              Archive
            </Link>
          </div>
        </div>

        <section className="hero">
          <div className="hero-left" aria-hidden="true">
            <div className="char-panel">
              {/* Sun-ray burst behind the captain */}
              <svg className="rays" viewBox="-100 -100 200 200" aria-hidden="true">
                <g fill="#f4d35e" opacity="0.6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <polygon
                      key={i}
                      points="0,-95 6,-30 -6,-30"
                      transform={`rotate(${i * 30})`}
                    />
                  ))}
                </g>
              </svg>

              {/* Stylised Luffy hero — see scripts/gen-hero-image.ts. Replace
                  with a sourced portrait at /characters/luffy-hero.webp later. */}
              <img
                className="char-img"
                src="/characters/luffy-hero.webp"
                alt="Monkey D. Luffy, the future Pirate King"
                width={445}
                height={1100}
                loading="eager"
                decoding="async"
              />

              <div className="shadow-ground" />

              <div className="char-tag">YOSH!</div>
              <div className="char-tag-2">Daily pirate drop</div>
            </div>
          </div>

          <div className="hero-right">
            <span className="kicker">Daily pirate-guessing game</span>
            <h1 className="title">
              <span className="a">ONEPIECE</span>
              <span className="b">DLE</span>
            </h1>
            <p className="sub">
              Guess the <b>One Piece</b> character. Six modes. One new puzzle every midnight.
              Built by fans, streaks tracked locally, no ads.
            </p>

            <div className="hero-cta">
              <Link className="btn primary" href={primary.href}>
                {primary.label}
              </Link>
              <a className="btn ghost" href="#modes">
                See all modes
              </a>
            </div>

            <div className="meta">
              <div className="chip">
                <b>{characterCount}</b>
                <span>pirates</span>
              </div>
              <div className="chip">
                <b>6</b>
                <span>modes</span>
              </div>
              <div className="chip">
                <b>{countdown}</b>
                <span>until reset</span>
              </div>
            </div>
          </div>
        </section>

        <section className="modes-wrap" id="modes">
          <div className="modes-head">
            <h2>Pick your mode</h2>
            <span className="note">One puzzle per mode, per day</span>
          </div>

          <div className="modes">
            {MODES.map((m) => {
              const s = modeStats[m.mode];
              const isGated = m.mode === "deepcut" && spoilerAck !== true;
              const statusLine = (() => {
                if (isGated) return "🔒 Spoiler-gated · tap to acknowledge";
                if (!s) return null;
                if (s.solved) {
                  const n = s.guesses.length;
                  return `Solved in ${n} ${n === 1 ? "guess" : "guesses"}`;
                }
                if (s.guesses.length > 0) {
                  const n = s.guesses.length;
                  return `${n} guess${n === 1 ? "" : "es"} so far`;
                }
                return "Not started today";
              })();
              const streakChip = !isGated && s && s.streak > 0 ? `🔥 ${s.streak}` : null;
              return (
                <Link key={m.title} href={m.href} className={`mode ${m.accent}`}>
                  {m.corner && <span className="corner">{m.corner}</span>}
                  <div className="icon">
                    <m.Icon />
                  </div>
                  <div className="t">{m.title}</div>
                  <div className="d">{m.description}</div>
                  <div className="mode-status">
                    <span className="status-line">{statusLine ?? " "}</span>
                    {streakChip && <span className="streak-chip">{streakChip}</span>}
                    {m.mode === "classic" && pirateKingBadge?.unlocked && !isGated && (
                      <span
                        className="streak-chip"
                        style={{ background: "var(--ink)", color: "var(--yellow)" }}
                        title={`Earned after ${BADGE_THRESHOLD} Pirate King Mode wins`}
                      >
                        👑 Pirate King
                      </span>
                    )}
                  </div>
                  <div className="go">
                    Play <span>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="bar">
        <p>
          <b>Onepiecedle</b> is an unofficial fan project. Not affiliated with Eiichiro Oda,
          Shueisha, Toei Animation, or any official One Piece rights holder. Character references
          used under fair-use for transformative fan commentary. No monetization.
        </p>
      </footer>
    </div>
  );
}
