"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { characterById } from "@/data/characters";
import { normalPool, typeaheadPoolFor } from "@/lib/characterPools";
import { compareClassic, type ClassicColumnKey } from "@/lib/compareCharacter";
import { getDailyCharacter, localDateKey } from "@/lib/dailyPuzzle";
import { loadStats, recordGuess, recordWin, type ModeStats } from "@/lib/streak";
import { bumpHardWins, hiddenColumns, isHardModeOn, setHardMode } from "@/lib/hardMode";
import { useTypeahead } from "@/lib/useTypeahead";
import { useShareAction } from "@/lib/copyShareText";
import { useEscToClose } from "@/lib/useEscToClose";
import { useSpoilerAck } from "@/lib/spoilerAck";
import { buildShareText } from "@/lib/shareText";
import { ModeHeader } from "./ModeHeader";
import { SuggestionsList } from "./SuggestionsList";
import { ModeStatsModal, ModeHowToModal } from "./ModeStatsModal";
import type { ClassicComparison, GameMode, OnePieceCharacter, MatchResult } from "@/lib/types";
import "../app/game-theme.css";

const EMOJI: Record<MatchResult, string> = { exact: "🟩", partial: "🟨", none: "🟥" };
const HIDDEN_EMOJI = "⬛";

interface Props {
  mode: Extract<GameMode, "classic" | "deepcut">;
  title?: string;
  enableArchive?: boolean;
  poolDescription?: string;
}

function parseDateParam(value: string | null): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setHours(0, 0, 0, 0);
  return d;
}

function shortLabel(s: string): string {
  const map: Record<string, string> = {
    "Straw Hat Pirates": "Straw Hats",
    "Heart Pirates": "Heart",
    "Red Hair Pirates": "Red Hair",
    "Whitebeard Pirates": "Whitebeard",
    "Beasts Pirates": "Beasts",
    "Big Mom Pirates": "Big Mom",
    "Blackbeard Pirates": "Blackbeard",
    "Roger Pirates": "Roger",
    "Don Quixote Pirates": "Don Quixote",
    "Buggy Pirates": "Buggy",
    "Kid Pirates": "Kid",
    "Kuja Pirates": "Kuja",
    "Sun Pirates": "Sun",
    "Revolutionary Army": "Revolution",
    "Seven Warlords": "Warlords",
    "World Government": "Gov.",
    "Cipher Pol": "CP",
    "Wano Samurai": "Wano",
    "Baroque Works": "Baroque",
    "Long-Leg Tribe": "Long-Leg",
    "Long-Arm Tribe": "Long-Arm",
    "Snakeneck Tribe": "Snakeneck",
    "Three-Eye Tribe": "Three-Eye",
    "Mythical Zoan": "Myth Zoan",
    "Ancient Zoan": "Anc. Zoan",
    "Fishman Island": "Fishman I.",
    "East Blue": "E. Blue",
    "West Blue": "W. Blue",
    "North Blue": "N. Blue",
    "South Blue": "S. Blue",
    "Grand Line": "Grand L.",
    "New World": "New W.",
    "Sky Island": "Sky I.",
    "Conqueror's": "Conq.",
    "Observation": "Obs.",
    "Armament": "Arm.",
  };
  return map[s] ?? s;
}

function labelFor(ch: OnePieceCharacter, key: keyof OnePieceCharacter): string {
  const v = ch[key];
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    if (v.length === 1) return shortLabel(String(v[0]));
    return v.map((x) => shortLabel(String(x))).join(" / ");
  }
  return shortLabel(String(v));
}

function arcLabel(arc: OnePieceCharacter["firstArcNumber"]): string {
  if (typeof arc === "number") return `A${arc}`;
  return "Manga";
}

interface CellView {
  key: ClassicColumnKey;
  label: string;
  result: MatchResult;
  arrow?: "up" | "down";
}

function cellsFor(guess: OnePieceCharacter, cmp: ClassicComparison): CellView[] {
  return [
    { key: "gender", label: guess.gender, result: cmp.gender },
    { key: "race", label: labelFor(guess, "race"), result: cmp.race },
    { key: "affiliation", label: labelFor(guess, "affiliation"), result: cmp.affiliation },
    { key: "devilFruitType", label: shortLabel(guess.devilFruitType), result: cmp.devilFruitType },
    { key: "haki", label: labelFor(guess, "haki"), result: cmp.haki },
    { key: "origin", label: shortLabel(guess.origin), result: cmp.origin },
    { key: "status", label: guess.status, result: cmp.status },
    {
      key: "firstArcNumber",
      label: arcLabel(guess.firstArcNumber),
      result: cmp.firstArcNumber.result,
      arrow: cmp.firstArcNumber.direction,
    },
  ];
}

export function ClassicBoard({ mode, title, enableArchive = false, poolDescription }: Props) {
  const sp = useSearchParams();
  const dateParam = enableArchive ? sp.get("date") : null;
  const today = useMemo(() => localDateKey(), []);
  const parsedDate = useMemo(() => parseDateParam(dateParam), [dateParam]);
  const targetDate = parsedDate ?? new Date();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const targetKey = useMemo(() => localDateKey(targetDate), [parsedDate]);
  const practiceMode = targetKey !== today;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const answer = useMemo(() => getDailyCharacter(mode, targetDate), [mode, targetKey]);

  const [stats, setStats] = useState<ModeStats | null>(null);
  const [guessIds, setGuessIds] = useState<string[]>([]);
  const [practiceSolved, setPracticeSolved] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [hard, setHard] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHow, setShowHow] = useState(false);

  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setHard(isHardModeOn()), []);
  useEffect(() => {
    if (practiceMode) {
      setStats(null);
      setGuessIds([]);
      setPracticeSolved(false);
      return;
    }
    const s = loadStats(mode, today);
    setStats(s);
    setGuessIds(s.guesses);
  }, [mode, today, targetKey, practiceMode]);
  useEscToClose(setShowStats, setShowHow);

  const hidden = useMemo<Set<ClassicColumnKey>>(
    () => (hard ? hiddenColumns(targetDate) : new Set()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hard, targetKey],
  );

  const guesses = guessIds
    .map((id) => characterById[id])
    .filter((c): c is OnePieceCharacter => Boolean(c));
  const solved = practiceMode ? practiceSolved : stats?.solved ?? false;

  const excluded = useMemo(() => new Set(guessIds), [guessIds]);
  const typeaheadPool = useMemo(() => typeaheadPoolFor(mode), [mode]);
  const suggestions = useTypeahead(query, excluded, typeaheadPool);
  useEffect(() => setHighlight(0), [query]);

  function doGuess(ch: OnePieceCharacter) {
    if (solved || guessIds.includes(ch.id)) return;
    if (practiceMode) {
      setGuessIds((g) => [...g, ch.id]);
      if (ch.id === answer.id) {
        setPracticeSolved(true);
        setAnnounce(`Solved! ${ch.name} in ${guessIds.length + 1} guesses.`);
      } else {
        setAnnounce(`${ch.name} — not the answer.`);
      }
      setQuery("");
      return;
    }
    const s1 = recordGuess(mode, ch.id, today);
    setGuessIds(s1.guesses);
    setStats(s1);
    if (ch.id === answer.id) {
      const s2 = recordWin(mode, today);
      setStats(s2);
      // Count hard-mode wins toward the Pirate King badge. Only daily wins
      // count — archive practice and reveals do not.
      if (hard && !practiceMode) bumpHardWins();
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

  function toggleHard() {
    if (guesses.length > 0 && !solved) return;
    const next = !hard;
    setHard(next);
    setHardMode(next);
  }

  const shareText = useMemo(() => {
    if (!solved) return "";
    const grid = guesses
      .map((g) => {
        const c = compareClassic(g, answer);
        const cells: string[] = [];
        cells.push(hidden.has("gender") ? HIDDEN_EMOJI : EMOJI[c.gender]);
        cells.push(hidden.has("race") ? HIDDEN_EMOJI : EMOJI[c.race]);
        cells.push(hidden.has("affiliation") ? HIDDEN_EMOJI : EMOJI[c.affiliation]);
        cells.push(hidden.has("devilFruitType") ? HIDDEN_EMOJI : EMOJI[c.devilFruitType]);
        cells.push(hidden.has("haki") ? HIDDEN_EMOJI : EMOJI[c.haki]);
        cells.push(hidden.has("origin") ? HIDDEN_EMOJI : EMOJI[c.origin]);
        cells.push(hidden.has("status") ? HIDDEN_EMOJI : EMOJI[c.status]);
        cells.push(
          hidden.has("firstArcNumber") ? HIDDEN_EMOJI : EMOJI[c.firstArcNumber.result],
        );
        return cells.join("");
      })
      .join("\n");
    const modifiers: string[] = [];
    if (hard) modifiers.push("Pirate King");
    if (practiceMode) modifiers.push("Archive");
    return buildShareText({
      mode,
      date: targetDate,
      guesses: guesses.length,
      grid,
      modifiers,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, guesses, answer, targetKey, practiceMode, hard, hidden, mode]);

  const { copied, copy, share } = useShareAction();
  const shareBody = shareText;

  const shellTitle =
    title ?? (mode === "deepcut" ? "Deep-Cut" : practiceMode ? "Classic · Practice" : "Classic");
  const streakNum = stats?.streak ?? 0;

  const headerKeys: [ClassicColumnKey, string][] = [
    ["gender", "Gender"],
    ["race", "Race"],
    ["affiliation", "Crew"],
    ["devilFruitType", "DF"],
    ["haki", "Haki"],
    ["origin", "Origin"],
    ["status", "Status"],
    ["firstArcNumber", "Arc"],
  ];

  return (
    <div className="game-root">
      <svg
        className="splat"
        style={{ top: "40px", right: "-40px", width: "180px", height: "180px", opacity: 0.7 }}
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <path d="M100 10 L120 55 L170 40 L140 85 L185 110 L135 120 L150 170 L100 135 L50 170 L60 120 L15 100 L55 85 L30 35 L80 55 Z" />
      </svg>
      <div className="cloud c1" />
      <div className="cloud c2" />

      <ModeHeader
        title={shellTitle}
        streak={streakNum}
        targetDate={practiceMode ? targetDate : undefined}
        showReset={!practiceMode}
        rightMeta={mode === "deepcut" ? "manga deep cuts" : `${normalPool.length} pirates`}
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

        <div className="hardrow">
          <button
            id="hard-toggle"
            className={`hardbtn ${hard ? "on" : ""}`}
            aria-pressed={hard}
            onClick={toggleHard}
            disabled={guesses.length > 0 && !solved}
            type="button"
            title={
              guesses.length > 0 && !solved
                ? "Finish this puzzle before toggling"
                : "Pirate King Mode hides 3 of 8 attributes"
            }
          >
            {hard ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Pirate King Mode {hard ? "ON" : "OFF"}</span>
          </button>
          <span className="hardnote">
            {hard ? "3 attributes hidden today" : "All 8 attributes visible"}
          </span>
        </div>

        {!solved && (
          <div className="guess-block">
            <input
              ref={inputRef}
              className="guess-field"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Guess a pirate…"
              aria-label="Guess a pirate"
              aria-autocomplete="list"

              disabled={solved}
              autoFocus
            />

            <SuggestionsList
              suggestions={suggestions}
              highlight={highlight}
              onHover={setHighlight}
              onPick={doGuess}
            />

            <div className="guess-hint">
              {guesses.length === 0
                ? (poolDescription ?? `${typeaheadPool.length} pirates to pick from.`)
                : `${guesses.length} guess${guesses.length === 1 ? "" : "es"} so far.`}
              {suggestions.length > 0 && (
                <>
                  {" "}Press <b>↵</b> to lock it in — <b>↑ ↓</b> to browse.
                </>
              )}
            </div>
          </div>
        )}

        <div className="legend" aria-label="Legend">
          <span>Legend:</span>
          <span className="swatch">
            <span className="box ex" />
            Exact
          </span>
          <span className="swatch">
            <span className="box pa" />
            Partial
          </span>
          <span className="swatch">
            <span className="box no" />
            No match
          </span>
          <span className="swatch">
            <span className="box hi" />
            Hidden (Pirate King)
          </span>
          <span className="swatch">↑ later arc · ↓ earlier arc</span>
        </div>

        {guesses.length > 0 ? (
          <div className="board-wrap">
            <div className="board-fade" aria-hidden="true" />
            <div className="board-head">
              {headerKeys.map(([k, label]) => (
                <div key={k} className={`hcell ${hidden.has(k) ? "hidden" : ""}`}>
                  {label}
                </div>
              ))}
            </div>
            <div className="board-rows">
              {guesses
                .slice()
                .reverse()
                .map((g) => {
                  const cmp = compareClassic(g, answer);
                  const cells = cellsFor(g, cmp);
                  return (
                    <div className="row" key={g.id}>
                      <div className="avatar-col">
                        <div className="row-avatar">
                          <img
                            src={g.portraitUrl}
                            alt=""
                            width={70}
                            height={70}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="name">{g.name}</div>
                      </div>
                      {cells.map((c) => {
                        if (hidden.has(c.key)) {
                          return (
                            <div key={c.key} className="cell hi" aria-label={`${c.key}: hidden by Pirate King Mode`}>
                              ?
                            </div>
                          );
                        }
                        const cls =
                          c.result === "exact" ? "ex" : c.result === "partial" ? "pa" : "no";
                        return (
                          <div
                            key={c.key}
                            className={`cell ${cls}`}
                            aria-label={`${c.key}: ${c.label} — ${c.result} match`}
                          >
                            <div className="lbl">
                              <span>{c.label}</span>
                              {c.arrow === "up" && <ArrowUp className="w-3 h-3 arrow" />}
                              {c.arrow === "down" && <ArrowDown className="w-3 h-3 arrow" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="board-empty">Your guesses will appear here.</div>
        )}

        {solved && (
          <div className="win" aria-label="Solved">
            <span className="burst">SOLVED!</span>
            <div className="who">
              <div className="win-avatar">
                <img src={answer.portraitUrl} alt="" width={82} height={82} />
              </div>
              <div className="info">
                <div className="n">{answer.name}</div>
                <div className="d">
                  {answer.aliases[0] ? `${answer.aliases[0]} · ` : ""}Solved in{" "}
                  <b>{guesses.length} guess{guesses.length === 1 ? "" : "es"}</b>
                </div>
                {hard && (
                  <div className="d" style={{ color: "var(--blood)", marginTop: "2px" }}>
                    Pirate King Mode — 3 attrs hidden
                  </div>
                )}
                {practiceMode && (
                  <div className="d" style={{ color: "var(--blood)", marginTop: "2px" }}>
                    Archive practice — streak unaffected
                  </div>
                )}
              </div>
            </div>
            <div className="share-grid" aria-label="Share grid">
              <pre>{shareText}</pre>
            </div>
            <div className="actions">
              <button className="btn primary" type="button" onClick={() => share(shareBody)}>
                Share result
              </button>
              <button className="btn" type="button" onClick={() => copy(shareBody)}>
                {copied ? "Copied!" : "Copy grid"}
              </button>
              <Link className="btn blood" href="/">
                Next mode →
              </Link>
            </div>
          </div>
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
      {showHow && <ClassicHowToModal mode={mode} onClose={() => setShowHow(false)} />}
    </div>
  );
}

function ClassicHowToModal({
  mode,
  onClose,
}: {
  mode: Extract<GameMode, "classic" | "deepcut">;
  onClose: () => void;
}) {
  const { reset } = useSpoilerAck();
  const paragraphs =
    mode === "deepcut"
      ? [
          "Same rules as Classic — guess today&apos;s pirate by attribute. The answer is a <b>manga-only deep cut</b> that hasn&apos;t aired in the anime yet.",
          "Green = exact, Yellow = partial, Red = no match. <b>Pirate King Mode</b> can hide 3 of the 8 attributes for extra difficulty.",
          "The hidden columns rotate <b>deterministically</b> each day, so everyone playing on the same day sees the same 3 masked columns — your share grid is comparable to anyone else&apos;s.",
          "Win 3 Pirate King Mode games to unlock a small badge on the landing page.",
          "Unlimited guesses. One puzzle per day. Deep-Cut has its own streak separate from Classic.",
        ]
      : [
          "Guess today&apos;s <b>One Piece</b> character. Each guess reveals how 8 attributes compare to the answer.",
          "Green = exact match. Yellow = partial. Red = no match. Hidden cells appear when <b>Pirate King Mode</b> is on — 3 columns are masked for the whole day.",
          "The hidden columns rotate <b>deterministically</b> each day, so everyone playing the same day sees the same 3 masked columns — your share grid is directly comparable.",
          "Win 3 Pirate King Mode games to unlock a small badge on the landing page. Optional — casual play is always fine.",
          "Unlimited guesses. One puzzle per day. Build streaks, share your grid.",
        ];
  return (
    <ModeHowToModal
      onClose={onClose}
      id="classic-how-t"
      paragraphs={paragraphs}
      footer={
        mode === "deepcut" ? (
          <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "2px solid var(--ink)" }}>
            <button
              className="btn"
              type="button"
              onClick={() => {
                reset();
                onClose();
                window.location.href = "/";
              }}
              title="Hide Deep-Cut until you acknowledge the spoiler warning again"
            >
              Reset spoiler warning
            </button>
          </div>
        ) : null
      }
    />
  );
}
