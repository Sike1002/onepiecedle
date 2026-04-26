"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { normalPool } from "@/lib/characterPools";
import { getDailyCharacter, localDateKey } from "@/lib/dailyPuzzle";
import { useSpoilerAck } from "@/lib/spoilerAck";
import type { GameMode, OnePieceCharacter } from "@/lib/types";
import { HalftoneBg } from "@/components/HalftoneBg";

const DAYS = 14;

type ArchiveMode = Extract<GameMode, "classic" | "quote" | "silhouette" | "emoji" | "devilfruit" | "deepcut">;

const TABS: { mode: ArchiveMode; label: string }[] = [
  { mode: "classic", label: "Classic" },
  { mode: "quote", label: "Quote" },
  { mode: "silhouette", label: "Silhouette" },
  { mode: "emoji", label: "Emoji" },
  { mode: "devilfruit", label: "Devil Fruit" },
  { mode: "deepcut", label: "Deep-Cut" },
];

interface DayEntry {
  date: Date;
  key: string;
  answer: OnePieceCharacter;
  label: string;
}

function dateNDaysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function humanDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", weekday: "short" });
}

export default function ArchivePage() {
  const [mode, setMode] = useState<ArchiveMode>("classic");
  const [days, setDays] = useState<DayEntry[]>([]);
  const { ack: spoilerAck } = useSpoilerAck();

  useEffect(() => {
    const computed = Array.from({ length: DAYS }, (_, i) => {
      const d = dateNDaysAgo(i);
      const label = i === 0 ? "Today" : i === 1 ? "Yesterday" : humanDate(d);
      return { date: d, key: localDateKey(d), answer: getDailyCharacter(mode, d), label };
    });
    setDays(computed);
  }, [mode]);

  const isDeepcut = mode === "deepcut";
  const gated = isDeepcut && spoilerAck !== true;
  const poolSize = isDeepcut ? "—" : String(normalPool.length);

  return (
    <HalftoneBg>
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 bg-bg border-b-2 border-border">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link
              href="/"
              className="p-2 border-2 border-black bg-surface shadow-comic-sm hover:translate-y-[-2px] transition"
              aria-label="Back to menu"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1">
              <div className="wordmark text-xl md:text-2xl text-primary">Archive</div>
              <div className="text-[10px] md:text-xs text-muted">
                Last {DAYS} days · replay for practice (no streak)
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Mode filter chip row */}
          <ul className="flex flex-wrap gap-2 mb-4" aria-label="Pick a mode">
            {TABS.map((t) => (
              <li key={t.mode}>
                <button
                  type="button"
                  onClick={() => setMode(t.mode)}
                  aria-pressed={mode === t.mode}
                  className={`px-3 py-1.5 border-2 border-black text-[11px] font-black uppercase tracking-wider transition ${
                    mode === t.mode
                      ? "bg-primary text-black shadow-comic-sm"
                      : "bg-surface text-muted hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted mb-4">
            {gated ? (
              <>
                <b>Deep-Cut</b> archive is spoiler-gated. Acknowledge the warning from{" "}
                <Link href="/deepcut" className="underline">/deepcut</Link> first.
              </>
            ) : (
              <>
                Practicing an archived puzzle doesn&apos;t affect your streak or stats.
                {!isDeepcut && <> Pool size: {poolSize} anime-safe pirates.</>}
              </>
            )}
          </p>

          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {days.length === 0 || gated
              ? Array.from({ length: DAYS }).map((_, i) => (
                  <li key={`ph-${i}`}>
                    <div className="block bg-surface border-4 border-black shadow-comic-primary p-3 opacity-40">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 border-2 border-black bg-bg" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase tracking-wide text-muted">
                            {gated ? "🔒 gated" : "—"}
                          </div>
                          <div className="wordmark text-base text-ink leading-tight truncate">
                            ??? ???
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              : days.map(({ key, answer, label }) => (
                  <li key={key}>
                    <Link
                      href={`/${mode}?date=${key}`}
                      className="block bg-surface border-4 border-black shadow-comic-primary p-3 hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <CharacterAvatar character={answer} size={48} silhouette brightness={0} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase tracking-wide text-muted">
                            {label}
                          </div>
                          <div className="wordmark text-base text-ink leading-tight truncate">
                            ??? ???
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
          </ul>
        </main>
      </div>
    </HalftoneBg>
  );
}
