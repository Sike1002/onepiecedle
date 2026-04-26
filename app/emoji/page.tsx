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

const TILE_ROTATIONS = ["-4deg", "3deg", "-2deg", "5deg", "-3deg", "2deg"];

export default function EmojiPage() {
  return (
    <Suspense fallback={null}>
      <EmojiContent />
    </Suspense>
  );
}

function EmojiContent() {
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
  } = useModeGameState("emoji");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const answer = useMemo(() => getDailyCharacter("emoji", targetDate), [targetKey]);

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
  const visible = solved || revealed ? 6 : Math.min(6, 4 + wrongCount);

  const excluded = useMemo(() => new Set(guessIds), [guessIds]);
  const suggestions = useTypeahead(query, excluded, typeaheadPoolFor("emoji"));
  useEffect(() => setHighlight(0), [query]);

  const { copied, copy } = useShareAction();

  function doGuess(ch: OnePieceCharacter) {
    if (solved || guessIds.includes(ch.id)) return;
    recordGuess(ch.id);
    if (ch.id === answer.id) {
      recordWin();
      setAnnounce(`Solved! ${ch.name}.`);
    } else {
      setAnnounce(`${ch.name} — not the answer. One more emoji clue unlocked.`);
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
    return buildShareText({
      mode: "emoji",
      date: targetDate,
      guesses: guesses.length,
      grid: answer.emojis.slice(0, 4).join(""),
      modifiers: practiceMode ? ["Archive"] : [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, guesses, answer, targetKey, practiceMode]);

  const remaining = 6 - visible;

  return (
    <div className="game-root">
      <svg
        className="splat"
        style={{ top: "100px", left: "-20px", width: "150px", height: "150px", opacity: 0.2 }}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path d="M50 8 L58 28 L78 22 L70 42 L92 48 L72 58 L82 78 L60 70 L54 92 L44 72 L22 82 L28 60 L8 50 L28 42 L20 22 L42 30 Z" />
      </svg>
      <div className="cloud c1" />
      <div className="cloud c2" />

      <ModeHeader
        title="Emoji"
        streak={stats?.streak ?? 0}
        rightMeta="4 of 6 clues start visible"
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

        <section className="clue halftone-r" style={{ textAlign: "center" }} aria-label="Emoji clue">
          <div className="emoji-row">
            {answer.emojis.slice(0, visible).map((e, i) => (
              <span
                key={`e-${i}`}
                className="emoji-tile"
                style={{ ["--r" as string]: TILE_ROTATIONS[i] ?? "0deg" } as React.CSSProperties}
              >
                {e}
              </span>
            ))}
            {Array.from({ length: remaining }).map((_, i) => (
              <span
                key={`q-${i}`}
                className="emoji-tile locked"
                style={{ ["--r" as string]: TILE_ROTATIONS[visible + i] ?? "0deg" } as React.CSSProperties}
              >
                ?
              </span>
            ))}
          </div>
          <div className="emoji-hint">
            {visible === 6
              ? "All 6 clues unlocked."
              : `${remaining} more clue${remaining === 1 ? "" : "s"} unlock with wrong guesses.`}
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
              placeholder="Read the emojis…"
              aria-label="Read the emojis"
              aria-autocomplete="list"
              autoFocus
            />
            <SuggestionsList
              suggestions={suggestions}
              highlight={highlight}
              onHover={setHighlight}
              onPick={doGuess}
            />
            <div className="guess-hint">Each wrong guess unlocks one more emoji clue.</div>
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
          id="emoji-how-t"
          paragraphs={[
            "Six emojis describe a character. You see <b>4</b> to start.",
            "Each wrong guess unlocks one more emoji, up to 6. Solve on as few as possible.",
          ]}
        />
      )}
    </div>
  );
}
