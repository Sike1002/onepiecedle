"use client";

import Link from "next/link";
import { BarChart2, ChevronLeft, HelpCircle } from "lucide-react";
import { useCountdown } from "@/lib/useCountdown";
import { useClientDateLabel, useClientDateLabelFor } from "@/lib/useClientDateLabel";

interface Props {
  title: string;
  /** Right-of-date meta slot — e.g. "only exact speaker wins". */
  rightMeta?: string;
  /** Optional streak chip; rendered only when > 0. */
  streak?: number;
  /** Optional target date for archive practice. Defaults to today. */
  targetDate?: Date;
  /** Hide reset countdown for archive practice. */
  showReset?: boolean;
  onStats: () => void;
  onHow: () => void;
}

/** Shared sticky mode header: back button, Bungee title + date + streak/reset
 * line, stats + how-to icon buttons. Ported from the 5 inline copies that
 * lived in each mode page. */
export function ModeHeader({
  title,
  rightMeta,
  streak = 0,
  targetDate,
  showReset = true,
  onStats,
  onHow,
}: Props) {
  const countdown = useCountdown();
  const todayLabel = useClientDateLabel();
  const targetDateLabel = useClientDateLabelFor(
    targetDate ?? null,
    { month: "short", day: "numeric" },
    "",
  );
  const dateLabel = targetDate ? targetDateLabel : todayLabel;
  return (
    <header className="top">
      <div className="top-inner">
        <Link href="/" className="icon-btn back" aria-label="Back to menu">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div className="title-wrap">
          <div className="title">
            <span className="title-name">{title}</span>
            {dateLabel && (
              <span className="title-date">
                <span className="dot-sep">·</span>
                <span style={{ color: "var(--blood)" }}>{dateLabel}</span>
              </span>
            )}
          </div>
          <div className="sub">
            {streak > 0 && <span className="fire">🔥 streak {streak}</span>}
            {showReset && <span>· reset in {countdown}</span>}
            {rightMeta && <span>· {rightMeta}</span>}
          </div>
        </div>
        <button className="icon-btn" aria-label="Stats" onClick={onStats} type="button">
          <BarChart2 className="w-4 h-4" />
        </button>
        <button className="icon-btn" aria-label="How to play" onClick={onHow} type="button">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
