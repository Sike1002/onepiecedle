"use client";

import { useEffect } from "react";

/** Register Esc-key handlers that close modal-like state. The hook wires
 * one keydown listener and calls every setter(false) it was given. */
export function useEscToClose(...setters: Array<(open: false) => void>) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        for (const set of setters) set(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // setters are provided inline each render, but behavior-wise they just
    // toggle booleans. Listing them explicitly here isn't useful.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
