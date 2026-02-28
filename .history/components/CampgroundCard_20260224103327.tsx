"use client";

import { useMemo, useState } from "react";

interface CampgroundCardProps {
  href: string;
  title: string;
  location: string;
  image?: string;
  aiSummary?: string;
  rawReview?: string;
}

function ChevronDownIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={props.className}
    >
      <path
        d="M5.25 7.5L10 12.25L14.75 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function normalizeText(value: unknown) {
  const s = typeof value === "string" ? value : String(value ?? "");
  return s.replace(/\s+/g, " ").trim();
}

export default function CampgroundCard({
  href,
  title,
  location,
  image,
  aiSummary,
  rawReview,
}: CampgroundCardProps) {
  const [open, setOpen] = useState(false);

  const summary = useMemo(() => normalizeText(aiSummary), [aiSummary]);
  const review = useMemo(() => normalizeText(rawReview), [rawReview]);

  return (
    <div className="overflow-hidden rounded-2xl border border-moss/30 bg-forest shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
      <a href={href} className="block">
        <div className="relative h-56 w-full bg-moss">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-sand/70">
              No image
            </div>
          )}
        </div>

        <div className="p-6 text-sand">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="mt-1 text-sm text-sand/70">{location}</p>
          </div>

          {summary ? (
            <div className="mt-5 rounded-xl border border-moss/50 bg-moss/25 p-4">
              <p className="text-sm font-semibold">🤖 AI Summary</p>
              <p className="mt-2 text-sm leading-6 text-sand/80">{summary}</p>
            </div>
          ) : null}
        </div>
      </a>

      {review ? (
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 text-sm font-medium text-accent"
            aria-expanded={open}
          >
            ดู Raw Review
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open ? (
            <div className="mt-3 rounded-xl bg-forest/70 p-4 text-sm leading-6 text-sand/80 ring-1 ring-moss/30">
              {review}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
