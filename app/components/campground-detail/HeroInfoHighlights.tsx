type HeroInfoHighlightsProps = {
  bestTimeText?: string;
  highlightText?: string;
  warningText?: string;

  // Expanded props used by the dynamic detail page.
  bestMonths?: string[];
  bestPeriodText?: string;
  rainySeasonText?: string;
  nightTempText?: string;
  rating?: number;
  elevationText?: string;
  highlightFogText?: string;
  highlightSunriseText?: string;
  travelTimeText?: string;
};

function joinLines(parts: Array<string | undefined | null>) {
  return parts
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter((p) => p.length > 0)
    .join("\n");
}

function labelLine(label: string, value?: string) {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  return `${label}: ${v}`;
}

export default function HeroInfoHighlights(props: HeroInfoHighlightsProps) {
  const bestMonthsText =
    typeof props.bestPeriodText === "string" && props.bestPeriodText.trim()
      ? props.bestPeriodText
      : Array.isArray(props.bestMonths) && props.bestMonths.length > 0
        ? props.bestMonths.join(", ")
        : "";

  const derivedBestTimeText = joinLines([
    props.bestTimeText,
    bestMonthsText ? `Best months: ${bestMonthsText}` : null,
    typeof props.rating === "number" ? `Season score: ${props.rating.toFixed(1)}/5` : null,
  ]);

  const derivedHighlightText = joinLines([
    props.highlightText,
    labelLine("Fog", props.highlightFogText),
    labelLine("Sunrise", props.highlightSunriseText),
    labelLine("Elevation", props.elevationText),
    labelLine("Travel time", props.travelTimeText),
  ]);

  const derivedWarningText = joinLines([
    props.warningText,
    labelLine("Rainy season", props.rainySeasonText),
    labelLine("Night temp", props.nightTempText),
  ]);

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
          {derivedBestTimeText || "—"}
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
          {derivedHighlightText || "—"}
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
          {derivedWarningText || "—"}
        </div>
      </div>
    </section>
  );
}
