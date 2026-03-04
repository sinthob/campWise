"use client";

import { useId, useMemo, useState } from "react";

type TimelineEntry = {
  time?: string;
  description: string;
};

type DayGroup = {
  title: string;
  entries: TimelineEntry[];
};

function normalizeTimeToken(raw: string) {
  const s = raw.trim();
  if (/^\d{1,2}\.\d{2}$/.test(s)) return s.replace(".", ":");
  return s;
}

function parseEntries(lines: string[]): TimelineEntry[] {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const timeMatch = line.match(/(?:^|\s)(\d{1,2}[:\.]\d{2})(?:\s|$)/);
      if (!timeMatch) return { description: line };

      const time = normalizeTimeToken(timeMatch[1]);
      const description = line
        .replace(timeMatch[1], "")
        .replace(/^[\s\-–—:]+/, "")
        .trim();

      return { time, description: description || line };
    });
}

function toLines(planText: string): string[] {
  const normalized = planText.replace(/\r/g, "").trim();
  if (!normalized) return [];
  return normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function groupByDay(planText: string): DayGroup[] {
  const lines = toLines(planText);
  if (lines.length === 0) return [];

  const groups: DayGroup[] = [];

  let currentTitle = "Day 1";
  let buffer: string[] = [];

  function flush() {
    const entries = parseEntries(buffer);
    if (entries.length > 0) {
      groups.push({ title: currentTitle, entries });
    }
    buffer = [];
  }

  for (const line of lines) {
    const dayMatch = line.match(/^(DAY\s*\d+|Day\s*\d+|วัน\s*ที่\s*\d+)/i);
    if (dayMatch) {
      flush();
      currentTitle = dayMatch[1]
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^day/i, "Day")
        .toUpperCase();
      continue;
    }

    // Treat other headers (e.g., Evening / Morning) as entries (keep content).
    buffer.push(line);
  }

  flush();

  // If nothing grouped (single buffer), show as Day 1.
  return groups.length > 0
    ? groups
    : [{ title: "Day 1", entries: parseEntries(lines) }];
}

function AccordionSection(props: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const contentId = useId();
  const [open, setOpen] = useState(props.defaultOpen ?? false);

  return (
    <div className="rounded-2xl bg-zinc-50 ring-1 ring-zinc-200 dark:bg-forest/60 dark:ring-moss/30">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-semibold text-foreground dark:text-sand">
          {props.title}
        </span>
        <span aria-hidden="true" className="text-slate-500 dark:text-sand/70">
          {open ? "−" : "+"}
        </span>
      </button>

      <div
        id={contentId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden px-4 pb-4">{props.children}</div>
      </div>
    </div>
  );
}

export default function TripTimeline(props: {
  title: string;
  intro: string;
  planText: string;
}) {
  const days = useMemo(() => groupByDay(props.planText), [props.planText]);

  return (
    <section
      aria-label={props.title}
      className="rounded-3xl border border-zinc-200 bg-white p-5 text-foreground shadow-sm dark:border-moss/30 dark:bg-forest dark:text-sand"
    >
      <header>
        <h3 className="text-base font-semibold sm:text-lg">{props.title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-sand/70">
          {props.intro}
        </p>
      </header>

      <div className="mt-4 space-y-3">
        {days.length > 0 ? (
          days.map((day) => (
            <AccordionSection
              key={day.title}
              title={day.title}
              defaultOpen={false}
            >
              <ol className="relative space-y-3 border-l border-zinc-200 pl-4 dark:border-moss/40">
                {day.entries.map((entry, idx) => (
                  <li
                    key={`${idx}-${entry.time ?? ""}-${entry.description}`}
                    className="relative"
                  >
                    <span
                      className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-accent ring-4 ring-zinc-50 dark:ring-forest"
                      aria-hidden="true"
                    />

                    <div className="grid grid-cols-[88px_1fr] gap-3 rounded-2xl bg-white px-3 py-3 ring-1 ring-zinc-200 dark:bg-forest dark:ring-moss/20">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-sand/70">
                        {entry.time ?? ""}
                      </div>
                      <div className="text-sm leading-[1.7] text-slate-700 dark:text-sand/85">
                        {entry.description}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </AccordionSection>
          ))
        ) : (
          <div className="rounded-2xl bg-zinc-50 p-4 text-sm text-slate-600 ring-1 ring-zinc-200 dark:bg-forest/60 dark:text-sand/70 dark:ring-moss/30">
            ยังไม่มีข้อมูลใน Airtable
          </div>
        )}
      </div>
    </section>
  );
}
