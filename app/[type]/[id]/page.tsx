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
import GearDetailActions from "@/app/components/gear-detail-actions";

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

function pickValue(fields: Record<string, unknown>, keys: string[]) {
  for (const k of keys) {
    const v = fields[k];
    const s = toShortStringFromUnknown(v);
    if (s.trim().length > 0) return s.trim();
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
    .split(/\n|เนโฌเธ|\u2022/g)
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
    .split(/\n|,|\/|\u2022|เนโฌเธ/g)
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

type CampingTipsJson = Partial<{
  pros: unknown;
  cons: unknown;
  use_cases: unknown;
  useCases: unknown;
  best_use_cases: unknown;
  bestUseCases: unknown;
  bestFor: unknown;
  strengths: unknown;
  weaknesses: unknown;
  summary: unknown;
  verdict: unknown;
  aiVerdict: unknown;
  ai_summary: unknown;
  aiSummary: unknown;
}>;

function parseCampingTipsJson(raw: string | undefined | null): {
  pros: string[];
  cons: string[];
  useCases: string[];
  summaryText: string;
} | null {
  if (!raw || typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return null;

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const obj = parsed as CampingTipsJson;
    const pros = toStringListFromUnknown(obj.pros ?? obj.strengths);
    const cons = toStringListFromUnknown(obj.cons ?? obj.weaknesses);
    const useCases = toStringListFromUnknown(
      obj.use_cases ??
        obj.useCases ??
        obj.best_use_cases ??
        obj.bestUseCases ??
        obj.bestFor,
    );

    const summaryText = toShortStringFromUnknown(
      obj.summary ?? obj.aiSummary ?? obj.ai_summary ?? obj.verdict ?? obj.aiVerdict,
    );

    if (pros.length === 0 && cons.length === 0 && useCases.length === 0 && !summaryText) {
      return null;
    }

    return { pros, cons, useCases, summaryText };
  } catch {
    return null;
  }
}

type HackGuideStep = {
  title: string;
  body?: string;
};

function toExcerpt(raw: string, maxChars: number): string {
  const s = raw.replace(/\s+/g, " ").trim();
  if (!s) return "";
  if (s.length <= maxChars) return s;
  return `${s.slice(0, Math.max(0, maxChars - 1)).trimEnd()}เนโฌเธ`;
}

function splitParagraphs(raw: string): string[] {
  const normalized = raw.replace(/\r/g, "").trim();
  if (!normalized) return [];
  return normalized
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

function extractBulletLines(raw: string): string[] {
  const lines = raw.replace(/\r/g, "").split("\n");
  const out: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^(?:[-*]|เนโฌเธ|\u2022)\s+(.*)$/);
    if (m?.[1]) out.push(m[1].trim());
  }

  return out;
}

function extractSentences(raw: string): string[] {
  const normalized = raw.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  return normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseHackGuideSteps(raw: string): HackGuideStep[] {
  const lines = raw.replace(/\r/g, "").split("\n");
  const steps: HackGuideStep[] = [];

  const headerRe = /^(?:step\s*)?(\d{1,2})\s*[).:\-]\s*(.+)$/i;
  const stepWordRe = /^step\s*(\d{1,2})\b\s*:?\s*(.*)$/i;

  let current: HackGuideStep | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const m1 = trimmed.match(stepWordRe);
    const m2 = trimmed.match(headerRe);
    const matched = m1 ?? m2;

    if (matched) {
      if (current) steps.push(current);
      const title = (matched[2] ?? matched[1] ?? "").trim();
      current = { title: title || `Step ${matched[1]}` };
      continue;
    }

    // If we already started steps, keep appending supporting lines into body.
    if (current) {
      current.body = current.body ? `${current.body}\n${trimmed}` : trimmed;
    }
  }

  if (current) steps.push(current);
  return steps.slice(0, 10);
}

function parseGuideSections(raw: string): {
  takeawaysText: string;
  stepsText: string;
  proTipsText: string;
  bodyText: string;
} {
  const lines = raw.replace(/\r/g, "").split("\n");

  type SectionKey = "takeaways" | "steps" | "proTips" | "body";
  let current: SectionKey = "body";
  const takeaways: string[] = [];
  const steps: string[] = [];
  const proTips: string[] = [];
  const body: string[] = [];

  const normalizeHeading = (s: string) =>
    s
      .replace(/^#+\s*/, "")
      .replace(/[:เนเธย]$/, "")
      .trim()
      .toLowerCase();

  const isHeading = (s: string) => {
    const h = normalizeHeading(s);
    if (!h) return null;
    if (
      h === "key takeaway" ||
      h === "key takeaways" ||
      h === "takeaways" ||
      h === "takeaway"
    )
      return "takeaways" as const;
    if (
      h === "step-by-step guide" ||
      h === "step by step" ||
      h === "step-by-step" ||
      h === "steps" ||
      h === "guide" ||
      h === "how to"
    )
      return "steps" as const;
    if (h === "pro tips" || h === "pro tip" || h === "extra tips")
      return "proTips" as const;
    return null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      // Keep paragraph breaks inside sections.
      if (current === "takeaways") takeaways.push("");
      else if (current === "steps") steps.push("");
      else if (current === "proTips") proTips.push("");
      else body.push("");
      continue;
    }

    const section = isHeading(trimmed);
    if (section) {
      current = section;
      continue;
    }

    if (current === "takeaways") takeaways.push(line);
    else if (current === "steps") steps.push(line);
    else if (current === "proTips") proTips.push(line);
    else body.push(line);
  }

  return {
    takeawaysText: takeaways.join("\n").trim(),
    stepsText: steps.join("\n").trim(),
    proTipsText: proTips.join("\n").trim(),
    bodyText: body.join("\n").trim(),
  };
}

function buildHackGuide(raw: string): {
  summary: string;
  takeaways: string[];
  steps: HackGuideStep[];
  proTips: string[];
} {
  const text = raw.replace(/\r/g, "").trim();
  const paragraphs = splitParagraphs(text);
  const summary = paragraphs.length > 0 ? toExcerpt(paragraphs[0], 220) : "";

  const { takeawaysText, stepsText, proTipsText, bodyText } =
    parseGuideSections(text);

  const takeawaysFromSection = extractBulletLines(takeawaysText);
  const takeawaysFromBody = extractBulletLines(bodyText);
  const takeawaysFromSentences = extractSentences(bodyText)
    .slice(0, 6)
    .map((s) => toExcerpt(s, 140));

  const takeaways = (
    takeawaysFromSection.length
      ? takeawaysFromSection
      : takeawaysFromBody.length
        ? takeawaysFromBody
        : takeawaysFromSentences
  )
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  let steps = parseHackGuideSteps(stepsText || bodyText);

  if (steps.length === 0 && paragraphs.length > 1) {
    const derived = paragraphs.slice(1, 5).map((p) => {
      const sentences = extractSentences(p);
      const title = toExcerpt(sentences[0] ?? p, 80);
      const body = sentences.length > 1 ? sentences.slice(1).join(" ") : "";
      return { title, body: body ? toExcerpt(body, 180) : undefined };
    });
    steps = derived.filter((s) => s.title.trim().length > 0);
  }

  const proTipsFromSection = extractBulletLines(proTipsText);
  const proTipsFromBody = extractBulletLines(text)
    .filter((b) => /\btip\b/i.test(b) || b.length <= 120)
    .slice(0, 10);

  const proTips = (
    proTipsFromSection.length ? proTipsFromSection : proTipsFromBody
  )
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  return { summary, takeaways, steps, proTips };
}

function normalizeGearType(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
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
            Back
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
          ? "เน€เธยเน€เธยเน€เธเธเน€เธยเน€เธเธ“"
          : "เน€เธยเน€เธเธเน€เธยเน€เธยเน€เธยเน€เธเธเน€เธยเน€เธเธ“"
        : toShortStringFromUnknown(rainySeasonValue);

    const elevationValue =
      record.fields["Elevation"] ??
      record.fields["Elevation (m)"] ??
      record.fields["Altitude"] ??
      record.fields["Altitude (m)"] ??
      record.fields["เน€เธยเน€เธเธเน€เธเธ’เน€เธเธเน€เธเธเน€เธเธเน€เธย"];
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
      record.fields["เน€เธยเน€เธเธเน€เธโ€เน€เธโฌเน€เธโ€เน€เธยเน€เธย"];
    const highlightFacts = toStringListFromUnknown(highlightFactsRaw);
    const highlightFogText = highlightFacts[0];
    const highlightSunriseText = highlightFacts[1];

    const quickInfoItems = [
      location ? { icon: "เนยโ€ย", label: "Location", value: location } : null,
      {
        icon: "เนยยโ€”",
        label: "Travel time",
        value: travelTimeText,
      },
      {
        icon: "เนยยเธ",
        label: "Night temp",
        value: nightTempText,
      },
      {
        icon: "เนยเธ",
        label: "Camping",
        value: toShortStringFromUnknown(
          record.fields["Camping allowed"] ?? record.fields["Camping Allowed"],
        ),
      },
      {
        icon: "เนยยเธ",
        label: "Toilet",
        value: toShortStringFromUnknown(
          record.fields["Toilet availability"] ?? record.fields["Toilet"],
        ),
      },
      {
        icon: "เนยเธ",
        label: "Electricity",
        value: toShortStringFromUnknown(record.fields["Electricity"]),
      },
      {
        icon: "เนยโ€เธ–",
        label: "Signal",
        value: toShortStringFromUnknown(
          record.fields["Signal strength"] ?? record.fields["Signal"],
        ),
      },
      {
        icon: "เนเธย",
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

    // Recommended gear types (AI-filled): e.g. "เน€เธเธเน€เธเธเน€เธยเน€เธยเน€เธเธเน€เธโ€เน€เธยเน€เธยเน€เธเธ‘เน€เธยเน€เธเธเน€เธยเน€เธเธ’เน€เธเธ", "เน€เธโฌเน€เธโ€ขเน€เธยเน€เธยเน€เธโ€”เน€เธย".
    const recommendedGearTypesRaw =
      record.fields["Recommended Gear"] ??
      record.fields["Recommended Gear Types"] ??
      record.fields["Recommended Gear Type"];
    const recommendedGearTypes = toStringListFromUnknown(
      recommendedGearTypesRaw,
    )
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
            : gearTypeTokens.some((t) =>
                recommendedTypeSet.has(normalizeGearType(t)),
              ) ||
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
      <div className="min-h-screen bg-background px-4 py-8 text-foreground">
        <div className="mx-auto w-full max-w-6xl space-y-8 pb-24 md:pb-10">
          <nav aria-label="Breadcrumb">
            <Link
              href={cfg.listHref}
              className="text-sm font-medium text-slate-700 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-sand/80 dark:hover:text-accent"
            >
              Back
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
                intro="Recommended for weekends เนโฌโ€ a compact plan that still feels complete."
                planText={roadmapOneDay}
              />

              <TripTimeline
                title="2 Days 2 Nights"
                intro="Recommended for longer breaks เนโฌโ€ slower pace, more activities."
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

  const createdDateText = record.createdTime
    ? new Date(record.createdTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const tipsJson =
    parseCampingTipsJson(tips) || parseCampingTipsJson(fallbackAiSummary);

  const weightText =
    pickString(record.fields, [
      "Weight",
      "Total Weight",
      "Pack Weight",
      "Base Weight",
      "Gear Weight",
    ]) ||
    toShortStringFromUnknown(
      record.fields["Weight"] ??
        record.fields["Total Weight"] ??
        record.fields["Pack Weight"] ??
        record.fields["Base Weight"] ??
        record.fields["Gear Weight"],
    );

  const seasonText =
    pickString(record.fields, [
      "Season",
      "Best Season",
      "Best season",
      "Season rating",
      "Season Rating",
    ]) ||
    toShortStringFromUnknown(
      record.fields["Season"] ??
        record.fields["Best Season"] ??
        record.fields["Best season"] ??
        record.fields["Season rating"] ??
        record.fields["Season Rating"],
    );

  const isGear = type === "gear";
  const isHack = type === "hack";

  const heroDescriptionText = (() => {
    if (aiSummaryLooksJson) return "";
    const raw = (fallbackAiSummary ?? "").replace(/\r/g, "").trim();
    if (!raw) return "";

    // Prefer 1เนโฌโ€2 short sentences.
    const normalized = raw.replace(/\s+/g, " ");
    const sentences = normalized
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const picked = sentences.slice(0, 2).join(" ").trim();
    return picked.length > 220 ? `${picked.slice(0, 217)}...` : picked;
  })();

  if (isHack) {
    const contentText =
      toMultilineStringFromUnknown(record.fields["Content"]) ||
      toMultilineStringFromUnknown(tips) ||
      (aiSummaryLooksJson
        ? ""
        : toMultilineStringFromUnknown(fallbackAiSummary)) ||
      toMultilineStringFromUnknown(rawReview);

    const guide = buildHackGuide(contentText);

    const difficultyText =
      pickString(record.fields, [
        "Difficulty level",
        "Difficulty",
        "Level",
        "Skill level",
      ]) || toShortStringFromUnknown(record.fields["Difficulty level"]);

    const estimatedTimeText =
      pickString(record.fields, [
        "Estimated time",
        "Estimated Time",
        "Time",
        "Duration",
        "Prep time",
      ]) || toShortStringFromUnknown(record.fields["Estimated time"]);

    const situationText =
      pickString(record.fields, [
        "Situation",
        "Scenario",
        "Weather",
        "Conditions",
        "Use case",
        "Use Case",
      ]) || toShortStringFromUnknown(record.fields["Situation"]);

    const heroSummary = guide.summary || heroDescriptionText;

    const gearNeedItems = toStringListFromUnknown(
      record.fields["Gear Need"] ??
        record.fields["Gear need"] ??
        record.fields["Gear Needed"] ??
        record.fields["Gear needs"],
    );

    const commonMistakesItems = toStringListFromUnknown(
      record.fields["Common Mistakes"] ??
        record.fields["Common mistakes"] ??
        record.fields["Common Mistake"] ??
        record.fields["Mistakes"],
    );

    const recommendedGearRaw =
      record.fields["Recommended Gear"] ??
      record.fields["Recommended gear"] ??
      record.fields["Gear"] ??
      record.fields["Related Gear"] ??
      record.fields["Recommended Items"] ??
      record.fields["Recommended Gear Items"];

    const recommendedGearTokens = toStringListFromUnknown(recommendedGearRaw);

    const recommendedGearLinks = recommendedGearTokens
      .map((token) => {
        const m = token.match(/rec[a-zA-Z0-9]{10,}/);
        if (!m) return null;
        const id = m[0];
        const label = token
          .replace(id, "")
          .replace(/[()\-เนโฌโ€เนโฌโ€:]+/g, " ")
          .trim();
        return { id, label: label || "Gear item" };
      })
      .filter(Boolean) as Array<{ id: string; label: string }>;

    return (
      <div className="min-h-screen bg-background px-4 py-10 text-foreground">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          <Link
            href={cfg.listHref}
            className="text-sm font-medium text-foreground/80 hover:text-accent"
          >
            Back
          </Link>

          {/* Hero */}
          <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-moss/30 dark:bg-forest">
            <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-2 md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-900 dark:bg-moss/40 dark:text-sand">
                    {cfg.badge}
                  </span>

                  {difficultyText ? (
                    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-foreground/80 dark:border-moss/30 dark:bg-forest/60 dark:text-sand/80">
                      {difficultyText}
                    </span>
                  ) : null}

                  {estimatedTimeText ? (
                    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-foreground/80 dark:border-moss/30 dark:bg-forest/60 dark:text-sand/80">
                      {estimatedTimeText}
                    </span>
                  ) : null}

                  {situationText ? (
                    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-foreground/80 dark:border-moss/30 dark:bg-forest/60 dark:text-sand/80">
                      {situationText}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  {title}
                </h1>

                {heroSummary ? (
                  <p className="mt-3 text-sm leading-6 text-foreground/70">
                    {heroSummary}
                  </p>
                ) : null}
              </div>

              <div className="overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200 dark:bg-moss dark:ring-moss/40">
                <div className="aspect-[4/3] w-full">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500 dark:text-sand/70">
                      No image
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Key Takeaway */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-moss/30 dark:bg-forest">
            <header className="space-y-1">
              <h2 className="text-base font-semibold">Key Takeaway</h2>
              <p className="text-xs leading-5 text-foreground/60">
                The most important advice to remember.
              </p>
            </header>

            {guide.takeaways.length > 0 ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-foreground/80">
                {guide.takeaways.slice(0, 4).map((item, idx) => (
                  <li key={`${idx}-${item}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6 text-foreground/60">
                No takeaways available yet.
              </p>
            )}
          </section>

          {/* Gear Need */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-moss/30 dark:bg-forest">
            <header className="space-y-1">
              <h2 className="text-base font-semibold">Gear Need</h2>
              <p className="text-xs leading-5 text-foreground/60">
                Items that help you do this tip.
              </p>
            </header>

            {gearNeedItems.length > 0 ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-foreground/80">
                {gearNeedItems.slice(0, 10).map((item, idx) => (
                  <li key={`${idx}-${item}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6 text-foreground/60">
                No gear listed yet.
              </p>
            )}
          </section>

          {/* Common Mistakes */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-moss/30 dark:bg-forest">
            <header className="space-y-1">
              <h2 className="text-base font-semibold">Common Mistakes</h2>
              <p className="text-xs leading-5 text-foreground/60">
                Pitfalls to avoid when applying this tip.
              </p>
            </header>

            {commonMistakesItems.length > 0 ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-foreground/80">
                {commonMistakesItems.slice(0, 10).map((item, idx) => (
                  <li key={`${idx}-${item}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6 text-foreground/60">
                No mistakes listed yet.
              </p>
            )}
          </section>

          {/* Recommended Gear (optional) */}
          {recommendedGearLinks.length > 0 ? (
            <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-moss/30 dark:bg-forest">
              <header className="space-y-1">
                <h2 className="text-base font-semibold">Recommended Gear</h2>
                <p className="text-xs leading-5 text-foreground/60">
                  Helpful items related to this tip.
                </p>
              </header>

              <div className="mt-4 flex flex-wrap gap-2">
                {recommendedGearLinks.slice(0, 10).map((g) => (
                  <Link
                    key={g.id}
                    href={`/gear/${g.id}`}
                    className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-foreground/80 hover:bg-zinc-50 dark:border-moss/30 dark:bg-forest/60 dark:text-sand/80 dark:hover:bg-forest"
                  >
                    {g.label}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href={cfg.listHref}
          className="text-sm font-medium text-foreground/80 hover:text-accent"
        >
          Back
        </Link>

        {/* Hero: image + product summary */}
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white dark:border-moss/30 dark:bg-forest">
          <div className="p-6">
            {createdDateText ? (
              <div className="flex justify-end text-xs font-medium text-foreground/60">
                เน€เธโฌเน€เธยเน€เธเธ”เน€เธยเน€เธเธเน€เธยเน€เธยเน€เธเธเน€เธเธเน€เธเธเน€เธเธ…เน€เธโฌเน€เธเธเน€เธเธ—เน€เธยเน€เธเธ {createdDateText}
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
              <div className="overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200 dark:bg-moss dark:ring-moss/40">
                <div className="aspect-[4/3] w-full">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500 dark:text-sand/70">
                      No image
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-900 dark:bg-moss/40 dark:text-sand">
                    {cfg.badge}
                  </span>

                  {location ? (
                    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-foreground/80 dark:border-moss/30 dark:bg-forest/60 dark:text-sand/80">
                      {location}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  {title}
                </h1>

              {(() => {
                const capacityText = pickValue(record.fields, [
                  "Capacity",
                  "People",
                  "Sleeps",
                  "Sleeps (people)",
                  "Persons",
                  "Person",
                ]);
                const categoryText = pickValue(record.fields, [
                  "Category",
                  "Gear Type",
                  "Type",
                  "Gear Category",
                ]);
                const weatherSuitabilityText = seasonText;

                const attrs = [
                  capacityText
                    ? { icon: "เนยโ€เธ…", label: "Capacity", value: capacityText }
                    : null,
                  categoryText || location
                    ? {
                        icon: "เนยเธเธ",
                        label: "Category",
                        value: categoryText || location,
                      }
                    : null,
                  weightText
                    ? { icon: "เนยโ€“", label: "Weight", value: weightText }
                    : null,
                  weatherSuitabilityText
                    ? {
                        icon: "เนยย",
                        label: "Weather",
                        value: weatherSuitabilityText,
                      }
                    : null,
                ].filter(Boolean) as Array<{
                  icon: string;
                  label: string;
                  value: string;
                }>;

                if (attrs.length === 0) return null;

                return (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {attrs.map((a) => (
                      <div
                        key={a.label}
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-foreground dark:border-moss/30 dark:bg-forest/60 dark:text-sand"
                      >
                        <span aria-hidden="true">{a.icon}</span>
                        <span className="text-foreground/70 dark:text-sand/70">
                          {a.label}:
                        </span>
                        <span className="font-semibold">{a.value}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}

                {(() => {
                  const verdictRaw =
                    heroDescriptionText ||
                    tipsJson?.summaryText ||
                    strengthsList[0] ||
                    "";
                  const fallbackCon = weaknessesList[0]
                    ? ` Trade-off: ${weaknessesList[0]}`
                    : "";
                  const verdict = verdictRaw
                    ? `${toExcerpt(verdictRaw, 220)}${fallbackCon}`.trim()
                    : "";
                  if (!verdict) return null;

                  return (
                    <div className="mt-5">
                      <div className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                        AI Verdict
                      </div>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-foreground/80">
                        {verdict}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* Product Details */}
        <section aria-label="Product details" className="mt-16 space-y-4">
          <header className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Product Details
            </h2>
            <p className="text-sm leading-6 text-foreground/60">
              Clean specs and metadata.
            </p>
          </header>

          {(() => {
            const brandText = pickValue(record.fields, [
              "Brand",
              "Brand Name",
              "Manufacturer",
              "Company",
              "Maker",
            ]);
            const modelText = pickValue(record.fields, [
              "Model",
              "Model Name",
              "Model number",
              "Model Number",
              "Product Model",
            ]);
            const categoryText = pickValue(record.fields, [
              "Category",
              "Gear Type",
              "Type",
              "Gear Category",
            ]);
            const capacityText = pickValue(record.fields, [
              "Capacity",
              "People",
              "Sleeps",
              "Sleeps (people)",
              "Persons",
              "Person",
            ]);

            const items = [
              brandText ? { label: "Brand", value: brandText } : null,
              modelText ? { label: "Model", value: modelText } : null,
              categoryText || location
                ? { label: "Category", value: categoryText || location }
                : null,
              capacityText ? { label: "Capacity", value: capacityText } : null,
              weightText ? { label: "Weight", value: weightText } : null,
              seasonText ? { label: "Season", value: seasonText } : null,
            ].filter(Boolean) as Array<{ label: string; value: string }>;

            if (items.length === 0) {
              return (
                <p className="text-sm leading-6 text-foreground/60">
                  No product details available yet.
                </p>
              );
            }

            return (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                {items.map((it) => (
                  <div
                    key={it.label}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-moss/30 dark:bg-forest/60"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-foreground/60">
                      {it.label}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground dark:text-sand">
                      {it.value}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>

        {/* Camping Tips: render JSON as Pros/Cons/Use Cases */}
        {(() => {
          const pros = tipsJson?.pros?.length ? tipsJson.pros : strengthsList;
          const cons = tipsJson?.cons?.length ? tipsJson.cons : weaknessesList;
          const useCases = tipsJson?.useCases?.length
            ? tipsJson.useCases
            : bestForList;

          if (pros.length === 0 && cons.length === 0 && useCases.length === 0) {
            return null;
          }

          return (
            <section aria-label="เน€เธเธเน€เธเธ’เน€เธเธเน€เธเธ…เน€เธเธเน€เธโฌเน€เธเธเน€เธเธ•เน€เธเธเน€เธโ€เน€เธโฌเน€เธยเน€เธเธ”เน€เธยเน€เธเธเน€เธโฌเน€เธโ€ขเน€เธเธ”เน€เธเธ" className="mt-16 space-y-6">
              <header className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  เน€เธเธเน€เธเธ’เน€เธเธเน€เธเธ…เน€เธเธเน€เธโฌเน€เธเธเน€เธเธ•เน€เธเธเน€เธโ€เน€เธโฌเน€เธยเน€เธเธ”เน€เธยเน€เธเธเน€เธโฌเน€เธโ€ขเน€เธเธ”เน€เธเธ
                </h2>
              </header>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-moss/30 dark:bg-forest/60">
                  <h3 className="text-base font-semibold">เน€เธยเน€เธยเน€เธเธเน€เธโ€เน€เธเธ•</h3>
                  {pros.length > 0 ? (
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/80">
                      {pros.slice(0, 10).map((item, idx) => (
                        <li key={`${idx}-${item}`} className="flex gap-2">
                          <span className="mt-[2px] text-accent">เนโฌเธ</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-foreground/60">
                      No pros listed.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-moss/30 dark:bg-forest/60">
                  <h3 className="text-base font-semibold">เน€เธยเน€เธยเน€เธเธเน€เธยเน€เธเธ“เน€เธยเน€เธเธ‘เน€เธโ€</h3>
                  {cons.length > 0 ? (
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/80">
                      {cons.slice(0, 10).map((item, idx) => (
                        <li key={`${idx}-${item}`} className="flex gap-2">
                          <span className="mt-[2px] text-foreground/60">เนโฌเธ</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-foreground/60">
                      No cons listed.
                    </p>
                  )}
                </div>
              </div>

              {useCases.length > 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-moss/30 dark:bg-forest/60">
                  <h3 className="text-base font-semibold">เน€เธโฌเน€เธเธเน€เธเธเน€เธเธ’เน€เธเธเน€เธเธเน€เธเธ“เน€เธเธเน€เธเธเน€เธเธ‘เน€เธย</h3>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/80">
                    {useCases.slice(0, 12).map((item, idx) => (
                      <li key={`${idx}-${item}`} className="flex gap-2">
                        <span className="mt-[2px] text-accent">เนโฌเธ</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          );
        })()}

        {/* Actions */}
        <section
          aria-label="Actions"
          className="mt-16 border-t border-zinc-200 pt-8 dark:border-moss/30"
        >
          <GearDetailActions recordId={id} title={title} />
        </section>

        {/* Raw review (hide on gear to match requested structure) */}
        {!isGear && rawReview ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-foreground shadow-sm dark:border-moss/30 dark:bg-forest dark:text-sand">
            <details className="group">
              <summary className="cursor-pointer list-none text-base font-semibold">
                เนยโ€ย Raw review
                <span className="ml-2 text-sm font-medium text-accent">
                  (click to {"open"})
                </span>
              </summary>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-sand/80">
                {rawReview}
              </p>
            </details>
          </section>
        ) : null}
      </div>
    </div>
  );
}
