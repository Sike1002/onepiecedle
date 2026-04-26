"use client";

import { useState } from "react";

interface Props {
  onReveal: () => void;
  disabled?: boolean;
  /** When the mode is practice-only (archive), the button skips the
   * confirmation and streak warning because nothing persistent happens. */
  practiceMode?: boolean;
}

/** 'Give up' / 'Reveal answer' button with an in-page confirmation dialog.
 * Streak-breaking is dangerous, so we make the player confirm first. */
export function GiveUpButton({ onReveal, disabled = false, practiceMode = false }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (disabled) return null;
  return (
    <>
      <div style={{ textAlign: "center", marginTop: "16px" }}>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          style={{
            background: "transparent",
            border: "2px solid var(--ink-soft)",
            color: "var(--ink-soft)",
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          Give up · reveal answer
        </button>
      </div>
      {confirming && (
        <div
          className="modal-back open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="giveup-t"
          onClick={() => setConfirming(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="giveup-t">
              Reveal the answer?
              <button type="button" onClick={() => setConfirming(false)} aria-label="Close">
                ✕
              </button>
            </h3>
            {practiceMode ? (
              <p>
                This is an <b>archive practice</b> puzzle — revealing has no effect on your
                streak or stats.
              </p>
            ) : (
              <p>
                This ends today&apos;s attempt. Your <b>streak resets to 0</b> and today counts
                as played-but-not-won.
              </p>
            )}
            <div className="actions" style={{ marginTop: "12px", justifyContent: "flex-end" }}>
              <button className="btn" type="button" onClick={() => setConfirming(false)}>
                Keep playing
              </button>
              <button
                className="btn blood"
                type="button"
                onClick={() => {
                  setConfirming(false);
                  onReveal();
                }}
              >
                Reveal answer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
