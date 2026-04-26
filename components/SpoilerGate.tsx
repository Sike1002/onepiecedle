"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSpoilerAck } from "@/lib/spoilerAck";

interface Props {
  children: ReactNode;
}

/** Blocks rendering of its children until the user explicitly acknowledges
 * a spoiler warning. Used by Deep-Cut mode and (eventually) the Deep-Cut
 * entries in the archive.
 *
 * Renders nothing on SSR / first paint — prevents a flash of spoiler
 * content before the localStorage check runs. */
export function SpoilerGate({ children }: Props) {
  const { ack, acknowledge } = useSpoilerAck();
  if (ack === null) {
    return <div className="game-root" aria-hidden="true" />;
  }
  if (ack) return <>{children}</>;

  return (
    <div className="game-root spoiler-gate-root">
      <div className="spoiler-gate-wrap">
        <div className="spoiler-panel" role="dialog" aria-modal="true" aria-labelledby="sp-title">
          <div className="spoiler-burst" id="sp-title">
            SPOILER WARNING
          </div>
          <p className="spoiler-copy">
            <b>Deep-Cut</b> may include manga events and characters that appear <b>past
            the latest aired anime episode</b>. Everything in the normal daily modes stays
            safe to anime-aired canon — this one does not.
          </p>
          <p className="spoiler-copy small">
            If you&apos;re only watching the anime, turn back. You can re-open the warning from
            the How-to-play menu any time.
          </p>
          <div className="spoiler-actions">
            <button className="btn primary" type="button" onClick={acknowledge}>
              I understand — continue
            </button>
            <Link className="btn" href="/">
              Back to menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
