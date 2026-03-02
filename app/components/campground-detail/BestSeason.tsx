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
  const rating = props.rating !== undefined ? clampRating(props.rating) : undefined;

  if (months.length === 0 && rating === undefined) return null;

  return (
    <section aria-label="Best season" className="rounded-3xl border border-moss/30 bg-forest p-5 text-sand shadow-sm">
      <h2 className="text-base font-semibold">🌤 Best Season</h2>

      {rating !== undefined ? (
        <p className="mt-2 text-sm text-sand/80" aria-label={`Rating ${rating} out of 5`}>
          {Array.from({ length: 5 }).map((_, idx) => (idx < rating ? "⭐" : "☆")).join("")}
        </p>
      ) : null}

      {months.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Best months">
          {months.map((m) => (
            <li
              key={m}
              className="inline-flex items-center rounded-full bg-moss/15 px-3 py-2 text-sm font-semibold text-sand ring-1 ring-moss/30"
            >
              {m}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
