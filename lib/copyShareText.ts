"use client";

import { useState, useCallback } from "react";

/** Shared clipboard + navigator.share helper with a short-lived "Copied!"
 * flag suitable for button text. */
export function useShareAction() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard rejected (permission, insecure context) — fail silently
    }
  }, []);

  const share = useCallback(
    async (text: string, title: string = "Onepiecedle") => {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        try {
          await navigator.share({ title, text });
          return;
        } catch {
          // user canceled or share rejected — fall through to clipboard
        }
      }
      await copy(text);
    },
    [copy],
  );

  return { copied, copy, share };
}
