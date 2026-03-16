type BestSeasonProps = {
  months: string[];
  rating?: number; // 1-5
};

function clampRating(rating: number) {
  if (!Number.isFinite(rating)) return undefined;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

export default function BestSeason(props: BestSeasonProps) {
  const months = (props.months ?? []).map((m) => m.trim()).filter(Boolean);
  const rating =
    props.rating !== undefined ? clampRating(props.rating) : undefined;

  if (months.length === 0 && rating === undefined) return null;

  return (
    <section
      aria-label="ฤดูกาลที่เหมาะที่สุด"
      className="rounded-3xl border border-zinc-200 bg-white p-5 text-foreground shadow-sm dark:border-moss/30 dark:bg-forest dark:text-sand"
    >
      <h2 className="text-base font-semibold">🌤 ฤดูกาลที่เหมาะที่สุด</h2>

      {rating !== undefined ? (
        <p
          className="mt-2 text-sm text-slate-600 dark:text-sand/80"
          aria-label={`คะแนน ${rating} จาก 5`}
        >
          {Array.from({ length: 5 })
            .map((_, idx) => (idx < rating ? "⭐" : "☆"))
            .join("")}
        </p>
      ) : null}

      {months.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="เดือนที่แนะนำ">
          {months.map((m) => (
            <li
              key={m}
              className="inline-flex items-center rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-foreground ring-1 ring-primary/20 dark:bg-moss/15 dark:text-sand dark:ring-moss/30"
            >
              {m}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
