import Link from "next/link";

import { fetchAirtableTablePage, getFirstAttachmentUrl } from "@/lib/airtable";

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

export default async function CampingHacksPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const requestedPage = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;

  const tableName = process.env.AIRTABLE_DATA_PATH
    ? "Camping_Hacks"
    : (process.env.AIRTABLE_TABLE_CAMPING_HACKS ?? "Camping_Hacks");

  const { records, page, hasNextPage } =
    await fetchAirtableTablePage<CampingHackFields>({
      tableName,
      page: requestedPage,
      pageSize: 10,
    });

  const prevHref = page > 1 ? `/camping-hacks?page=${page - 1}` : null;
  const nextHref = hasNextPage ? `/camping-hacks?page=${page + 1}` : null;

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Camping Tips &amp; Hacks
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-800 dark:text-zinc-400">
            Practical techniques and ideas for smarter camping.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {records.map((record) => {
            const title = record.fields["Topic name"] ?? "Untitled";
            const content = record.fields.Content ?? "";
            const imageUrl = getAnyAttachmentImageUrl(record.fields);

            return (
              <article
                key={record.id}
                className="overflow-hidden rounded-2xl border border-zinc-900 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
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

                <div className="p-6">
                  <h2 className="text-xl font-semibold leading-7">
                    {String(title)}
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-800 dark:text-zinc-400">
                    {content || "No content available yet."}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <nav className="mt-10 flex items-center justify-between">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {page}
          </div>
          <div className="flex gap-3">
            {prevHref ? (
              <Link
                href={prevHref}
                className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-5 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                Previous
              </span>
            )}

            {nextHref ? (
              <Link
                href={nextHref}
                className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-5 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                Next
              </span>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
