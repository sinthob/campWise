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

export default function HeroActions(props: {
  recordId: string;
  title: string;
  mapsUrl: string;
}) {
  const saveKey = `campwise:saved:${props.recordId}:campground`;
  const [saved, setSaved] = useState(
    () => safeLocalStorageGet(saveKey) === "1",
  );
  const [shared, setShared] = useState(false);

  function toggleSave() {
    const next = !saved;
    setSaved(next);
    safeLocalStorageSet(saveKey, next ? "1" : "0");
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
    <section aria-label="การดำเนินการ" className="mt-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={toggleSave}
          aria-pressed={saved}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-forest hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {saved ? "🔖 บันทึกแล้ว" : "🔖 บันทึกสถานที่"}
        </button>

        <a
          href={props.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-transparent dark:bg-forest dark:text-sand dark:ring-1 dark:ring-moss/30 dark:hover:bg-forest/80"
        >
          🗺 เปิดใน Google Maps
        </a>

        <button
          type="button"
          onClick={share}
          className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-transparent dark:bg-forest dark:text-sand dark:ring-1 dark:ring-moss/30 dark:hover:bg-forest/80 sm:col-span-2"
        >
          {shared ? "📤 แชร์แล้ว" : "📤 แชร์"}
        </button>
      </div>
    </section>
  );
}
