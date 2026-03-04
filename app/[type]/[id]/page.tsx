import Link from "next/link";

import {
  fetchAirtableRecordById,
  fetchAirtableTablePage,
  getFirstAttachmentUrl,
} from "@/lib/airtable";

import HeroGallery from "@/app/components/campground-detail/HeroGallery";
import SummaryCard from "@/app/components/campground-detail/SummaryCard";
import QuickInfoBar from "@/app/components/campground-detail/QuickInfoBar";
import HeroActions from "@/app/components/campground-detail/HeroActions";
import HeroInfoHighlights from "@/app/components/campground-detail/HeroInfoHighlights";
import MapPreview from "@/app/components/campground-detail/MapPreview";
import TripTimeline from "@/app/components/campground-detail/TripTimeline";
import BestSeason from "@/app/components/campground-detail/BestSeason";
import GearSuggestion from "@/app/components/campground-detail/GearSuggestion";
import RecommendedGearCards from "@/app/components/campground-detail/RecommendedGearCards";
import MobileStickyCTA from "@/app/components/campground-detail/MobileStickyCTA";

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
      "AI Summary (EN)",
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

function getAttachmentUrls(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0) return [];

  const urls: string[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const url = (item as { url?: unknown }).url;
    if (typeof url === "string" && url.trim()) urls.push(url.trim());
  }

  return urls;
}

function getAnyAttachmentImageUrls(
  fields: Record<string, unknown>,
  preferredKeys: string[],
): string[] {
  const urls: string[] = [];

  for (const key of preferredKeys) {
    urls.push(...getAttachmentUrls(fields[key]));
  }

  if (urls.length === 0) {
    for (const value of Object.values(fields)) {
      urls.push(...getAttachmentUrls(value));
      if (urls.length >= 8) break;
    }
  }

  // Unique while preserving order.
  return Array.from(new Set(urls)).slice(0, 8);
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

function toShortStringFromUnknown(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (Array.isArray(value)) {
    const parts = value
      .flatMap((v) =>
        typeof v === "string"
          ? [v.trim()]
          : typeof v === "number"
            ? [String(v)]
            : typeof v === "boolean"
              ? [v ? "Yes" : "No"]
              : [],
      )
      .filter(Boolean);
    return parts.join(", ");
  }

  return "";
}

function toGoogleMapsUrls(params: {
  title: string;
  location?: string;
  fields: Record<string, unknown>;
}): { mapsUrl: string; embedUrl: string } {
  const directUrlCandidates = [
    "Google Maps",
    "Google Maps URL",
    "Map",
    "Map Link",
    "Location URL",
  ];

  for (const k of directUrlCandidates) {
    const v = params.fields[k];
    if (typeof v === "string" && v.includes("google.com/maps")) {
      return {
        mapsUrl: v,
        embedUrl: v.includes("output=embed")
          ? v
          : `https://www.google.com/maps?q=${encodeURIComponent(v)}&output=embed`,
      };
    }
  }

  const lat = params.fields["Lat"] ?? params.fields["Latitude"];
  const lng = params.fields["Lng"] ?? params.fields["Longitude"];
  const hasLatLng =
    (typeof lat === "number" || typeof lat === "string") &&
    (typeof lng === "number" || typeof lng === "string");

  const query = hasLatLng
    ? `${String(lat).trim()},${String(lng).trim()}`
    : [params.title, params.location].filter(Boolean).join(" ");

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    query,
  )}&output=embed`;

  return { mapsUrl, embedUrl };
}

function parseMonthBadges(raw: string): string[] {
  const normalized = raw.replace(/\r/g, "").trim();
  if (!normalized) return [];

  const parts = normalized
    .split(/\n|,|\/|\u2022|•/g)
    .map((p) => p.trim())
    .filter(Boolean);

  return parts.slice(0, 12);
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

function normalizeGearType(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
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

  // --- Campground-only UI (modern layout + accessibility) ---
  if (type === "campground") {
    const images = getAnyAttachmentImageUrls(record.fields, cfg.imageKeys).map(
      (url) => ({ url, alt: title }),
    );

    const aiSummaryText = pickString(record.fields, [
      "AI Summary",
      "AI Summary (EN)",
      "AI Insight",
      "Summary",
      "Description",
    ]);

    const aiSummaryTrimmed = aiSummaryText?.trim();
    const aiSummaryLooksJson =
      !!aiSummaryTrimmed &&
      (aiSummaryTrimmed.startsWith("{") || aiSummaryTrimmed.startsWith("["));

    const roadmapOneDay = toMultilineStringFromUnknown(
      record.fields["Roadmap Guide one day"],
    );
    const roadmapTwoDay = toMultilineStringFromUnknown(
      record.fields["Roadmap Guide two day"],
    );

    const { mapsUrl, embedUrl } = toGoogleMapsUrls({
      title,
      location,
      fields: record.fields,
    });

    const travelTimeText =
      pickString(record.fields, [
        "Travel time from Bangkok",
        "Travel Time from Bangkok",
        "Travel time",
        "Travel Time",
        "Bangkok Travel Time",
      ]) || toShortStringFromUnknown(record.fields["Travel time from Bangkok"]);

    const nightTempText =
      pickString(record.fields, [
        "Night temperature range",
        "Night Temp",
        "Night Temperature",
        "Temperature",
        "Temp Range",
      ]) || toShortStringFromUnknown(record.fields["Night temperature range"]);

    const rainySeasonValue =
      record.fields["Rainy season"] ??
      record.fields["Rainy Season"] ??
      record.fields["Rain season"] ??
      record.fields["Rain Season"];
    const rainySeasonText =
      typeof rainySeasonValue === "boolean"
        ? rainySeasonValue
          ? "แนะนำ"
          : "ไม่แนะนำ"
        : toShortStringFromUnknown(rainySeasonValue);

    const elevationValue =
      record.fields["Elevation"] ??
      record.fields["Elevation (m)"] ??
      record.fields["Altitude"] ??
      record.fields["Altitude (m)"] ??
      record.fields["ความสูง"];
    const elevationTextRaw = toShortStringFromUnknown(elevationValue);
    const elevationText = elevationTextRaw
      ? /m\b/i.test(elevationTextRaw)
        ? elevationTextRaw
        : `${elevationTextRaw}m`
      : "";

    const highlightFactsRaw =
      record.fields["Highlight Facts"] ??
      record.fields["Highlights"] ??
      record.fields["Highlight"] ??
      record.fields["จุดเด่น"];
    const highlightFacts = toStringListFromUnknown(highlightFactsRaw);
    const highlightFogText = highlightFacts[0];
    const highlightSunriseText = highlightFacts[1];

    const quickInfoItems = [
      location ? { icon: "📍", label: "Location", value: location } : null,
      {
        icon: "🚗",
        label: "Travel time",
        value: travelTimeText,
      },
      {
        icon: "🌡",
        label: "Night temp",
        value: nightTempText,
      },
      {
        icon: "⛺",
        label: "Camping",
        value: toShortStringFromUnknown(
          record.fields["Camping allowed"] ?? record.fields["Camping Allowed"],
        ),
      },
      {
        icon: "🚻",
        label: "Toilet",
        value: toShortStringFromUnknown(
          record.fields["Toilet availability"] ?? record.fields["Toilet"],
        ),
      },
      {
        icon: "⚡",
        label: "Electricity",
        value: toShortStringFromUnknown(record.fields["Electricity"]),
      },
      {
        icon: "📶",
        label: "Signal",
        value: toShortStringFromUnknown(
          record.fields["Signal strength"] ?? record.fields["Signal"],
        ),
      },
      {
        icon: "⭐",
        label: "Difficulty",
        value: toShortStringFromUnknown(
          record.fields["Difficulty level"] ?? record.fields["Difficulty"],
        ),
      },
    ].filter((i) => i && i.value && i.value.trim().length > 0) as Array<{
      icon: string;
      label: string;
      value: string;
    }>;

    const bestSeasonMonthsRaw = pickString(record.fields, [
      "Best Season",
      "Best Months",
      "Best time to visit",
      "Best Time",
    ]);
    const bestSeasonMonths = bestSeasonMonthsRaw
      ? parseMonthBadges(bestSeasonMonthsRaw)
      : [];

    const bestSeasonRatingRaw =
      record.fields["Best Season Rating"] ?? record.fields["Season Rating"];
    const bestSeasonRating =
      typeof bestSeasonRatingRaw === "number"
        ? bestSeasonRatingRaw
        : typeof bestSeasonRatingRaw === "string"
          ? Number(bestSeasonRatingRaw)
          : undefined;

    const gearSuggestionRaw =
      record.fields["Gear Suggestion"] ??
      record.fields["What to bring"] ??
      record.fields["What to bring / Tips"] ??
      record.fields["Packing List"];
    const gearItems = toStringListFromUnknown(gearSuggestionRaw);

    // Recommended gear types (AI-filled): e.g. "อุปกรณ์กันหนาว", "เต็นท์".
    const recommendedGearTypesRaw =
      record.fields["Recommended Gear"] ??
      record.fields["Recommended Gear Types"] ??
      record.fields["Recommended Gear Type"];
    const recommendedGearTypes = toStringListFromUnknown(recommendedGearTypesRaw)
      .map((t) => t.trim())
      .filter(Boolean);

    const recommendedTypeSet = new Set(
      recommendedGearTypes.map((t) => normalizeGearType(t)),
    );

    const gearCfg = TYPE_CONFIG.gear;
    const gearTableName = process.env.AIRTABLE_DATA_PATH
      ? gearCfg.defaultTableName
      : (process.env[gearCfg.tableEnvVar ?? ""] ?? gearCfg.defaultTableName);

    const gearPool = recommendedTypeSet.size
      ? await fetchAirtableTablePage<Record<string, unknown>>({
          tableName: gearTableName,
          page: 1,
          pageSize: 50,
          // We filter in-memory because Airtable filterByFormula in this repo
          // currently supports a single equality clause.
        })
      : null;

    const recommendedGearItems = (gearPool?.records ?? [])
      .map((r) => {
        const fields = r.fields as Record<string, unknown>;
        const title = pickString(fields, gearCfg.titleKeys) || "Untitled";

        const gearTypeValue =
          fields["Gear Type"] ??
          fields["Gear Types"] ??
          fields["Type"] ??
          fields["Category"];
        const gearTypeLabel = toShortStringFromUnknown(gearTypeValue);
        const gearTypeTokens = toStringListFromUnknown(gearTypeValue);

        const matches =
          recommendedTypeSet.size === 0
            ? false
            : gearTypeTokens.some((t) => recommendedTypeSet.has(normalizeGearType(t))) ||
              (gearTypeLabel
                ? recommendedTypeSet.has(normalizeGearType(gearTypeLabel))
                : false);

        if (!matches) return null;

        return {
          id: r.id,
          title,
          gearType: gearTypeLabel,
          imageUrl: getAnyAttachmentImageUrl(fields, gearCfg.imageKeys),
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      title: string;
      gearType?: string;
      imageUrl?: string;
    }>;

    return (
      <div className="min-h-screen bg-background px-4 py-8 text-foreground dark:bg-forest dark:text-sand">
        <div className="mx-auto w-full max-w-6xl space-y-8 pb-24 md:pb-10">
          <nav aria-label="Breadcrumb">
            <Link
              href={cfg.listHref}
              className="text-sm font-medium text-slate-700 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-sand/80 dark:hover:text-accent"
            >
              ← Back
            </Link>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <HeroGallery title={title} images={images} />

              <HeroInfoHighlights
                bestMonths={bestSeasonMonths}
                bestPeriodText={bestSeasonMonthsRaw}
                rainySeasonText={rainySeasonText}
                nightTempText={nightTempText}
                rating={bestSeasonRating}
                elevationText={elevationText}
                highlightFogText={highlightFogText}
                highlightSunriseText={highlightSunriseText}
                travelTimeText={travelTimeText}
              />

              <RecommendedGearCards
                gearTypes={recommendedGearTypes}
                items={recommendedGearItems}
              />
            </div>

            <div className="lg:col-span-1">
              <SummaryCard
                badgeLabel={cfg.badge}
                title={title}
                location={location}
                aiSummary={aiSummaryLooksJson ? undefined : aiSummaryText}
                quickInfo={<QuickInfoBar items={quickInfoItems} />}
                actions={
                  <HeroActions recordId={id} title={title} mapsUrl={mapsUrl} />
                }
              />
            </div>
          </div>

          <MapPreview title={title} embedUrl={embedUrl} mapsUrl={mapsUrl} />

          <section aria-label="Trip plans" className="space-y-4">
            <header className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Trip Plans
              </h2>
              <p className="text-sm leading-6 text-slate-600 dark:text-sand/70">
                Clean, readable timelines for quick planning.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <TripTimeline
                title="1 Day 1 Night"
                intro="Recommended for weekends — a compact plan that still feels complete."
                planText={roadmapOneDay}
              />

              <TripTimeline
                title="2 Days 2 Nights"
                intro="Recommended for longer breaks — slower pace, more activities."
                planText={roadmapTwoDay}
              />
            </div>
          </section>

          <section
            aria-label="Season and gear"
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <BestSeason months={bestSeasonMonths} rating={bestSeasonRating} />
            <GearSuggestion recordId={id} items={gearItems} />
          </section>
        </div>

        <MobileStickyCTA recordId={id} title={title} mapsUrl={mapsUrl} />
      </div>
    );
  }

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
