import { fetchAirtableTablePage, getFirstAttachmentUrl } from "@/lib/airtable";

type HomeCardImages = {
  campgrounds?: string;
  gearLists?: string;
  tips?: string;
};

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

function getAnyAttachmentImageUrl(
  fields: Record<string, unknown>,
  preferredKeys: string[],
): string | undefined {
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

async function getRandomImageFromTable(params: {
  tableName: string;
  preferredKeys: string[];
  pageSize?: number;
}) {
  const { records } = await fetchAirtableTablePage<Record<string, unknown>>({
    tableName: params.tableName,
    page: 1,
    pageSize: params.pageSize ?? 25,
    // Stay on the first page; we just need some candidates.
    maxPagesToWalk: 1,
  });

  const urls = records
    .map((r) => getAnyAttachmentImageUrl(r.fields, params.preferredKeys))
    .filter((v): v is string => typeof v === "string" && v.length > 0);

  return pickRandom(urls);
}

export async function getHomeCardImages(): Promise<HomeCardImages> {
  const campgroundsTableName = process.env.AIRTABLE_DATA_PATH
    ? "Campgrounds"
    : (process.env.AIRTABLE_TABLE_CAMPGROUNDS ?? "Campgrounds");

  const gearListsTableName = process.env.AIRTABLE_DATA_PATH
    ? "Gear_Lists"
    : (process.env.AIRTABLE_TABLE_GEAR_LISTS ?? "Gear_Lists");

  const tipsTableName = process.env.AIRTABLE_DATA_PATH
    ? "Camping_Hacks"
    : (process.env.AIRTABLE_TABLE_CAMPING_HACKS ?? "Camping_Hacks");

  const [campgrounds, gearLists, tips] = await Promise.all([
    getRandomImageFromTable({
      tableName: campgroundsTableName,
      preferredKeys: [
        "Campground Image",
        "Campground Images",
        "Cover",
        "Cover Image",
        "Image",
        "Images",
        "Photo",
        "Photos",
      ],
    }),
    getRandomImageFromTable({
      tableName: gearListsTableName,
      preferredKeys: [
        "Gear Image",
        "Cover",
        "Cover Image",
        "Image",
        "Images",
        "Photo",
        "Photos",
      ],
    }),
    getRandomImageFromTable({
      tableName: tipsTableName,
      preferredKeys: [
        "Hack Image",
        "Hack Images",
        "Cover",
        "Cover Image",
        "Image",
        "Images",
        "Photo",
        "Photos",
      ],
    }),
  ]);

  return { campgrounds, gearLists, tips };
}
