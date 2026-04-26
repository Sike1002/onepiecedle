"use client";

import { X } from "lucide-react";
import { GUESS_BUCKETS, type ModeStats } from "@/lib/streak";

export function StatsModal({ stats, onClose }: { stats: ModeStats; onClose: () => void }) {
  const winPct = stats.totalPlayed === 0 ? 0 : Math.round((stats.totalWon / stats.totalPlayed) * 100);
  const maxBucket = Math.max(1, ...stats.guessDistribution);
  const totalWins = stats.guessDistribution.reduce((a, b) => a + b, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-surface border-4 border-black shadow-comic-primary p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-muted hover:text-ink"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="wordmark text-3xl text-primary mb-4">Stats</h2>
        <div className="grid grid-cols-2 gap-3 text-center">
          <Stat label="Streak" value={stats.streak} accent="blood" />
          <Stat label="Best" value={stats.bestStreak} accent="primary" />
          <Stat label="Played" value={stats.totalPlayed} />
          <Stat label="Win %" value={`${winPct}`} suffix="%" />
        </div>

        <h3 className="wordmark text-lg text-primary mt-6 mb-2">Guess distribution</h3>
        {totalWins === 0 ? (
          <p className="text-xs text-muted italic">No wins yet — solve a puzzle to see stats.</p>
        ) : (
          <ul className="space-y-1" aria-label="Guess distribution">
            {GUESS_BUCKETS.map((b, i) => {
              const count = stats.guessDistribution[i] ?? 0;
              const pct = Math.round((count / maxBucket) * 100);
              return (
                <li
                  key={b.label}
                  className="flex items-center gap-2 text-xs font-bold"
                  aria-label={`${count} wins in ${b.label} guesses`}
                >
                  <span className="w-8 text-right text-muted">{b.label}</span>
                  <div className="flex-1 h-5 bg-bg border-2 border-black relative">
                    <div
                      className="h-full bg-primary flex items-center justify-end pr-1 text-black"
                      style={{ width: `${Math.max(6, pct)}%` }}
                    >
                      {count > 0 ? count : ""}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  accent?: "primary" | "blood";
}) {
  const border =
    accent === "primary" ? "shadow-comic-primary" : accent === "blood" ? "shadow-comic-blood" : "shadow-comic";
  return (
    <div className={`bg-bg border-4 border-black ${border} p-3`}>
      <div className="text-3xl font-black">
        {value}
        {suffix}
      </div>
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}
