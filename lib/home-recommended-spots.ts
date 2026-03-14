import { fetchAirtableTablePage, getFirstAttachmentUrl } from "@/lib/airtable";

type RecommendedSpot = {
  id: string;
  title: string;
  imageUrl?: string;
  // Keep UI fields, but they remain dummy (not sourced from Airtable).
  rating: number;
  pricePerNight: string;
};

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function sampleUnique<T>(items: T[], count: number): T[] {
  const copy = [...items];
  const picked: T[] = [];
  while (copy.length > 0 && picked.length < count) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(idx, 1)[0]);
  }
  return picked;
}

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

function dummyRating() {
  const options = [4.6, 4.7, 4.8, 4.9];
  return pickRandom(options) ?? 4.8;
}

function dummyPricePerNight() {
  const options = ["฿890/night", "฿990/night", "฿1,250/night", "฿1,490/night"];
  return pickRandom(options) ?? "฿990/night";
}

export async function getHomeRecommendedSpots(count = 3): Promise<RecommendedSpot[]> {
  const tableName = process.env.AIRTABLE_DATA_PATH
    ? "Campgrounds"
    : (process.env.AIRTABLE_TABLE_CAMPGROUNDS ?? "Campgrounds");

  // Pull a small sample to choose from; no filters to avoid coupling to business logic.
  const { records } = await fetchAirtableTablePage<Record<string, unknown>>({
    tableName,
    page: 1,
    pageSize: 40,
    maxPagesToWalk: 1,
  });

  const mapped = records
    .map((r) => {
      const title =
        pickString(r.fields, ["Name Campground", "Name", "Title"]) ||
        "Unnamed Campground";
      const imageUrl = getAnyAttachmentImageUrl(r.fields);
      return { id: r.id, title, imageUrl };
    })
    .filter((r) => r.title.trim().length > 0);

  const withImages = mapped.filter((r) => typeof r.imageUrl === "string" && r.imageUrl.length > 0);
  const withoutImages = mapped.filter((r) => !r.imageUrl);

  const picked = [
    ...sampleUnique(withImages, Math.min(count, withImages.length)),
    ...sampleUnique(withoutImages, Math.max(0, count - Math.min(count, withImages.length))),
  ].slice(0, count);

  return picked.map((r) => ({
    id: r.id,
    title: r.title,
    imageUrl: r.imageUrl,
    rating: dummyRating(),
    pricePerNight: dummyPricePerNight(),
  }));
}
