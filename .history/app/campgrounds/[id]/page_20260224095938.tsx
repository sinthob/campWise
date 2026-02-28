import Link from "next/link";

import {
  fetchAirtableRecordById,
  getFirstAttachmentUrl,
} from "@/lib/airtable";

type CampgroundFields = Record<string, unknown> & {
  "Name Campground"?: string;
};

export const dynamic = "force-dynamic";

function getPrimitiveDetails(fields: Record<string, unknown>, excludeKeys: string[]) {
  return Object.entries(fields)
    .filter(([key]) => !excludeKeys.includes(key))
    .filter(([, value]) => {
      const t = typeof value;
      return t === "string" || t === "number" || t === "boolean" || value === null;
    })
    .map(([key, value]) => ({
      key,
      value:
        value === null
          ? "-"
          : typeof value === "boolean"
            ? value
              ? "Yes"
              : "No"
            : String(value),
    }));
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

  const details = getPrimitiveDetails(record.fields, ["Name Campground", "Name"]);

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/campgrounds"
          className="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300"
        >
          ← Back to Campgrounds
        </Link>

        <header className="mt-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            {String(name)}
          </h1>
        </header>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative w-full bg-zinc-100 dark:bg-zinc-900">
            <div className="aspect-[16/9] w-full">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={typeof name === "string" ? name : "Campground"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
                  Image placeholder
                </div>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {details.length > 0 ? (
              <dl className="grid grid-cols-1 gap-y-3 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-2 sm:gap-x-8">
                {details.map((d) => (
                  <div key={d.key} className="flex min-w-0 gap-2">
                    <dt className="min-w-32 font-semibold text-slate-900 dark:text-slate-200">
                      {d.key}
                    </dt>
                    <dd className="min-w-0 flex-1 break-words">{d.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No additional details available.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
