"use client";

import { motion } from "framer-motion";
import type { OnePieceCharacter } from "@/lib/types";
import { CharacterAvatar } from "./CharacterAvatar";
import { Countdown } from "./Countdown";
import { Share2 } from "lucide-react";

interface Props {
  character: OnePieceCharacter;
  guessCount: number;
  onShare: () => void;
  note?: string;
}

export function WinScreen({ character, guessCount, onShare, note }: Props) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 14 }}
      className="relative bg-surface border-4 border-black shadow-comic-blood p-5 text-center overflow-hidden"
    >
      <div className="absolute inset-0 halftone-primary pointer-events-none opacity-60" />
      <div className="relative">
        <div className="wordmark text-4xl md:text-5xl text-blood drop-shadow-[3px_3px_0_rgba(0,0,0,1)] animate-burst">
          NAILED IT!
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="w-16 h-16 border-2 border-black">
            <CharacterAvatar character={character} size={64} />
          </div>
          <div className="text-left">
            <div className="wordmark text-2xl text-primary">{character.name}</div>
            {character.aliases[0] && (
              <div className="text-xs text-muted">{character.aliases.join(" • ")}</div>
            )}
          </div>
        </div>
        <div className="mt-3 text-sm">
          Solved in <span className="font-black text-primary">{guessCount}</span>{" "}
          {guessCount === 1 ? "guess" : "guesses"}
        </div>
        {note && <div className="mt-2 text-xs text-muted italic">{note}</div>}
        <div className="mt-4 flex flex-col items-center gap-3">
          <button
            onClick={onShare}
            className="flex items-center gap-2 bg-primary text-black font-bold uppercase px-5 py-3 border-4 border-black shadow-comic hover:translate-y-[-2px] transition"
          >
            <Share2 className="w-5 h-5" /> Share result
          </button>
          <Countdown />
        </div>
      </div>
    </motion.div>
  );
}
