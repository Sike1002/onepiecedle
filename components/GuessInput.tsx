"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { characters } from "@/data/characters";
import type { OnePieceCharacter } from "@/lib/types";
import { CharacterAvatar } from "./CharacterAvatar";

interface Props {
  onGuess: (character: OnePieceCharacter) => void;
  excludeIds?: string[];
  disabled?: boolean;
  placeholder?: string;
}

export function GuessInput({ onGuess, excludeIds = [], disabled, placeholder = "Guess a character..." }: Props) {
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(characters, {
        keys: ["name", "aliases"],
        threshold: 0.35,
        includeScore: true,
      }),
    [],
  );

  const suggestions = useMemo(() => {
    const excluded = new Set(excludeIds);
    if (!query.trim()) return [];
    return fuse
      .search(query)
      .filter((r) => !excluded.has(r.item.id))
      .slice(0, 6)
      .map((r) => r.item);
  }, [query, fuse, excludeIds]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function submit(ch: OnePieceCharacter) {
    onGuess(ch);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter" && query.trim() && suggestions.length === 0) e.preventDefault();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full bg-surface border-4 border-black shadow-comic-primary px-4 py-3 text-lg font-bold placeholder:text-muted focus:outline-none disabled:opacity-50"
        aria-label="Guess a character"
        aria-autocomplete="list"
      />
      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-30 mt-2 w-full bg-surface border-4 border-black shadow-comic overflow-hidden"
          role="listbox"
        >
          {suggestions.map((ch, i) => (
            <li
              key={ch.id}
              role="option"
              aria-selected={i === highlight}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                i === highlight ? "bg-primary text-black" : "hover:bg-black/40"
              }`}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                submit(ch);
              }}
            >
              <CharacterAvatar character={ch} size={36} />
              <div className="flex flex-col leading-tight">
                <span className="font-bold">{ch.name}</span>
                {ch.aliases.length > 0 && (
                  <span className={`text-xs ${i === highlight ? "text-black/70" : "text-muted"}`}>
                    {ch.aliases.slice(0, 2).join(" • ")}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
