import Link from "next/link";

type RecommendedGearItem = {
  id: string;
  title: string;
  gearType?: string;
  imageUrl?: string;
};

export default function RecommendedGearCards(props: {
  gearTypes: string[];
  items: RecommendedGearItem[];
}) {
  const gearTypes = (props.gearTypes ?? []).filter(Boolean);
  const items = (props.items ?? []).filter(Boolean);

  if (gearTypes.length === 0) return null;

  return (
    <section aria-label="Recommended gear" className="space-y-3">
      <header className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight">
          Recommended Gear
        </h2>
        <div className="flex flex-wrap gap-2">
          {gearTypes.slice(0, 8).map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-slate-700 dark:border-moss/40 dark:bg-forest/40 dark:text-sand/80"
            >
              {t}
            </span>
          ))}
        </div>
      </header>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.slice(0, 6).map((g) => (
            <Link
              key={g.id}
              href={`/gear/${g.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-moss/30 dark:bg-forest/40 dark:hover:bg-forest/60"
            >
              <div className="h-12 w-12 flex-none overflow-hidden rounded-xl bg-zinc-100 dark:bg-moss/20">
                {g.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.imageUrl}
                    alt={g.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground dark:text-sand">
                  {g.title}
                </div>
                {g.gearType ? (
                  <div className="mt-0.5 truncate text-xs text-slate-600 dark:text-sand/70">
                    {g.gearType}
                  </div>
                ) : null}
              </div>

              <div className="ml-auto flex-none text-zinc-400 transition group-hover:text-primary dark:text-sand/60 dark:group-hover:text-accent">
                →
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-slate-600 dark:border-moss/30 dark:bg-forest/30 dark:text-sand/70">
          No gear items match these types yet.
        </div>
      )}
    </section>
  );
}
