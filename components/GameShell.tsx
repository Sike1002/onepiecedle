"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowLeft, BarChart2, HelpCircle } from "lucide-react";
import type { GameMode } from "@/lib/types";
import type { ModeStats } from "@/lib/streak";
import { Countdown } from "./Countdown";
import { HowToPlayModal } from "./HowToPlayModal";
import { StatsModal } from "./StatsModal";

interface Props {
  mode: GameMode;
  title: string;
  stats: ModeStats | null;
  children: ReactNode;
}

export function GameShell({ mode, title, stats, children }: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-bg border-b-2 border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 border-2 border-black bg-surface shadow-comic-sm hover:translate-y-[-2px] transition"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="wordmark text-xl md:text-2xl text-primary leading-none truncate">
              {title}
            </div>
            <div className="text-[10px] md:text-xs text-muted">
              {stats && stats.streak > 0 ? `🔥 streak ${stats.streak} • ` : ""}
              <Countdown />
            </div>
          </div>
          <button
            onClick={() => setShowStats(true)}
            className="p-2 border-2 border-black bg-surface shadow-comic-sm hover:translate-y-[-2px] transition"
            aria-label="Stats"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 border-2 border-black bg-surface shadow-comic-sm hover:translate-y-[-2px] transition"
            aria-label="How to play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">{children}</main>
      {showHelp && <HowToPlayModal mode={mode} onClose={() => setShowHelp(false)} />}
      {showStats && stats && <StatsModal stats={stats} onClose={() => setShowStats(false)} />}
    </div>
  );
}
