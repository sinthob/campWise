import Link from "next/link";

import { fetchAirtableTablePage, getFirstAttachmentUrl } from "@/lib/airtable";
import ListFilters from "@/app/components/list-filters";

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

export default async function CampgroundsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const requestedPage = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;

  const q = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const type = Array.isArray(searchParams.type)
    ? searchParams.type[0]
    : searchParams.type;
  const typeField = process.env.AIRTABLE_CAMPGROUNDS_TYPE_FIELD ?? "Type";

  const tableName = process.env.AIRTABLE_DATA_PATH
    ? "Campgrounds"
    : (process.env.AIRTABLE_TABLE_CAMPGROUNDS ?? "Campgrounds");

  const { records, page, hasNextPage } =
    await fetchAirtableTablePage<CampgroundFields>({
      tableName,
      page: requestedPage,
      pageSize: 10,
      query: q,
      searchFields: ["Name Campground", "Name", "Province", typeField],
      typeField,
      typeValue: type,
    });

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (type) qs.set("type", type);
  const qsString = qs.toString();

  const prevHref =
    page > 1
      ? `/campgrounds?page=${page - 1}${qsString ? `&${qsString}` : ""}`
      : null;
  const nextHref = hasNextPage
    ? `/campgrounds?page=${page + 1}${qsString ? `&${qsString}` : ""}`
    : null;

  const typeOptions = Array.from(
    new Set(
      records
        .map((r) => r.fields[typeField])
        .filter(
          (v): v is string => typeof v === "string" && v.trim().length > 0,
        ),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Campgrounds</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Discover camping spots from our Airtable directory.
          </p>
        </header>

        <ListFilters
          basePath="/campgrounds"
          searchPlaceholder="Search campgrounds..."
          typeLabel="Type"
          typePlaceholder="All types"
          typeOptions={typeOptions}
        />

        <section className="flex flex-col gap-6">
          {records.map((record) => {
            const name =
              record.fields["Name Campground"] ??
              record.fields["Name"] ??
              "Unnamed Campground";

            const imageUrl = getAnyAttachmentImageUrl(record.fields);

            const details = getPrimitiveDetails(record.fields, [
              "Name Campground",
              "Name",
            ]).slice(0, 4);

            return (
              <article
                key={record.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-primary/50 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full bg-zinc-100 dark:bg-zinc-900 md:w-80">
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

                  <div className="flex-1 p-5 sm:p-6">
                    <h2 className="text-xl font-semibold leading-7">
                      {String(name)}
                    </h2>

                    {details.length > 0 ? (
                      <dl className="mt-3 grid grid-cols-1 gap-y-2 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-2 sm:gap-x-6">
                        {details.map((d) => (
                          <div key={d.key} className="flex min-w-0 gap-2">
                            <dt className="min-w-28 font-semibold text-slate-900 dark:text-slate-200">
                              {d.key}
                            </dt>
                            <dd className="min-w-0 flex-1 truncate" title={d.value}>
                              {d.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                        No additional details available.
                      </p>
                    )}

                    <div className="mt-4">
                      <Link
                        href={`/campgrounds/${record.id}`}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 hover:border-primary/40 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:border-primary/40 dark:hover:bg-slate-900"
                      >
                        ดูรายละเอียดเพิ่มเติม
                      </Link>
                    </div>
                  </div>
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
