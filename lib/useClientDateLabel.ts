"use client";

import { useEffect, useState } from "react";

/** Format the current date as a short user-facing label (e.g. "Apr 24").
 *
 * Runs only after mount so SSR output is an empty placeholder. This is the
 * correct fix for `new Date().toLocaleDateString()` hydration mismatches —
 * the server can't know the user's locale, so letting SSR render one value
 * and the client render another guarantees React warnings. */
export function useClientDateLabel(
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
  placeholder: string = "",
): string {
  const [label, setLabel] = useState(placeholder);
  useEffect(() => {
    setLabel(new Date().toLocaleDateString(undefined, options));
    // Stringify options for stable dep — the caller almost never changes
    // them but this keeps exhaustive-deps happy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options)]);
  return label;
}

/** Same pattern but takes a specific Date (useful for archive cards). */
export function useClientDateLabelFor(
  date: Date | null,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", weekday: "short" },
  placeholder: string = "",
): string {
  const [label, setLabel] = useState(placeholder);
  useEffect(() => {
    if (!date) return;
    setLabel(date.toLocaleDateString(undefined, options));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date?.getTime(), JSON.stringify(options)]);
  return label;
}
