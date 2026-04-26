"use client";

import { useState } from "react";
import { Check, Copy, Share2, X } from "lucide-react";

interface Props {
  title: string;
  shareText: string;
  onClose: () => void;
}

export function ShareModal({ title, shareText, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText });
      } catch {}
    } else {
      copy();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-surface border-4 border-black shadow-comic-blood p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-2 right-2 p-1 text-muted hover:text-ink" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
        <h2 className="wordmark text-3xl text-primary mb-3">{title}</h2>
        <pre className="bg-bg border-2 border-black p-3 whitespace-pre-wrap font-mono text-sm max-h-64 overflow-auto">
{shareText}
        </pre>
        <div className="flex gap-2 mt-4">
          <button
            onClick={copy}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-bold uppercase px-4 py-3 border-4 border-black shadow-comic hover:translate-y-[-2px] transition"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={share}
            className="flex-1 flex items-center justify-center gap-2 bg-blood text-white font-bold uppercase px-4 py-3 border-4 border-black shadow-comic hover:translate-y-[-2px] transition"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
