"use client";

import { useMemo, useState } from "react";
import {
  MessageSquarePlus,
  Star,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";

type Review = {
  id: string;
  name: string;
  createdAt: number;
  rating: number;
  tags: string[];
  comment: string;
  credibilityUp: number;
  credibilityDown: number;
};

const TAGS = [
  "⚡️ มีไฟฟ้า",
  "🚽 ห้องน้ำแยก",
  "🚿 น้ำอุ่น",
  "🐾 Pet-Friendly",
  "📶 เน็ตแรง (5G)",
  "🔇 งดเสียงหลัง 4 ทุ่ม",
  "🎸 ใช้เสียงได้",
] as const;

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

function formatRelativeTime(createdAt: number) {
  const diffMs = Date.now() - createdAt;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHr < 24) return `${diffHr} hours ago`;
  return `${diffDay} days ago`;
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (crypto as any).randomUUID() as string;
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function StarRow(props: {
  value: number;
  onChange: (next: number) => void;
}) {
  const v = clampInt(props.value, 1, 5);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
      {Array.from({ length: 5 }).map((_, idx) => {
        const n = idx + 1;
        const active = n <= v;
        return (
          <button
            key={n}
            type="button"
            className="rounded-md p-1 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => props.onChange(n)}
            role="radio"
            aria-checked={n === v}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
          >
            <Star
              className={`h-5 w-5 ${active ? "fill-accent text-accent" : "text-foreground/40"}`}
            />
          </button>
        );
      })}
    </div>
  );
}

function TagChips(props: {
  selected: Set<string>;
  onToggle: (tag: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TAGS.map((tag) => {
        const on = props.selected.has(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => props.onToggle(tag)}
            aria-pressed={on}
            className={
              "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent " +
              (on
                ? "bg-primary/15 text-foreground ring-primary/30 dark:bg-moss/25 dark:text-sand dark:ring-moss/40"
                : "bg-white/5 text-foreground/80 ring-white/10 hover:bg-white/10 dark:text-sand/80")
            }
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

export default function CommunityReviewStatus() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<Set<string>>(() => new Set());
  const [comment, setComment] = useState("");

  const [reviews, setReviews] = useState<Review[]>(() => [
    {
      id: newId(),
      name: "Guest Camper",
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      rating: 5,
      tags: ["⚡️ มีไฟฟ้า", "🚽 ห้องน้ำแยก", "🔇 งดเสียงหลัง 4 ทุ่ม"],
      comment: "วิวดี ลมเย็น ตอนกลางคืนเงียบมาก เหมาะกับสายชิล.",
      credibilityUp: 12,
      credibilityDown: 1,
    },
  ]);

  const selectedTags = useMemo(() => Array.from(tags), [tags]);

  function toggleTag(tag: string) {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function resetForm() {
    setRating(5);
    setTags(new Set());
    setComment("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = comment.trim();

    setReviews((prev) => [
      {
        id: newId(),
        name: "Guest Camper",
        createdAt: Date.now(),
        rating: clampInt(rating, 1, 5),
        tags: selectedTags,
        comment: trimmed,
        credibilityUp: 0,
        credibilityDown: 0,
      },
      ...prev,
    ]);

    resetForm();
    setOpen(false);
  }

  function vote(reviewId: string, dir: "up" | "down") {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        if (dir === "up") return { ...r, credibilityUp: r.credibilityUp + 1 };
        return { ...r, credibilityDown: r.credibilityDown + 1 };
      }),
    );
  }

  return (
    <section
      aria-label="Community Review & Status"
      className="rounded-3xl border border-zinc-200 bg-white p-5 text-foreground shadow-sm dark:border-moss/30 dark:bg-forest dark:text-sand"
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            Community Review &amp; Status
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-sand/70">
            Share quick on-site info to help campers plan better.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:bg-primary/90 dark:hover:bg-primary"
        >
          {open ? <X className="h-4 w-4" /> : <MessageSquarePlus className="h-4 w-4" />}
          {open ? "Close" : "Add Review"}
        </button>
      </header>

      {open ? (
        <form onSubmit={submit} className="mt-5 rounded-2xl bg-white/5 p-4 ring-1 ring-zinc-200/70 backdrop-blur dark:bg-forest/60 dark:ring-moss/30">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-semibold">Star Rating</div>
              <StarRow value={rating} onChange={setRating} />
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-sm font-semibold">Quick Tags</div>
              <TagChips selected={tags} onToggle={toggleTag} />
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Comment</span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share a quick note (noise, facilities, signal, etc.)"
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-moss/40 dark:bg-forest/60 dark:text-sand dark:placeholder:text-sand/60"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
                className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-moss/40 dark:bg-forest/60 dark:text-sand dark:hover:bg-forest"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-slate-900 hover:bg-accent/90"
              >
                Post Review
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="mt-6 space-y-4">
        {reviews.map((r) => (
          <article
            key={r.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-moss/30 dark:bg-forest/60"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">{r.name || "Anonymous"}</div>
                <div className="mt-1 text-xs text-slate-600 dark:text-sand/70">
                  {formatRelativeTime(r.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-1" aria-label={`Rating ${r.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, idx) => {
                  const active = idx + 1 <= r.rating;
                  return (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${active ? "fill-accent text-accent" : "text-foreground/30"}`}
                    />
                  );
                })}
              </div>
            </div>

            {r.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-primary/20 dark:bg-moss/20 dark:text-sand dark:ring-moss/30"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            {r.comment ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-sand/85">
                {r.comment}
              </p>
            ) : null}

            <div className="mt-4 rounded-xl bg-white/5 p-3 ring-1 ring-zinc-200/70 dark:bg-forest/70 dark:ring-moss/25">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold text-foreground dark:text-sand">
                  ข้อมูลนี้เป็นจริงไหม?
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => vote(r.id, "up")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition-colors hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-moss/30 dark:bg-forest/60 dark:text-sand dark:hover:border-emerald-400/40 dark:hover:bg-emerald-500/10"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    👍 น่าเชื่อถือ
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-forest dark:text-sand">
                      {r.credibilityUp}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => vote(r.id, "down")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 transition-colors hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-moss/30 dark:bg-forest/60 dark:text-sand dark:hover:border-rose-400/40 dark:hover:bg-rose-500/10"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    👎 ไม่น่าเชื่อถือ
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-forest dark:text-sand">
                      {r.credibilityDown}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
