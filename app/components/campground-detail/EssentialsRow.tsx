type EssentialItem = {
  label: string;
  value: string;
  icon?: string;
};

export default function EssentialsRow(props: { items: EssentialItem[] }) {
  const items = (props.items ?? []).filter((i) => i.value);
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Essentials"
      className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-forest/60 dark:ring-moss/30"
    >
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={`${item.label}:${item.value}`}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-zinc-200 dark:bg-forest dark:text-sand dark:ring-moss/30"
          >
            <span
              aria-hidden="true"
              className="text-foreground/70 dark:text-sand/80"
            >
              {item.icon ?? "•"}
            </span>
            <span className="text-slate-600 dark:text-sand/70">
              {item.label}:
            </span>
            <span className="font-medium text-foreground dark:text-sand">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
