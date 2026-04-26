"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { characterById } from "@/data/characters";
import { typeaheadPoolFor } from "@/lib/characterPools";
import { getDailyCharacter } from "@/lib/dailyPuzzle";
import type { OnePieceCharacter } from "@/lib/types";
import { useModeGameState } from "@/lib/useModeGameState";
import { useTypeahead } from "@/lib/useTypeahead";
import { useShareAction } from "@/lib/copyShareText";
import { useEscToClose } from "@/lib/useEscToClose";
import { ModeHeader } from "@/components/ModeHeader";
import { SuggestionsList } from "@/components/SuggestionsList";
import { ModeStatsModal, ModeHowToModal } from "@/components/ModeStatsModal";
import { GiveUpButton } from "@/components/GiveUpButton";
import { buildShareText } from "@/lib/shareText";
import "../game-theme.css";

/** Reveal progression. The silhouette layer sits on top of the real portrait;
 * its opacity drops as wrong guesses accumulate, gradually exposing color and
 * facial detail underneath. Stays at 100% (pure shape only) for the first two
 * misses so early guessing depends solely on body proportions and pose. */
function silhouetteOpacityFor(wrong: number): number {
  if (wrong <= 2) return 1;
  if (wrong <= 4) return 0.85;
  if (wrong <= 6) return 0.65;
  if (wrong <= 8) return 0.4;
  if (wrong < 10) return 0.18;
  return 0;
}

export default function SilhouettePage() {
  return (
    <Suspense fallback={null}>
      <SilhouetteContent />
    </Suspense>
  );
}

function SilhouetteContent() {
  const {
    stats,
    guessIds,
    solved,
    revealed,
    recordGuess,
    recordWin,
    recordReveal,
    practiceMode,
    targetDate,
    targetKey,
  } = useModeGameState("silhouette");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const answer = useMemo(() => getDailyCharacter("silhouette", targetDate), [targetKey]);

  const [announce, setAnnounce] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEscToClose(setShowStats, setShowHow);

  const guesses = guessIds
    .map((id) => characterById[id])
    .filter((c): c is OnePieceCharacter => Boolean(c));
  const wrongCount = guesses.filter((g) => g.id !== answer.id).length;
  const silhouetteOpacity = solved || revealed ? 0 : silhouetteOpacityFor(wrongCount);
  const revealPct = Math.round((1 - silhouetteOpacity) * 100);
  const silhouetteUrl = `/silhouettes/${answer.id}.webp`;

  const excluded = useMemo(() => new Set(guessIds), [guessIds]);
  const suggestions = useTypeahead(query, excluded, typeaheadPoolFor("silhouette"));
  useEffect(() => setHighlight(0), [query]);

  const { copied, copy } = useShareAction();

  function doGuess(ch: OnePieceCharacter) {
    if (solved || guessIds.includes(ch.id)) return;
    recordGuess(ch.id);
    if (ch.id === answer.id) {
      recordWin();
      setAnnounce(`Solved! ${ch.name}.`);
    } else {
      setAnnounce(`${ch.name} — not the answer. Silhouette fades a little.`);
    }
    setQuery("");
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      doGuess(suggestions[highlight]);
    }
  }

  const shareText = useMemo(() => {
    if (!solved) return "";
    const bars = "⬛".repeat(Math.max(0, guesses.length - 1)) + "🟨";
    return buildShareText({
      mode: "silhouette",
      date: targetDate,
      guesses: guesses.length,
      grid: bars,
      modifiers: practiceMode ? ["Archive"] : [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, guesses, targetKey, practiceMode]);

  return (
    <div className="game-root">
      <svg
        className="splat"
        style={{ top: "120px", right: "-30px", width: "160px", height: "160px", opacity: 0.22 }}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path d="M50 8 L58 28 L78 22 L70 42 L92 48 L72 58 L82 78 L60 70 L54 92 L44 72 L22 82 L28 60 L8 50 L28 42 L20 22 L42 30 Z" />
      </svg>
      <div className="cloud c1" />
      <div className="cloud c2" />

      <ModeHeader
        title="Silhouette"
        streak={stats?.streak ?? 0}
        rightMeta="brightens on miss"
        onStats={() => setShowStats(true)}
        onHow={() => setShowHow(true)}
      />

      <main className="wrap">
        <span className="sr-only" role="status" aria-live="polite">
          {announce}
        </span>

        {practiceMode && (
          <div className="practice">
            <span>Archive practice · {targetKey} · streak unaffected</span>
            <Link href="/archive">Back to archive</Link>
          </div>
        )}

        <section className="clue halftone-y sil-wrap" aria-label="Silhouette clue">
          <div className="sil-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="sil-portrait"
              src={answer.portraitUrl}
              alt=""
              aria-hidden="true"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="sil-figure"
              src={silhouetteUrl}
              alt="Mystery silhouette"
              style={{ ["--o" as string]: String(silhouetteOpacity) } as React.CSSProperties}
            />
          </div>
          <div className="sil-meta">
            <span>
              Wrong <span className="n red">{wrongCount}</span>
            </span>
            <span>
              Reveal <span className="n">{revealPct}%</span>
            </span>
          </div>
          <div className="reveal-bar" aria-hidden="true">
            <div className="bar">
              <div
                className="fill"
                style={{ ["--p" as string]: `${revealPct}%` } as React.CSSProperties}
              />
            </div>
            <div className="lbl">
              <span>Dark</span>
              <span>Clear</span>
            </div>
          </div>
        </section>

        {!solved && !revealed && (
          <div className="guess-block">
            <input
              ref={inputRef}
              className="guess-field"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Name the shadow…"
              aria-label="Name the shadow"
              aria-autocomplete="list"
              autoFocus
            />
            <SuggestionsList
              suggestions={suggestions}
              highlight={highlight}
              onHover={setHighlight}
              onPick={doGuess}
            />
            <div className="guess-hint">
              Pure shape only — the silhouette <b>fades</b> a little with each wrong guess.
            </div>
            <GiveUpButton
              onReveal={() => {
                recordReveal();
                setAnnounce(`Answer: ${answer.name}.`);
              }}
              practiceMode={practiceMode}
            />
          </div>
        )}

        {guesses.length > 0 && (
          <ul className="guess-list" aria-label="Past guesses">
            {guesses
              .slice()
              .reverse()
              .map((g) => {
                const isAnswer = g.id === answer.id;
                return (
                  <li key={g.id} className={isAnswer ? "correct" : ""}>
                    <div className="list-avatar">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.portraitUrl} alt="" width={36} height={36} loading="lazy" />
                    </div>
                    <div className="nm">{g.name}</div>
                  </li>
                );
              })}
          </ul>
        )}

        {revealed && !solved && (
          <section className="win" aria-label="Answer revealed">
            <span className="burst" style={{ background: "var(--blood)", color: "#fff" }}>
              REVEALED
            </span>
            <div className="who">
              <div className="win-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={answer.portraitUrl} alt="" width={82} height={82} />
              </div>
              <div className="info">
                <div className="n">{answer.name}</div>
                <div className="d">
                  {answer.aliases[0] ? `${answer.aliases[0]} · ` : ""}
                  You gave up after{" "}
                  <b>
                    {guesses.length} guess{guesses.length === 1 ? "" : "es"}
                  </b>
                  .
                </div>
                {!practiceMode && (
                  <div className="d" style={{ color: "var(--blood)", marginTop: "2px" }}>
                    Streak reset.
                  </div>
                )}
              </div>
            </div>
            <div className="actions">
              <Link className="btn" href="/">
                Back to modes
              </Link>
            </div>
          </section>
        )}

        {solved && (
          <section className="win" aria-label="Solved">
            <span className="burst">SOLVED!</span>
            <div className="who">
              <div className="win-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={answer.portraitUrl} alt="" width={82} height={82} />
              </div>
              <div className="info">
                <div className="n">{answer.name}</div>
                <div className="d">
                  {answer.aliases[0] ? `${answer.aliases[0]} · ` : ""}Solved in{" "}
                  <b>
                    {guesses.length} guess{guesses.length === 1 ? "" : "es"}
                  </b>
                </div>
              </div>
            </div>
            <div className="share-grid" aria-label="Share grid">
              <pre>{shareText}</pre>
            </div>
            <div className="actions">
              <button
                className="btn primary"
                type="button"
                onClick={() => copy(shareText)}
              >
                {copied ? "Copied!" : "Copy result"}
              </button>
              <Link className="btn" href="/">
                Back to modes
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="bar">
        <p>
          <b>Onepiecedle</b> is an unofficial fan project. Fair-use, non-commercial.
        </p>
      </footer>

      {showStats && <ModeStatsModal stats={stats} onClose={() => setShowStats(false)} />}
      {showHow && (
        <ModeHowToModal
          onClose={() => setShowHow(false)}
          id="sil-how-t"
          paragraphs={[
            "Only the silhouette — body, pose, and proportions. No face, no costume color, no logo.",
            "The shape stays solid for the first two misses. After that, every wrong guess fades the silhouette a little, slowly leaking color and detail underneath. By the 10th wrong guess the portrait is fully exposed.",
          ]}
        />
      )}
    </div>
  );
}
