import Link from "next/link";

import { fetchAirtableTablePage } from "@/lib/airtable";

type CampgroundFields = Record<string, unknown> & {
  "Name Campground"?: string;
};

export const dynamic = "force-dynamic";

function getPrimitiveDetails(
  fields: Record<string, unknown>,
  excludeKeys: string[],
) {
  return Object.entries(fields)
    .filter(([key]) => !excludeKeys.includes(key))
    .filter(([, value]) => {
      const t = typeof value;
      return (
        t === "string" || t === "number" || t === "boolean" || value === null
      );
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

export default async function CampgroundsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const requestedPage = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;

  const tableName = process.env.AIRTABLE_TABLE_CAMPGROUNDS ?? "Campgrounds";

  const { records, page, hasNextPage } =
    await fetchAirtableTablePage<CampgroundFields>({
      tableName,
      page: requestedPage,
      pageSize: 10,
    });

  const prevHref = page > 1 ? `/campgrounds?page=${page - 1}` : null;
  const nextHref = hasNextPage ? `/campgrounds?page=${page + 1}` : null;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Campgrounds</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Discover camping spots from our Airtable directory.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => {
            const name =
              record.fields["Name Campground"] ??
              record.fields["Name"] ??
              "Unnamed Campground";

            const details = getPrimitiveDetails(record.fields, [
              "Name Campground",
              "Name",
            ]).slice(0, 6);

            return (
              <article
                key={record.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h2 className="text-lg font-semibold leading-6">
                  {String(name)}
                </h2>
                {details.length > 0 ? (
                  <dl className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {details.map((d) => (
                      <div key={d.key} className="flex gap-2">
                        <dt className="min-w-28 font-medium text-zinc-700 dark:text-zinc-300">
                          {d.key}
                        </dt>
                        <dd className="flex-1">{d.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                    No additional details available.
                  </p>
                )}
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
