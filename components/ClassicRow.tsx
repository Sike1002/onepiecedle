"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { OnePieceCharacter, ClassicComparison, MatchResult } from "@/lib/types";
import type { ClassicColumnKey } from "@/lib/compareCharacter";
import { CharacterAvatar } from "./CharacterAvatar";

const COLOR: Record<MatchResult, string> = {
  exact: "bg-ok text-black border-black",
  partial: "bg-warn text-black border-black",
  none: "bg-blood text-white border-black",
};

function labelFor(ch: OnePieceCharacter, key: keyof OnePieceCharacter): string {
  const v = ch[key];
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    if (v.length === 1) return short(String(v[0]));
    return v.map((x) => short(String(x))).join(" / ");
  }
  return short(String(v));
}

function short(s: string): string {
  // Trim long labels so they fit the cell
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

interface Props {
  guess: OnePieceCharacter;
  comparison: ClassicComparison;
  animateIn?: boolean;
  hidden?: Set<ClassicColumnKey>;
}

export function ClassicRow({ guess, comparison, animateIn = true, hidden }: Props) {
  const arcLabel = typeof guess.firstArcNumber === "number" ? `A${guess.firstArcNumber}` : "Manga";
  const cells: { key: ClassicColumnKey; label: string; result: MatchResult; icon?: "up" | "down" }[] = [
    { key: "gender", label: guess.gender, result: comparison.gender },
    { key: "race", label: labelFor(guess, "race"), result: comparison.race },
    { key: "affiliation", label: labelFor(guess, "affiliation"), result: comparison.affiliation },
    { key: "devilFruitType", label: short(guess.devilFruitType), result: comparison.devilFruitType },
    { key: "haki", label: labelFor(guess, "haki"), result: comparison.haki },
    { key: "origin", label: short(guess.origin), result: comparison.origin },
    { key: "status", label: guess.status, result: comparison.status },
    {
      key: "firstArcNumber",
      label: arcLabel,
      result: comparison.firstArcNumber.result,
      icon: comparison.firstArcNumber.direction,
    },
  ];

  return (
    <div className="flex items-stretch gap-1 min-w-max">
      <div className="sticky left-0 z-10 bg-bg pr-1">
        <div className="w-11 h-11 md:w-16 md:h-16 border-2 border-black bg-surface shadow-comic-sm flex items-center justify-center">
          <CharacterAvatar character={guess} size={40} />
        </div>
        <div className="mt-0.5 w-11 md:w-16 text-[10px] text-center font-bold uppercase truncate leading-tight">
          {guess.name}
        </div>
      </div>
      {cells.map((c, i) => {
        const isHidden = hidden?.has(c.key) ?? false;
        if (isHidden) {
          return (
            <motion.div
              key={c.key}
              initial={animateIn ? { rotateY: 180, opacity: 0 } : false}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ delay: animateIn ? i * 0.08 : 0, duration: 0.35 }}
              className="w-11 h-11 md:w-16 md:h-16 border-2 border-black bg-bg flex items-center justify-center shadow-comic-sm halftone"
              aria-label={`${c.key}: hidden by Pirate King Mode`}
            >
              <span className="text-2xl font-black text-muted">?</span>
            </motion.div>
          );
        }
        return (
          <motion.div
            key={c.key}
            initial={animateIn ? { rotateY: 180, opacity: 0 } : false}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ delay: animateIn ? i * 0.08 : 0, duration: 0.35 }}
            className={`w-11 h-11 md:w-16 md:h-16 border-2 ${COLOR[c.result]} flex items-center justify-center text-[9px] md:text-[11px] font-extrabold uppercase leading-tight text-center p-0.5 shadow-comic-sm`}
            aria-label={`${c.key}: ${c.label} — ${c.result} match${c.icon ? `, arrow ${c.icon}` : ""}`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="break-words">{c.label}</span>
              {c.icon === "up" && <ArrowUp className="w-3 h-3" />}
              {c.icon === "down" && <ArrowDown className="w-3 h-3" />}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
