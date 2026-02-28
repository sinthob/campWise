import Link from "next/link";

import { fetchAirtableRecordById, getFirstAttachmentUrl } from "@/lib/airtable";

type CampgroundFields = Record<string, unknown> & {
  "Name Campground"?: string;
};

export const dynamic = "force-dynamic";

function pickString(fields: Record<string, unknown>, keys: string[]) {
  for (const k of keys) {
    const v = fields[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return "";
}

function getAnyAttachmentImageUrl(fields: Record<string, unknown>) {
  const preferredKeys = [
    "Campground Image",
    "Campground Images",
    "Cover",
    "Cover Image",
    "Image",
    "Images",
    "Photo",
    "Photos",
  ];

  for (const key of preferredKeys) {
    const url = getFirstAttachmentUrl(fields[key]);
    if (url) return url;
  }

  for (const value of Object.values(fields)) {
    const url = getFirstAttachmentUrl(value);
    if (url) return url;
  }

  return undefined;
}

export default async function CampgroundDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const tableName = process.env.AIRTABLE_DATA_PATH
    ? "Campgrounds"
    : (process.env.AIRTABLE_TABLE_CAMPGROUNDS ?? "Campgrounds");

  const record = await fetchAirtableRecordById<CampgroundFields>({
    tableName,
    recordId: id,
  });

  if (!record) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-foreground">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/campgrounds"
            className="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300"
          >
            ← Back to Campgrounds
          </Link>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Campground not found
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            This record may have been removed or you may not have access.
          </p>
        </div>
      </div>
    );
  }

  const name =
    record.fields["Name Campground"] ??
    record.fields["Name"] ??
    "Unnamed Campground";

  const imageUrl = getAnyAttachmentImageUrl(record.fields);

  const location =
    pickString(record.fields, ["Location", "Province", "City", "State"]) ||
    pickString(record.fields, ["Type"]) ||
    "";

  const aiSummary = pickString(record.fields, [
    "AI Summary",
    "AI Insight",
    "AI Summary (EN)",
    "Summary",
    "Description",
  ]);

  const rawReview = pickString(record.fields, [
    "Raw Review",
    "Raw Reviews",
    "Reviews",
    "Review",
    "Notes",
  ]);

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <Link
          href="/campgrounds"
          className="text-sm font-medium text-foreground/80 hover:text-accent"
        >
          ← Back to Campgrounds
        </Link>

        <section className="overflow-hidden rounded-3xl border border-moss/30 bg-forest shadow-sm">
          <div className="h-[400px] w-full bg-moss">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={typeof name === "string" ? name : "Campground"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-sand/70">
                No image
              </div>
            )}
          </div>
        </section>

        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {String(name)}
          </h1>
          {location ? (
            <p className="mt-2 text-sm text-foreground/70">{location}</p>
          ) : null}
        </header>

        {aiSummary ? (
          <section className="rounded-2xl border border-moss/30 bg-moss/10 p-6">
            <h2 className="text-base font-semibold text-foreground">
              🤖 AI Summary
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-foreground/80">
              {aiSummary}
            </p>
          </section>
        ) : null}

        {rawReview ? (
          <section className="rounded-2xl border border-moss/30 bg-forest p-6 text-sand">
            <h2 className="text-base font-semibold">📝 Raw Reviews</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-sand/80">
              {rawReview}
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
