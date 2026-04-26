"use client";

import { useEffect, useState } from "react";
import { storageGet, storageRemove, storageSet } from "./storage";

const KEY = "onepiecedle.spoilerAck";

export function getSpoilerAck(): boolean {
  return storageGet<boolean>(KEY, false);
}

export function setSpoilerAck(on: boolean): void {
  if (on) storageSet<boolean>(KEY, true);
  else storageRemove(KEY);
}

/** Client hook that returns { ack, acknowledged, reset }.
 *  ack is null on SSR / before mount, then true/false. */
export function useSpoilerAck() {
  const [ack, setAck] = useState<boolean | null>(null);
  useEffect(() => {
    setAck(getSpoilerAck());
  }, []);
  const acknowledge = () => {
    setSpoilerAck(true);
    setAck(true);
  };
  const reset = () => {
    setSpoilerAck(false);
    setAck(false);
  };
  return { ack, acknowledge, reset };
}
