/* eslint-disable @next/next/no-img-element */
"use client";

import type { OnePieceCharacter } from "@/lib/types";

interface Props {
  suggestions: OnePieceCharacter[];
  highlight: number;
  onHover: (i: number) => void;
  onPick: (ch: OnePieceCharacter) => void;
}

/** Inline (non-floating) suggestion list for the guess input. Shared across
 * every mode page. */
export function SuggestionsList({ suggestions, highlight, onHover, onPick }: Props) {
  if (suggestions.length === 0) return null;
  return (
    <div className="suggestions" role="listbox">
      {suggestions.map((ch, i) => (
        <button
          key={ch.id}
          className={`sugg ${i === highlight ? "active" : ""}`}
          role="option"
          aria-selected={i === highlight}
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(ch);
          }}
          type="button"
        >
          <div className="sugg-avatar">
            <img
              src={ch.portraitUrl}
              alt=""
              width={36}
              height={36}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div>
            <div className="name">{ch.name}</div>
            {ch.aliases.length > 0 && (
              <div className="alias">{ch.aliases.slice(0, 2).join(" · ")}</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
