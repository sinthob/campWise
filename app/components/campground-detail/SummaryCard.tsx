import type { ReactNode } from "react";

export default function SummaryCard(props: {
  badgeLabel: string;
  title: string;
  location?: string;
  aiSummary?: string;
  quickInfo?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section
      aria-label="Summary"
      className="rounded-3xl border border-zinc-200 bg-white p-6 text-foreground shadow-sm dark:border-moss/30 dark:bg-forest dark:text-sand"
    >
      <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-primary/20 dark:bg-forest/60 dark:text-sand dark:ring-moss/40">
        {props.badgeLabel}
      </div>

      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-[28px]">
        {props.title}
      </h1>

      {props.location ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-sand/70">
          {props.location}
        </p>
      ) : null}

      {props.quickInfo ? <div className="mt-1">{props.quickInfo}</div> : null}

      {props.actions ? <div className="mt-5">{props.actions}</div> : null}

      {props.aiSummary ? (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-foreground dark:text-sand">
            🤖 AI Summary
          </h2>
          <p className="mt-2 whitespace-pre-line text-base leading-[1.7] text-slate-700 dark:text-sand/85">
            {props.aiSummary}
          </p>
        </div>
      ) : null}
    </section>
  );
}
