"use client";

import { X } from "lucide-react";
import type { GameMode } from "@/lib/types";

const COPY: Record<GameMode, { title: string; body: string[] }> = {
  classic: {
    title: "Classic",
    body: [
      "Guess today's One Piece character. For each guess you'll see 8 attribute cells.",
      "🟩 Green = exact match. 🟨 Yellow = partial match (some overlap). 🟥 Red = no match.",
      "The Arc column shows ↑ if the correct character debuted in a later arc, ↓ if earlier.",
      "Unlimited guesses. A new puzzle drops at local midnight.",
    ],
  },
  quote: {
    title: "Quote",
    body: [
      "Who said this? Use the quote below as your only clue.",
      "Type any name to guess. Wrong guesses pile up — there's no penalty beyond shame.",
    ],
  },
  silhouette: {
    title: "Silhouette",
    body: [
      "Identify the character from their silhouette.",
      "Each wrong guess brightens the image by a step — after enough misses, the colors appear.",
    ],
  },
  emoji: {
    title: "Emoji",
    body: [
      "Four emojis describe today's character. Guess who.",
      "Every wrong guess reveals one more emoji clue, up to six.",
    ],
  },
  devilfruit: {
    title: "Devil Fruit",
    body: [
      "You get a description of the character's Devil Fruit / signature ability set.",
      "Guess the pirate that best matches.",
    ],
  },
  deepcut: {
    title: "Deep-Cut",
    body: [
      "Hard mode for manga readers — today's answer is from the manga-only spoiler pool.",
      "The attribute grid works exactly like Classic, but the answer pool is post-anime canon.",
      "All characters remain valid guesses — you'll need them.",
    ],
  },
};

export function HowToPlayModal({ mode, onClose }: { mode: GameMode; onClose: () => void }) {
  const c = COPY[mode];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-surface border-4 border-black shadow-comic-blood p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-muted hover:text-ink"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 id="howto-title" className="wordmark text-3xl text-primary mb-3">
          How to play — {c.title}
        </h2>
        <ul className="space-y-2 text-sm">
          {c.body.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
