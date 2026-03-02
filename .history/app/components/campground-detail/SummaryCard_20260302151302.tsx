export default function SummaryCard(props: {
  badgeLabel: string;
  title: string;
  location?: string;
  aiSummary?: string;
}) {
  return (
    <section
      aria-label="Summary"
      className="rounded-3xl border border-moss/30 bg-forest p-6 text-sand shadow-sm"
    >
      <div className="inline-flex rounded-full bg-forest/60 px-3 py-1 text-xs font-semibold text-sand ring-1 ring-moss/40">
        {props.badgeLabel}
      </div>

      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-[28px]">
        {props.title}
      </h1>

      {props.location ? (
        <p className="mt-2 text-sm text-sand/70">{props.location}</p>
      ) : null}

      {props.aiSummary ? (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-sand">🤖 AI Summary</h2>
          <p className="mt-2 whitespace-pre-line text-base leading-[1.7] text-sand/85">
            {props.aiSummary}
          </p>
        </div>
      ) : null}
    </section>
  );
}
