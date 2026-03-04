export default function MapPreview(props: {
  title: string;
  embedUrl: string;
  mapsUrl: string;
}) {
  return (
    <section
      aria-label="Map preview"
      className="rounded-3xl border border-moss/30 bg-forest p-4 text-sand shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Map</h2>
        <a
          href={props.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-sand ring-1 ring-moss/30 hover:bg-forest/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          🗺 Open in Google Maps
        </a>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-moss/30">
        <div className="aspect-[16/9] w-full bg-moss/20">
          <iframe
            title={`Map preview for ${props.title}`}
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
