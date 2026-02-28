import Link from "next/link";

import { fetchAirtableTablePage, getFirstAttachmentUrl } from "@/lib/airtable";
import ListFilters from "@/app/components/list-filters";
import ExploreCard from "@/components/ExploreCard";

type GearListFields = {
  "Set Name"?: string;
  "AI Gear Tip"?: string;
  "Gear Image"?: unknown;
};

export const dynamic = "force-dynamic";

function toExcerpt(value: unknown, maxChars: number) {
  const raw = typeof value === "string" ? value : String(value ?? "");
  const s = raw.replace(/\s+/g, " ").trim();
  if (s.length <= maxChars) return s;
  return `${s.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

export default async function GearListsPage(props: {
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
  const typeField = process.env.AIRTABLE_GEAR_LISTS_TYPE_FIELD ?? "Type";

  const tableName = process.env.AIRTABLE_DATA_PATH
    ? "Gear_Lists"
    : (process.env.AIRTABLE_TABLE_GEAR_LISTS ?? "Gear_Lists");

  const { records, page, hasNextPage } =
    await fetchAirtableTablePage<GearListFields>({
      tableName,
      page: requestedPage,
      pageSize: 10,
      query: q,
      searchFields: ["Set Name", "AI Gear Tip", typeField],
      typeField,
      typeValue: type,
    });

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (type) qs.set("type", type);
  const qsString = qs.toString();

  const prevHref =
    page > 1
      ? `/gear-lists?page=${page - 1}${qsString ? `&${qsString}` : ""}`
      : null;
  const nextHref = hasNextPage
    ? `/gear-lists?page=${page + 1}${qsString ? `&${qsString}` : ""}`
    : null;

  const typeOptions = Array.from(
    new Set(
      records
        .map((r) => (r.fields as Record<string, unknown>)[typeField])
        .filter(
          (v): v is string => typeof v === "string" && v.trim().length > 0,
        ),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Gear Listing
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Curated gear sets with AI suggestions.
          </p>
        </header>

        <ListFilters
          basePath="/gear-lists"
          searchPlaceholder="Search gear lists..."
          typeLabel="Type"
          typePlaceholder="All types"
          typeOptions={typeOptions}
        />

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => {
            const setName = record.fields["Set Name"] ?? "Untitled Set";
            const tip = record.fields["AI Gear Tip"] ?? "";
            const imageUrl = getFirstAttachmentUrl(record.fields["Gear Image"]);
            const excerpt = toExcerpt(tip, 160);

            return (
              <ExploreCard
                key={record.id}
                typePath="gear-lists"
                id={record.id}
                badge="Gear"
                title={String(setName)}
                image={imageUrl}
                summary={excerpt || "No AI gear tip available yet."}
              />
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
