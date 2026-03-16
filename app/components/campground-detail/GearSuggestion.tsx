"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function GearSuggestion(props: {
  recordId: string;
  items: string[];
}) {
  const items = useMemo(
    () => (props.items ?? []).map((i) => i.trim()).filter(Boolean),
    [props.items],
  );

  const storageKey = `campwise:gear-suggestion:${props.recordId}`;
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setAdded(safeLocalStorageGet(storageKey) === "1");
  }, [storageKey]);

  if (items.length === 0) return null;

  function addToGearList() {
    setAdded(true);
    safeLocalStorageSet(storageKey, "1");
    safeLocalStorageSet(`${storageKey}:items`, JSON.stringify(items));
  }

  return (
    <section
      aria-label="แนะนำอุปกรณ์"
      className="rounded-3xl border border-zinc-200 bg-white p-5 text-foreground shadow-sm dark:border-moss/30 dark:bg-forest dark:text-sand"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold">🎒 แนะนำอุปกรณ์</h2>
        <button
          type="button"
          onClick={addToGearList}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-forest hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-pressed={added}
        >
          {added ? "เพิ่มแล้ว" : "เพิ่มเข้ารายการอุปกรณ์"}
        </button>
      </div>

      <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-[1.7] text-slate-700 dark:text-sand/85">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p className="mt-3 text-sm text-slate-600 dark:text-sand/70">
        เรียงลำดับตามความสำคัญ — ตรวจสอบก่อนจัดของ
      </p>
    </section>
  );
}
