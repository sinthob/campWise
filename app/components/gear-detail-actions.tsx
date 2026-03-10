"use client";

import { useEffect, useState } from "react";

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

export default function GearDetailActions(props: {
  recordId: string;
  title: string;
}) {
  const saveKey = `campwise:saved:${props.recordId}:gear`;
  const addedKey = `campwise:gear-added:${props.recordId}`;

  const [saved, setSaved] = useState(() => safeLocalStorageGet(saveKey) === "1");
  const [added, setAdded] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setAdded(safeLocalStorageGet(addedKey) === "1");
  }, [addedKey]);

  function toggleSave() {
    const next = !saved;
    setSaved(next);
    safeLocalStorageSet(saveKey, next ? "1" : "0");
  }

  function addToGearList() {
    setAdded(true);
    safeLocalStorageSet(addedKey, "1");
    safeLocalStorageSet(`${addedKey}:title`, props.title);
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
    <section aria-label="Actions">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="button"
          onClick={addToGearList}
          aria-pressed={added}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-forest hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-auto"
        >
          {added ? "✅ Added to Gear List" : "➕ Add to Gear List"}
        </button>

        <button
          type="button"
          onClick={toggleSave}
          aria-pressed={saved}
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-transparent dark:bg-forest dark:text-sand dark:ring-1 dark:ring-moss/30 dark:hover:bg-forest/80 sm:w-auto"
        >
          {saved ? "🔖 Saved" : "🔖 Save"}
        </button>

        <button
          type="button"
          onClick={share}
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-transparent dark:bg-forest dark:text-sand dark:ring-1 dark:ring-moss/30 dark:hover:bg-forest/80 sm:w-auto"
        >
          {shared ? "📤 Shared" : "📤 Share"}
        </button>
      </div>
    </section>
  );
}
