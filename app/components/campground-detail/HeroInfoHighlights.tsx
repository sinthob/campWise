type HeroInfoHighlightsProps = {
  bestTimeText?: string;
  highlightText?: string;
  warningText?: string;
};

export default function HeroInfoHighlights(props: HeroInfoHighlightsProps) {
  return (
    <section
      aria-label="Hero info highlights"
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      <div className="h-full rounded-xl border border-zinc-200 bg-white p-5 text-foreground shadow-sm dark:border-moss/30 dark:bg-moss/10 dark:text-sand">
        <div>
          <h2 className="text-base font-semibold">Best Time</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-sand/70">
            Quick seasonal view for trip planning.
          </p>
        </div>

        <div className="mt-4 whitespace-pre-line text-sm font-semibold leading-6 text-foreground dark:text-sand">
          {props.bestTimeText || "—"}
        </div>
      </div>

      <div className="h-full rounded-xl border border-zinc-200 bg-white p-5 text-foreground shadow-sm dark:border-moss/30 dark:bg-moss/10 dark:text-sand">
        <div>
          <h2 className="text-base font-semibold">Highlight</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-sand/70">
            Key highlights for this campground.
          </p>
        </div>

        <div className="mt-4 whitespace-pre-line text-sm font-semibold leading-6 text-foreground dark:text-sand">
          {props.highlightText || "—"}
        </div>
      </div>

      <div className="h-full rounded-xl border border-zinc-200 bg-white p-5 text-foreground shadow-sm dark:border-moss/30 dark:bg-moss/10 dark:text-sand">
        <div>
          <h2 className="text-base font-semibold">ข้อควรระวัง</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-sand/70">
            Things to know before you go.
          </p>
        </div>

        <div className="mt-4 whitespace-pre-line text-sm font-semibold leading-6 text-foreground dark:text-sand">
          {props.warningText || "—"}
        </div>
      </div>
    </section>
  );
}
