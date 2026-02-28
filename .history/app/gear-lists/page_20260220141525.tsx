import Link from "next/link";

import {
  fetchAirtableTablePage,
  getFirstAttachmentUrl,
} from "@/lib/airtable";

type GearListFields = {
  "Set Name"?: string;
  "AI Gear Tip"?: string;
  "Gear Image"?: unknown;
};

export const dynamic = "force-dynamic";

export default async function GearListsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const requestedPage = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;

  const { records, page, hasNextPage } = await fetchAirtableTablePage<GearListFields>(
    {
      tableName: "Gear_Lists",
      page: requestedPage,
      pageSize: 10,
    },
  );

  const prevHref = page > 1 ? `/gear-lists?page=${page - 1}` : null;
  const nextHref = hasNextPage ? `/gear-lists?page=${page + 1}` : null;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Gear Listing
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Curated gear sets with AI suggestions.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => {
            const setName = record.fields["Set Name"] ?? "Untitled Set";
            const tip = record.fields["AI Gear Tip"] ?? "";
            const imageUrl = getFirstAttachmentUrl(record.fields["Gear Image"]);

            return (
              <article
                key={record.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="relative aspect-[16/10] w-full bg-zinc-100 dark:bg-zinc-900">
                  {imageUrl ? (
                    // Using <img> avoids needing Next image remotePatterns for Airtable.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={typeof setName === "string" ? setName : "Gear image"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-semibold leading-6">{setName}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {tip || "No AI gear tip available yet."}
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
