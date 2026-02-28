import Link from "next/link";

type ExploreCardProps = {
  typePath: string;
  id: string;
  badge: "Campground" | "Gear" | "Hack" | string;
  title: string;
  subtitle?: string;
  image?: string;
  summary?: string;
};

export default function ExploreCard(props: ExploreCardProps) {
  const href = `/${props.typePath}/${props.id}`;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-moss/30 bg-forest text-sand shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      aria-label={`${props.badge}: ${props.title}`}
    >
      <div className="relative w-full bg-moss">
        <div className="absolute left-3 top-3 z-10 rounded-full bg-forest/80 px-3 py-1 text-xs font-semibold text-sand ring-1 ring-moss/40 backdrop-blur">
          {props.badge}
        </div>

        <div className="aspect-[16/9] w-full">
          {props.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.image}
              alt={props.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-sand/70">
              No image
            </div>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="text-lg font-semibold leading-6 tracking-tight">
          {props.title}
        </h3>
        {props.subtitle ? (
          <p className="mt-1 text-sm text-sand/70">{props.subtitle}</p>
        ) : null}

        {props.summary ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-sand/80">
            {props.summary}
          </p>
        ) : null}

        <div className="mt-4 text-sm font-medium text-accent">
          ดูรายละเอียดเพิ่มเติม →
        </div>
      </div>
    </Link>
  );
}
