import Link from "next/link";

import { fetchAirtableTablePage, getFirstAttachmentUrl } from "@/lib/airtable";
import ListFilters from "@/app/components/list-filters";
import ExploreCard from "@/components/ExploreCard";

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
          <h1 className="text-3xl font-semibold tracking-tight">ลานกางเต็นท์</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground/70">
            ค้นหาลานกางเต็นท์จาก Airtable ของเรา
          </p>
        </header>

        <ListFilters
          basePath="/campgrounds"
          searchPlaceholder="ค้นหาลานกางเต็นท์..."
          typeLabel="ประเภท"
          typePlaceholder="ทุกประเภท"
          typeOptions={typeOptions}
        />

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => {
            const name =
              record.fields["Name Campground"] ??
              record.fields["Name"] ??
              "ลานกางเต็นท์ (ไม่มีชื่อ)";

            const imageUrl = getAnyAttachmentImageUrl(record.fields);

            const location =
              pickString(record.fields, [
                "Location",
                "Province",
                "City",
                "State",
              ]) ||
              pickString(record.fields, [typeField]) ||
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
              <ExploreCard
                key={record.id}
                typePath="campground"
                id={record.id}
                badge="แคมป์"
                title={String(name)}
                subtitle={location}
                image={imageUrl}
                summary={aiSummary || rawReview}
              />
            );
          })}
        </section>

        <nav className="mt-10 flex items-center justify-between">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            หน้า {page}
          </div>
          <div className="flex gap-3">
            {prevHref ? (
              <Link
                href={prevHref}
                className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                ก่อนหน้า
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-5 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                ก่อนหน้า
              </span>
            )}

            {nextHref ? (
              <Link
                href={nextHref}
                className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                ถัดไป
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-5 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                ถัดไป
              </span>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
