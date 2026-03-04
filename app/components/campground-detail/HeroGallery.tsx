type HeroGalleryImage = {
  url: string;
  alt: string;
};

export default function HeroGallery(props: {
  title: string;
  images: HeroGalleryImage[];
}) {
  const images = props.images.filter(
    (img) => typeof img.url === "string" && img.url,
  );

  return (
    <section
      aria-label="Campground photos"
      className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-moss/30 dark:bg-forest"
    >
      {images.length > 0 ? (
        <div className="space-y-4 p-4">
          <div className="relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-moss">
            <div className="aspect-[16/10] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0].url}
                alt={images[0].alt}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {images.length > 1 ? (
            <ul className="grid grid-cols-4 gap-3" aria-label="More photos">
              {images.slice(1, 5).map((img) => (
                <li
                  key={img.url}
                  className="overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200 dark:bg-moss dark:ring-moss/40"
                >
                  <div className="aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {images.length > 5 ? (
            <p className="text-xs text-slate-600 dark:text-sand/70">
              Showing 5 of {images.length} photos
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex h-[320px] w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500 dark:bg-moss dark:text-sand/70 sm:h-[420px]">
          No image available
        </div>
      )}

      <div className="sr-only">
        Photo gallery for {props.title}. {images.length} photos.
      </div>
    </section>
  );
}
