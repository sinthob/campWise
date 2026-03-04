type QuickInfoItem = {
  icon: string;
  label: string;
  value: string;
};

export default function QuickInfoBar(props: { items: QuickInfoItem[] }) {
  const items = (props.items ?? []).filter((i) => i.value.trim().length > 0);
  if (items.length === 0) return null;

  return (
    <section aria-label="Quick info" className="mt-4">
      <ul
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-3 md:overflow-visible lg:grid-cols-4"
        role="list"
      >
        {items.map((item) => (
          <li
            key={`${item.label}:${item.value}`}
            className="min-w-max md:min-w-0"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-zinc-200 dark:bg-moss/15 dark:text-sand dark:ring-moss/30">
              <span
                aria-hidden="true"
                className="text-foreground dark:text-sand/90"
              >
                {item.icon}
              </span>
              <span className="text-slate-600 dark:text-sand/75">
                {item.label}
              </span>
              <span className="font-semibold text-foreground dark:text-sand">
                {item.value}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
