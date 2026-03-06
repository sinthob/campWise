"use client";

import { useState } from "react";

function safeLocalStorageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export default function MobileStickyCTA(props: {
  recordId: string;
  title: string;
  mapsUrl: string;
}) {
  const storageKey = `campwise:saved:${props.recordId}:campground`;
  const [saved, setSaved] = useState(
    () => safeLocalStorageGet(storageKey) === "1",
  );
  const [shared, setShared] = useState(false);

  function toggleSaved() {
    const next = !saved;
    setSaved(next);
    safeLocalStorageSet(storageKey, next ? "1" : "0");
  }

  async function share() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: props.title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      window.setTimeout(() => setShared(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden dark:border-moss/30 dark:bg-forest/95"
      role="region"
      aria-label="Actions"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
        <button
          type="button"
          onClick={toggleSaved}
          aria-pressed={saved}
          className="inline-flex h-11 flex-[2] items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-forest hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {saved ? "Saved" : "Save"}
        </button>

        <a
          href={props.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-transparent dark:bg-forest dark:text-sand dark:ring-1 dark:ring-moss/30 dark:hover:bg-forest/80"
        >
          Maps
        </a>

        <button
          type="button"
          onClick={share}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-transparent dark:bg-forest dark:text-sand dark:ring-1 dark:ring-moss/30 dark:hover:bg-forest/80"
        >
          {shared ? "Shared" : "Share"}
        </button>
      </div>
    </div>
  );
}
