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
      className="rounded-2xl bg-forest/60 p-4 ring-1 ring-moss/30"
    >
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={`${item.label}:${item.value}`}
            className="inline-flex items-center gap-2 rounded-full bg-forest px-3 py-2 text-sm text-sand ring-1 ring-moss/30"
          >
            <span aria-hidden="true" className="text-sand/80">
              {item.icon ?? "•"}
            </span>
            <span className="text-sand/70">{item.label}:</span>
            <span className="font-medium text-sand">{item.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
