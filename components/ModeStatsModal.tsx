"use client";

import { GUESS_BUCKETS, type ModeStats } from "@/lib/streak";

/** Shared Your-stats modal — dashboard cards + bucket distribution bars.
 * Identical to the 5 inline copies that were each mode page. */
export function ModeStatsModal({
  stats,
  onClose,
}: {
  stats: ModeStats | null;
  onClose: () => void;
}) {
  const s = stats ?? {
    streak: 0,
    bestStreak: 0,
    lastWonDate: null,
    totalPlayed: 0,
    totalWon: 0,
    guesses: [],
    solved: false,
    playDate: "",
    guessDistribution: [0, 0, 0, 0],
  };
  const winPct = s.totalPlayed === 0 ? 0 : Math.round((s.totalWon / s.totalPlayed) * 100);
  const maxBucket = Math.max(1, ...s.guessDistribution);
  return (
    <div className="modal-back open" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>
          Your stats
          <button type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </h3>
        <div className="stats-grid">
          <div className="stat">
            <div className="n">{s.totalPlayed}</div>
            <div className="l">Played</div>
          </div>
          <div className="stat yellow">
            <div className="n">{winPct}%</div>
            <div className="l">Win rate</div>
          </div>
          <div className="stat blood">
            <div className="n">{s.streak}</div>
            <div className="l">Streak</div>
          </div>
          <div className="stat">
            <div className="n">{s.bestStreak}</div>
            <div className="l">Best</div>
          </div>
        </div>
        <div className="dist">
          {GUESS_BUCKETS.map((b, i) => {
            const count = s.guessDistribution[i] ?? 0;
            const pct = Math.round((count / maxBucket) * 100);
            return (
              <div className="drow" key={b.label}>
                <span className="dnum">{b.label}</span>
                <div className="dbar">
                  <div
                    className={`fill ${count > 0 ? "won" : ""}`}
                    style={{ width: `${Math.max(8, pct)}%` }}
                  >
                    {count > 0 ? count : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Shared How-to-play modal. `paragraphs` support inline HTML via
 * dangerouslySetInnerHTML so callers can bold keywords. `footer` renders
 * after the paragraphs (used for e.g. a 'Reset spoiler warning' button). */
export function ModeHowToModal({
  onClose,
  title = "How to play",
  id,
  paragraphs,
  footer,
}: {
  onClose: () => void;
  title?: string;
  id: string;
  paragraphs: string[];
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="modal-back open"
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
      onClick={onClose}
    >
      <div className="modal how" onClick={(e) => e.stopPropagation()}>
        <h3 id={id}>
          {title}
          <button type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </h3>
        {paragraphs.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
        ))}
        {footer}
      </div>
    </div>
  );
}
