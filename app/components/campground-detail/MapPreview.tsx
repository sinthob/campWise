export default function MapPreview(props: {
  title: string;
  embedUrl: string;
  mapsUrl: string;
}) {
  return (
    <section
      aria-label="แผนที่"
      className="rounded-3xl border border-zinc-200 bg-white p-4 text-foreground shadow-sm dark:border-moss/30 dark:bg-forest dark:text-sand"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">แผนที่</h2>
        <a
          href={props.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-transparent dark:bg-forest dark:text-sand dark:ring-1 dark:ring-moss/30 dark:hover:bg-forest/80"
        >
          🗺 เปิดใน Google Maps
        </a>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-zinc-200 dark:ring-moss/30">
        <div className="aspect-[16/9] w-full bg-zinc-100 dark:bg-moss/20">
          <iframe
            title={`แผนที่สำหรับ ${props.title}`}
            src={props.embedUrl}
            loading="lazy"
            className="h-full w-full"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
