import Link from "next/link";

import { fetchAirtableRecordById, getFirstAttachmentUrl } from "@/lib/airtable";

export const dynamic = "force-dynamic";

type DetailType = "campground" | "gear" | "hack";

type AiInsightJson = Partial<{
  strengths: unknown;
  weaknesses: unknown;
  bestFor: unknown;
  tips: unknown;
}>;

type TypeConfig = {
  badge: string;
  listHref: string;
  // For live Airtable mode.
  tableEnvVar?: string;
  defaultTableName: string;
  titleKeys: string[];
  locationKeys: string[];
  imageKeys: string[];
  aiSummaryKeys: string[];
  rawReviewKeys: string[];
  insightKeys: {
    strengths: string[];
    weaknesses: string[];
    bestFor: string[];
    tips: string[];
  };
  quickFactsExclude: string[];
};

const TYPE_CONFIG: Record<DetailType, TypeConfig> = {
  campground: {
    badge: "Campground",
    listHref: "/campgrounds",
    tableEnvVar: "AIRTABLE_TABLE_CAMPGROUNDS",
    defaultTableName: "Campgrounds",
    titleKeys: ["Name Campground", "Name", "Title"],
    locationKeys: ["Location", "Province", "City", "State", "Country", "Type"],
    imageKeys: [
      "Campground Image",
      "Campground Images",
      "Cover",
      "Cover Image",
      "Image",
      "Images",
      "Photo",
      "Photos",
    ],
    aiSummaryKeys: ["AI Summary", "AI Insight", "Summary", "Description"],
    rawReviewKeys: ["Raw Review", "Raw Reviews", "Reviews", "Review", "Notes"],
    insightKeys: {
      strengths: ["Strengths", "Pros", "Highlights"],
      weaknesses: ["Weaknesses", "Cons", "Cautions"],
      bestFor: ["Best for", "Best For", "Suitable for", "Ideal for"],
      tips: [
        "Tips",
        "Recommendations",
        "What to bring",
        "What to bring / Tips",
      ],
    },
    quickFactsExclude: [
      "Roadmap Guide one day",
      "Roadmap Guide two day",
      "AI Summary",
      "AI Insight",
      "Summary",
      "Description",
      "Raw Review",
      "Raw Reviews",
      "Reviews",
      "Review",
      "Notes",
    ],
  },
  gear: {
    badge: "Gear",
    listHref: "/gear-lists",
    tableEnvVar: "AIRTABLE_TABLE_GEAR_LISTS",
    defaultTableName: "Gear_Lists",
    titleKeys: ["Set Name", "Name", "Title"],
    locationKeys: ["Type", "Category"],
    imageKeys: ["Gear Image", "Image", "Images", "Photo", "Photos"],
    aiSummaryKeys: [
      "AI Gear Tip",
      "AI Summary",
      "AI Insight",
      "Summary",
      "Description",
    ],
    rawReviewKeys: ["Raw Review", "Raw Reviews", "Reviews", "Review", "Notes"],
    insightKeys: {
      strengths: ["Strengths", "Pros"],
      weaknesses: ["Weaknesses", "Cons"],
      bestFor: ["Best for", "Best For", "Suitable for"],
      tips: ["AI Gear Tip", "Tips", "Recommendations"],
    },
    quickFactsExclude: [
      "AI Gear Tip",
      "AI Summary",
      "AI Insight",
      "Summary",
      "Description",
      "Raw Review",
      "Raw Reviews",
      "Reviews",
      "Review",
      "Notes",
      "Gear Image",
      "Image",
      "Images",
      "Photo",
      "Photos",
    ],
  },
  hack: {
    badge: "Hack",
    listHref: "/camping-hacks",
    tableEnvVar: "AIRTABLE_TABLE_CAMPING_HACKS",
    defaultTableName: "Camping_Hacks",
    titleKeys: ["Topic name", "Title", "Name"],
    locationKeys: ["Category", "Type"],
    imageKeys: [
      "Hack Image",
      "Hack Images",
      "Cover",
      "Cover Image",
      "Image",
      "Images",
      "Photo",
      "Photos",
    ],
    aiSummaryKeys: ["AI Summary", "AI Insight", "Summary"],
    rawReviewKeys: ["Raw Review", "Raw Reviews", "Reviews", "Review", "Notes"],
    insightKeys: {
      strengths: ["Strengths", "Pros"],
      weaknesses: ["Weaknesses", "Cons"],
      bestFor: ["Best for", "Best For", "Suitable for"],
      tips: ["Tips", "Recommendations", "Content"],
    },
    quickFactsExclude: [
      "Content",
      "AI Summary",
      "AI Insight",
      "Summary",
      "Raw Review",
      "Raw Reviews",
      "Reviews",
      "Review",
      "Notes",
    ],
  },
};

function pickString(fields: Record<string, unknown>, keys: string[]) {
  for (const k of keys) {
    const v = fields[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return "";
}

function getAnyAttachmentImageUrl(
  fields: Record<string, unknown>,
  preferredKeys: string[],
) {
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

function getQuickFacts(fields: Record<string, unknown>, excludeKeys: string[]) {
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
    }))
    .slice(0, 10);
}

function toStringListFromUnknown(value: unknown): string[] {
  if (value === null || value === undefined) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((v) =>
        typeof v === "string" ? [v] : typeof v === "number" ? [String(v)] : [],
      )
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") return [];

  const normalized = value.replace(/\r/g, "").trim();
  if (!normalized) return [];

  // Split on newlines and common bullet prefixes.
  const parts = normalized
    .split(/\n|•|\u2022/g)
    .flatMap((p) => p.split(/^\s*[-*]\s*/m))
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length > 1) return parts;

  // If it's a single line, try comma-splitting as a fallback.
  if (normalized.includes(",")) {
    return normalized
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
  }

  return [normalized];
}

function toMultilineStringFromUnknown(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value.trim();

  if (Array.isArray(value)) {
    return value
      .map((v) =>
        typeof v === "string"
          ? v.trim()
          : typeof v === "number"
            ? String(v)
            : "",
      )
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function parseAiInsightJson(raw: string | undefined | null): {
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  tips: string[];
} | null {
  if (!raw || typeof raw !== "string") return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const obj = parsed as AiInsightJson;
    const strengths = toStringListFromUnknown(obj.strengths);
    const weaknesses = toStringListFromUnknown(obj.weaknesses);
    const bestFor = toStringListFromUnknown(obj.bestFor);
    const tips = toStringListFromUnknown(obj.tips);

    if (
      strengths.length === 0 &&
      weaknesses.length === 0 &&
      bestFor.length === 0 &&
      tips.length === 0
    ) {
      return null;
    }

    return { strengths, weaknesses, bestFor, tips };
  } catch {
    return null;
  }
}

export default async function DynamicDetailPage(props: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await props.params;

  if (type !== "campground" && type !== "gear" && type !== "hack") {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-foreground">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="text-2xl font-semibold">Not found</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Unknown type. Use /campground/[id], /gear/[id], or /hack/[id].
          </p>
        </div>
      </div>
    );
  }

  const cfg = TYPE_CONFIG[type];

  const tableName = process.env.AIRTABLE_DATA_PATH
    ? cfg.defaultTableName
    : (process.env[cfg.tableEnvVar ?? ""] ?? cfg.defaultTableName);

  const record = await fetchAirtableRecordById<Record<string, unknown>>({
    tableName,
    recordId: id,
  });

  if (!record) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-foreground">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href={cfg.listHref}
            className="text-sm font-medium text-foreground/80 hover:text-accent"
          >
            ← Back
          </Link>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Item not found
          </h1>
          <p className="mt-2 text-sm text-foreground/70">
            This record may have been removed or you may not have access.
          </p>
        </div>
      </div>
    );
  }

  const title = pickString(record.fields, cfg.titleKeys) || "Untitled";
  const location = pickString(record.fields, cfg.locationKeys);
  const imageUrl = getAnyAttachmentImageUrl(record.fields, cfg.imageKeys);

  const strengths = pickString(record.fields, cfg.insightKeys.strengths);
  const weaknesses = pickString(record.fields, cfg.insightKeys.weaknesses);
  const bestFor = pickString(record.fields, cfg.insightKeys.bestFor);
  const tips = pickString(record.fields, cfg.insightKeys.tips);

  const fallbackAiSummary = pickString(record.fields, cfg.aiSummaryKeys);
  const rawReview = pickString(record.fields, cfg.rawReviewKeys);

  const aiSummaryTrimmed = fallbackAiSummary?.trim();
  const aiSummaryLooksJson =
    !!aiSummaryTrimmed &&
    (aiSummaryTrimmed.startsWith("{") || aiSummaryTrimmed.startsWith("["));

  const parsedInsight = parseAiInsightJson(fallbackAiSummary);
  const strengthsList = parsedInsight?.strengths?.length
    ? parsedInsight.strengths
    : toStringListFromUnknown(strengths);
  const weaknessesList = parsedInsight?.weaknesses?.length
    ? parsedInsight.weaknesses
    : toStringListFromUnknown(weaknesses);
  const bestForList = parsedInsight?.bestFor?.length
    ? parsedInsight.bestFor
    : toStringListFromUnknown(bestFor);
  const tipsList = parsedInsight?.tips?.length
    ? parsedInsight.tips
    : toStringListFromUnknown(
        tips ?? (aiSummaryLooksJson ? undefined : fallbackAiSummary),
      );

  const hasAnyInsight =
    strengthsList.length > 0 ||
    weaknessesList.length > 0 ||
    bestForList.length > 0 ||
    tipsList.length > 0;

  const quickFacts = getQuickFacts(record.fields, cfg.quickFactsExclude);

  const roadmapOneDay =
    type === "campground"
      ? toMultilineStringFromUnknown(record.fields["Roadmap Guide one day"])
      : "";
  const roadmapTwoDay =
    type === "campground"
      ? toMultilineStringFromUnknown(record.fields["Roadmap Guide two day"])
      : "";

  const hasAnyRoadmap = !!(roadmapOneDay || roadmapTwoDay);

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <Link
          href={cfg.listHref}
          className="text-sm font-medium text-foreground/80 hover:text-accent"
        >
          ← Back
        </Link>

        {/* 1) Hero */}
        <section className="overflow-hidden rounded-3xl border border-moss/30 bg-forest shadow-sm">
          <div className="relative h-[320px] w-full bg-moss sm:h-[420px]">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-sand/70">
                No image
              </div>
            )}

            <div className="absolute left-4 top-4 rounded-full bg-forest/80 px-3 py-1 text-xs font-semibold text-sand ring-1 ring-moss/40 backdrop-blur">
              {cfg.badge}
            </div>
          </div>
        </section>

        <header>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {location ? (
            <p className="mt-2 text-sm text-foreground/70">{location}</p>
          ) : null}
        </header>

        {/* 2) AI Insight */}
        {hasAnyInsight ? (
          <section className="rounded-2xl border border-moss/30 bg-moss/10 p-6">
            <h2 className="text-base font-semibold">🤖 AI Insight</h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {strengthsList.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold">Strengths</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-foreground/80">
                    {strengthsList.map((item, idx) => (
                      <li key={`${idx}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {weaknessesList.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold">Weaknesses</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-foreground/80">
                    {weaknessesList.map((item, idx) => (
                      <li key={`${idx}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {bestForList.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold">Best for</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-foreground/80">
                    {bestForList.map((item, idx) => (
                      <li key={`${idx}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {tipsList.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold">Tips</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-foreground/80">
                    {tipsList.map((item, idx) => (
                      <li key={`${idx}-${item}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* 3) Quick Facts */}
        {quickFacts.length > 0 ? (
          <section className="rounded-2xl border border-moss/30 bg-forest p-6 text-sand">
            <h2 className="text-base font-semibold">Quick Facts</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {quickFacts.map((f) => (
                <div
                  key={f.key}
                  className="rounded-xl bg-forest/60 p-4 ring-1 ring-moss/30"
                >
                  <dt className="text-xs font-semibold text-sand/70">
                    {f.key}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-sand">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {/* 4) Raw review (collapsible) */}
        {/* 4) Trip planning (campground only) */}
        {type === "campground" && hasAnyRoadmap ? (
          <section className="rounded-2xl border border-moss/30 bg-forest p-6 text-sand">
            <h2 className="text-base font-semibold">แนะนำการวางแผนทริป</h2>
            <p className="mt-1 text-sm text-sand/70">
              แผนตัวอย่างสำหรับทริปสั้นและทริปวันหยุดยาว (ดึงจาก Airtable)
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-forest/60 p-5 ring-1 ring-moss/30">
                <h3 className="text-sm font-semibold">
                  1 วัน 1 คืน (แนะนำสำหรับสุดสัปดาห์)
                </h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-sand/80">
                  {roadmapOneDay || "ยังไม่มีข้อมูลใน Airtable"}
                </p>
              </div>

              <div className="rounded-xl bg-forest/60 p-5 ring-1 ring-moss/30">
                <h3 className="text-sm font-semibold">
                  2 วัน 2 คืน (แนะนำสำหรับวันหยุดยาว)
                </h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-sand/80">
                  {roadmapTwoDay || "ยังไม่มีข้อมูลใน Airtable"}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {/* 5) Raw review (collapsible) */}
        {rawReview ? (
          <section className="rounded-2xl border border-moss/30 bg-forest p-6 text-sand">
            <details className="group">
              <summary className="cursor-pointer list-none text-base font-semibold">
                📝 Raw review
                <span className="ml-2 text-sm font-medium text-accent">
                  (click to {"open"})
                </span>
              </summary>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-sand/80">
                {rawReview}
              </p>
            </details>
          </section>
        ) : null}
      </div>
    </div>
  );
}
