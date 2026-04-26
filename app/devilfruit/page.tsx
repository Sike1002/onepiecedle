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

const TAG_CLASSES = ["", "y", "r"];

export default function DevilFruitPage() {
  return (
    <Suspense fallback={null}>
      <DevilFruitContent />
    </Suspense>
  );
}

function DevilFruitContent() {
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
  } = useModeGameState("devilfruit");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const answer = useMemo(() => getDailyCharacter("devilfruit", targetDate), [targetKey]);

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
  const suggestions = useTypeahead(query, excluded, typeaheadPoolFor("devilfruit"));
  useEffect(() => setHighlight(0), [query]);

  const { copied, copy } = useShareAction();

  function doGuess(ch: OnePieceCharacter) {
    if (solved || guessIds.includes(ch.id)) return;
    recordGuess(ch.id);
    if (ch.id === answer.id) {
      recordWin();
      setAnnounce(`Solved! ${ch.name}.`);
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
    return buildShareText({
      mode: "devilfruit",
      date: targetDate,
      guesses: guesses.length,
      grid: "",
      modifiers: practiceMode ? ["Archive"] : [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, guesses, targetKey, practiceMode]);

  // Tag chips for the clue card: DF type + named DF + Haki entries.
  const tagChips: string[] = [];
  tagChips.push(answer.devilFruitType);
  if (answer.devilFruitName) tagChips.push(answer.devilFruitName);
  for (const h of answer.haki) {
    if (h !== "None") tagChips.push(`${h} Haki`);
  }

  return (
    <div className="game-root">
      <svg
        className="splat"
        style={{ top: "140px", right: "-20px", width: "150px", height: "150px", opacity: 0.22 }}
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <path d="M50 8 L58 28 L78 22 L70 42 L92 48 L72 58 L82 78 L60 70 L54 92 L44 72 L22 82 L28 60 L8 50 L28 42 L20 22 L42 30 Z" />
      </svg>
      <div className="cloud c1" />
      <div className="cloud c2" />

      <ModeHeader
        title="Devil Fruit"
        streak={stats?.streak ?? 0}
        targetDate={practiceMode ? targetDate : undefined}
        showReset={!practiceMode}
        rightMeta="profile only"
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

        <section className="clue halftone-y" aria-label="Devil Fruit profile">
          <div className="power-head">
            <div className="bolt" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="none"
                stroke="#0b1724"
                strokeWidth="2.5"
                strokeLinejoin="round"
              >
                <path d="M12 2 C8 6 6 9 6 13 C6 17 9 21 12 22 C15 21 18 17 18 13 C18 9 16 6 12 2 Z" />
                <path d="M9 11 Q12 7 15 11" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="power-kicker">Devil Fruit / ability profile</div>
              <p className="power-desc">{answer.powerDescription || "—"}</p>
              <div className="power-tags">
                {tagChips.map((p, i) => (
                  <span key={`${p}-${i}`} className={`power-tag ${TAG_CLASSES[i % TAG_CLASSES.length]}`}>
                    {p}
                  </span>
                ))}
              </div>
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
              placeholder="Match the ability…"
              aria-label="Match the ability"
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
              Only the <b>description + ability tags</b> are revealed. No avatar, no name.
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
          id="devilfruit-how-t"
          paragraphs={[
            "A short description of the character's Devil Fruit / signature ability is shown, along with their tags.",
            "Match it to the pirate. No tiered clues — just the profile.",
          ]}
        />
      )}
    </div>
  );
}
