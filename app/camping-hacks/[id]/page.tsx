import Link from "next/link";

import { fetchAirtableRecordById, getFirstAttachmentUrl } from "@/lib/airtable";

type CampingHackFields = Record<string, unknown> & {
  "Topic name"?: string;
  Content?: string;
};

export const dynamic = "force-dynamic";

function getAnyAttachmentImageUrl(fields: Record<string, unknown>) {
  const preferredKeys = [
    "Hack Image",
    "Hack Images",
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

export default async function CampingHackDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const tableName = process.env.AIRTABLE_DATA_PATH
    ? "Camping_Hacks"
    : (process.env.AIRTABLE_TABLE_CAMPING_HACKS ?? "Camping_Hacks");

  const record = await fetchAirtableRecordById<CampingHackFields>({
    tableName,
    recordId: id,
  });

  if (!record) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-foreground">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/camping-hacks"
            className="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300"
          >
            ← Back to Tips &amp; Hacks
          </Link>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Tip / Hack not found
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            This record may have been removed or you may not have access.
          </p>
        </div>
      </div>
    );
  }

  const title = record.fields["Topic name"] ?? "Untitled";
  const content = record.fields.Content ?? "";
  const imageUrl = getAnyAttachmentImageUrl(record.fields);

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/camping-hacks"
          className="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300"
        >
          ← Back to Tips &amp; Hacks
        </Link>

        <header className="mt-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            {String(title)}
          </h1>
        </header>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative w-full bg-zinc-100 dark:bg-zinc-900">
            <div className="aspect-[16/9] w-full">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={typeof title === "string" ? title : "Camping tip"}
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
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300">
              {content || "No content available yet."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
