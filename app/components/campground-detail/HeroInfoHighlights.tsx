type RatingStarsProps = {
  rating: number; // 1-5
};

function clampRating(rating: number) {
  if (!Number.isFinite(rating)) return 0;
  return Math.min(5, Math.max(0, Math.round(rating)));
}

function RatingStars(props: RatingStarsProps) {
  const rating = clampRating(props.rating);

  return (
    <div
      className="inline-flex items-center gap-1"
      aria-label={`Rating ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, idx) => (
        <span
          key={idx}
          aria-hidden="true"
          className={idx < rating ? "text-accent" : "text-sand/40"}
        >
          ★
        </span>
      ))}
      <span className="ml-2 text-xs font-semibold text-sand/70">
        {rating}/5
      </span>
    </div>
  );
}

function extractTemps(value: string | undefined): {
  min?: number;
  max?: number;
} {
  if (!value) return {};

  const matches = value.match(/\d{1,2}/g);
  if (!matches || matches.length === 0) return {};

  const nums = matches
    .map((m) => Number(m))
    .filter((n) => Number.isFinite(n))
    .slice(0, 2);

  if (nums.length === 0) return {};
  if (nums.length === 1) return { min: nums[0], max: nums[0] };

  const [a, b] = nums;
  return { min: Math.min(a, b), max: Math.max(a, b) };
}

function TempBar(props: { label: string; value?: string }) {
  const temps = extractTemps(props.value);
  const avg =
    temps.min !== undefined && temps.max !== undefined
      ? (temps.min + temps.max) / 2
      : undefined;

  // 5 segments from cold -> warm. Keep this as a visual hint, not scientific.
  const activeSegments =
    avg === undefined
      ? 0
      : avg <= 8
        ? 1
        : avg <= 12
          ? 2
          : avg <= 16
            ? 3
            : avg <= 20
              ? 4
              : 5;

  return (
    <div className="mt-4" aria-label={props.label}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-sand/70">
          {props.label}
        </span>
        <span className="text-xs font-semibold text-sand">
          {props.value || "—"}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full ring-1 ring-moss/30 ${
              idx < activeSegments ? "bg-accent" : "bg-moss/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

type HighlightItem = {
  icon: string;
  label: string;
  value?: string;
};

type HeroInfoHighlightsProps = {
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

function MonthBadges(props: { months: string[] }) {
  const months = (props.months ?? []).map((m) => m.trim()).filter(Boolean);
  if (months.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Best months">
      {months.slice(0, 6).map((m) => (
        <li key={m}>
          <span className="inline-flex items-center rounded-full bg-moss/15 px-3 py-1 text-xs font-semibold text-sand ring-1 ring-moss/30">
            {m}
          </span>
        </li>
      ))}
    </ul>
  );
}

function InfoRow(props: { icon: string; label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-sm font-semibold text-sand">
        <span aria-hidden="true" className="mr-2">
          {props.icon}
        </span>
        {props.label}
      </dt>
      <dd className="text-sm font-semibold text-sand/80">
        {props.value || "—"}
      </dd>
    </div>
  );
}

function HighlightGrid(props: { items: HighlightItem[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {props.items.map((item) => (
        <div
          key={item.label}
          className="flex min-h-[58px] items-start gap-3 rounded-xl bg-forest/60 p-3 ring-1 ring-moss/20"
        >
          <span aria-hidden="true" className="mt-0.5 text-sand/90">
            {item.icon}
          </span>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-sand/70">
              {item.label}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-sand">
              {item.value || "—"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HeroInfoHighlights(props: HeroInfoHighlightsProps) {
  const bestMonths = (props.bestMonths ?? [])
    .map((m) => m.trim())
    .filter(Boolean);

  const highlights: HighlightItem[] = [
    { icon: "🏔", label: "ความสูง", value: props.elevationText },
    { icon: "📷", label: "จุดเด่น", value: props.highlightFogText },
    { icon: "🌄", label: "Sunrise view", value: props.highlightSunriseText },
    { icon: "🚗", label: "เดินทาง", value: props.travelTimeText },
  ];

  return (
    <section
      aria-label="Hero info highlights"
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
    >
      <div className="h-full rounded-xl border border-moss/30 bg-moss/10 p-5 text-sand shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Best Time to Visit</h2>
            <p className="mt-1 text-sm text-sand/70">
              Quick seasonal view for trip planning.
            </p>
          </div>

          {props.rating !== undefined ? (
            <div className="shrink-0">
              <RatingStars rating={props.rating} />
            </div>
          ) : null}
        </div>

        <div className="mt-4">
          <MonthBadges months={bestMonths} />
        </div>

        <dl className="mt-4 space-y-3">
          <InfoRow
            icon="🌤"
            label="ช่วงที่ดีที่สุด"
            value={
              props.bestPeriodText ||
              (bestMonths.length ? bestMonths.join(", ") : undefined)
            }
          />
          <InfoRow icon="🌧" label="ฤดูฝน" value={props.rainySeasonText} />
        </dl>

        <TempBar label="กลางคืน" value={props.nightTempText} />
      </div>

      <div className="h-full rounded-xl border border-moss/30 bg-moss/10 p-5 text-sand shadow-sm">
        <div>
          <h2 className="text-base font-semibold">Elevation + Highlights</h2>
          <p className="mt-1 text-sm text-sand/70">
            Key facts in a compact 2×2 grid.
          </p>
        </div>

        <HighlightGrid items={highlights} />
      </div>
    </section>
  );
}
