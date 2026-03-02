"use client";

import { useEffect, useId, useMemo, useState } from "react";

type TimelineItem = {
  time?: string;
  activity: string;
};

function normalizeTimeToken(raw: string) {
  const s = raw.trim();
  // Convert 10.00 -> 10:00
  if (/^\d{1,2}\.\d{2}$/.test(s)) return s.replace(".", ":");
  return s;
}

function parseTimeline(planText: string): TimelineItem[] {
  const normalized = planText.replace(/\r/g, "").trim();
  if (!normalized) return [];

  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const items: TimelineItem[] = [];

  for (const line of lines) {
    // Try to capture time-like tokens (e.g., 10:00, 10.00, 9:30)
    const timeMatch = line.match(/(?:^|\s)(\d{1,2}[:\.]\d{2})(?:\s|$)/);
    if (timeMatch) {
      const time = normalizeTimeToken(timeMatch[1]);
      const activity = line.replace(timeMatch[1], "").replace(/^[\s\-–—:]+/, "").trim();
      items.push({ time, activity: activity || line.trim() });
      continue;
    }

    // Day markers become timeline headers.
    const dayMatch = line.match(/^(DAY\s*\d+|Day\s*\d+|วัน\s*ที่\s*\d+)/i);
    if (dayMatch) {
      items.push({ time: dayMatch[1].toUpperCase(), activity: line });
      continue;
    }

    items.push({ activity: line });
  }

  return items;
}

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

export default function TripCard(props: {
  recordId: string;
  planKey: "one-day" | "two-day";
  title: string;
  intro: string;
  planText: string;
  collapsibleOnMobile?: boolean;
}) {
  const contentId = useId();

  const timeline = useMemo(() => parseTimeline(props.planText), [props.planText]);
  const storageKey = `campwise:saved:${props.recordId}:${props.planKey}`;

  const [open, setOpen] = useState(true);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const v = safeLocalStorageGet(storageKey);
    setSaved(v === "1");
  }, [storageKey]);

  function toggleSaved() {
    const next = !saved;
    setSaved(next);
    safeLocalStorageSet(storageKey, next ? "1" : "0");
  }

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(props.planText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  const collapsible = props.collapsibleOnMobile ?? true;

  return (
    <section className="rounded-3xl border border-moss/30 bg-forest p-5 text-sand shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold sm:text-lg">{props.title}</h3>
          <p className="mt-1 text-sm leading-6 text-sand/70">{props.intro}</p>
        </div>

        {collapsible ? (
          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-moss/30 bg-forest/60 px-3 py-2 text-sm font-medium text-sand hover:bg-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-expanded={open}
            aria-controls={contentId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide" : "Show"}
          </button>
        ) : null}
      </div>

      <div
        id={contentId}
        className={`${open ? "mt-5 block" : "mt-5 hidden"} md:block`}
      >
        <ol className="space-y-3">
          {timeline.length > 0 ? (
            timeline.map((item, idx) => (
              <li
                key={`${idx}-${item.time ?? ""}-${item.activity}`}
                className="grid grid-cols-[28px_90px_1fr] gap-3 rounded-2xl bg-forest/60 p-3 ring-1 ring-moss/30"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-moss/20 text-sand/80">
                  <span aria-hidden="true">•</span>
                </div>

                <div className="text-xs font-semibold uppercase tracking-wide text-sand/70">
                  {item.time ?? ""}
                </div>

                <div className="text-sm leading-[1.7] text-sand/85">
                  {item.activity}
                </div>
              </li>
            ))
          ) : (
            <li className="rounded-2xl bg-forest/60 p-4 text-sm text-sand/70 ring-1 ring-moss/30">
              ยังไม่มีข้อมูลใน Airtable
            </li>
          )}
        </ol>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyPlan}
            className="inline-flex items-center justify-center rounded-full bg-forest px-4 py-2 text-sm font-medium text-sand ring-1 ring-moss/30 hover:bg-forest/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {copied ? "Copied" : "Copy Plan"}
          </button>

          <button
            type="button"
            onClick={toggleSaved}
            className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-forest hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-pressed={saved}
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </section>
  );
}
