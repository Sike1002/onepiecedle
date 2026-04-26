"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { characterById } from "@/data/characters";
import { normalPool, typeaheadPoolFor } from "@/lib/characterPools";
import { getDailyCharacter, hashDate } from "@/lib/dailyPuzzle";
import type { OnePieceCharacter } from "@/lib/types";
import { useModeGameState } from "@/lib/useModeGameState";
import { useTypeahead } from "@/lib/useTypeahead";
import { useShareAction } from "@/lib/copyShareText";
import { useEscToClose } from "@/lib/useEscToClose";
import { buildShareText } from "@/lib/shareText";
import { ModeHeader } from "@/components/ModeHeader";
import { SuggestionsList } from "@/components/SuggestionsList";
import { ModeStatsModal, ModeHowToModal } from "@/components/ModeStatsModal";
import { GiveUpButton } from "@/components/GiveUpButton";
import "../game-theme.css";

/** Pick the answer character for today's Quote puzzle, biased toward
 * characters that actually have quotes. */
function pickAnswerWithQuote(date: Date): { answer: OnePieceCharacter; line: string } {
  const fallback = getDailyCharacter("quote", date);
  const pool = normalPool.filter((c) => c.quotes.length > 0);
  const answer = fallback.quotes.length > 0 ? fallback : pool[hashDate(date) % pool.length];
  const line = answer.quotes.length > 0 ? answer.quotes[hashDate(date) % answer.quotes.length] : "…";
  return { answer, line };
}

export default function QuotePage() {
  return (
    <Suspense fallback={null}>
      <QuoteContent />
    </Suspense>
  );
}

function QuoteContent() {
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
    today,
  } = useModeGameState("quote");
  const { answer, line } = useMemo(
    () => pickAnswerWithQuote(targetDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetKey],
  );

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

  const excluded = useMemo(() => new Set(guessIds), [guessIds]);
  const suggestions = useTypeahead(query, excluded, typeaheadPoolFor("quote"));
  useEffect(() => setHighlight(0), [query]);

  const { copied, copy } = useShareAction();

  function doGuess(ch: OnePieceCharacter) {
    if (solved || guessIds.includes(ch.id)) return;
    const s1 = recordGuess(ch.id);
    if (ch.id === answer.id) {
      recordWin();
      setAnnounce(`Solved! ${ch.name} in ${s1.guesses.length} guesses.`);
    } else {
      setAnnounce(`${ch.name} — not the answer.`);
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
    const bars = "🟥".repeat(Math.max(0, guesses.length - 1)) + "🟩";
    return buildShareText({
      mode: "quote",
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
        style={{ top: "120px", left: "-20px", width: "140px", height: "140px", opacity: 0.25 }}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path d="M50 8 L58 28 L78 22 L70 42 L92 48 L72 58 L82 78 L60 70 L54 92 L44 72 L22 82 L28 60 L8 50 L28 42 L20 22 L42 30 Z" />
      </svg>
      <div className="cloud c1" />
      <div className="cloud c2" />

      <ModeHeader
        title="Quote"
        streak={stats?.streak ?? 0}
        targetDate={practiceMode ? targetDate : undefined}
        showReset={!practiceMode}
        rightMeta="only exact speaker wins"
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

        <section className="clue halftone-r" aria-label="Quote clue">
          <span className="quote-mark" aria-hidden="true">
            &ldquo;
          </span>
          <blockquote className="big">&ldquo;{line}&rdquo;</blockquote>
          <div className="quote-attrib">— ??? · Who said it?</div>
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
              placeholder="Guess who said it…"
              aria-label="Guess who said it"
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
              <b>{guesses.length}</b> guess{guesses.length === 1 ? "" : "es"} so far · only{" "}
              <b>exact speaker</b> wins.
              {suggestions.length > 0 && (
                <>
                  {" "}Press <b>↵</b> — <b>↑ ↓</b> to browse.
                </>
              )}
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
          <b>Onepiecedle</b> is an unofficial fan project. Not affiliated with Eiichiro Oda,
          Shueisha, Toei Animation, or any official One Piece rights holder. Character references
          used under fair-use for transformative fan commentary. No monetization.
        </p>
      </footer>

      {showStats && <ModeStatsModal stats={stats} onClose={() => setShowStats(false)} />}
      {showHow && (
        <ModeHowToModal
          onClose={() => setShowHow(false)}
          id="quote-how-t"
          paragraphs={[
            "A single line of dialogue is shown. Name the character who said it.",
            "Unlike Classic, there are no tiered clues — your only hint is the voice on the page.",
            "Streaks count only today&apos;s puzzle. Come back at midnight for a new line.",
          ]}
        />
      )}
    </div>
  );
}
