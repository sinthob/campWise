type AirtableAttachment = {
  id?: string;
  url?: string;
  filename?: string;
  type?: string;
  size?: number;
  width?: number;
  height?: number;
  thumbnails?: Record<string, { url?: string; width?: number; height?: number }>;
};

export type AirtableRecord<TFields extends Record<string, unknown>> = {
  id: string;
  createdTime: string;
  fields: TFields;
};

type AirtableListResponse<TFields extends Record<string, unknown>> = {
  records: Array<AirtableRecord<TFields>>;
  offset?: string;
};

type AirtableMockFile = Record<
  string,
  Array<AirtableRecord<Record<string, unknown>>> | undefined
>;

export type AirtablePageResult<TFields extends Record<string, unknown>> = {
  records: Array<AirtableRecord<TFields>>;
  page: number;
  hasNextPage: boolean;
};

function getAirtableConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    throw new Error(
      "Missing Airtable env vars. Please set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.",
    );
  }

  return { apiKey, baseId };
}

function toSafePositiveInt(value: unknown, fallback: number) {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
}

async function fetchMockTablePage<TFields extends Record<string, unknown>>(
  params: {
    tableName: string;
    page?: unknown;
    pageSize: number;
  },
): Promise<AirtablePageResult<TFields>> {
  const mockPath = process.env.AIRTABLE_DATA_PATH;
  if (!mockPath) {
    throw new Error("Missing AIRTABLE_DATA_PATH for mock mode.");
  }

  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");

  const resolvedPath = path.isAbsolute(mockPath)
    ? mockPath
    : path.join(process.cwd(), mockPath);

  const raw = await readFile(resolvedPath, "utf8");
  const data = JSON.parse(raw) as AirtableMockFile;

  const all = (data[params.tableName] ?? []) as Array<AirtableRecord<TFields>>;

  const page = toSafePositiveInt(params.page, 1);
  const start = (page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const records = all.slice(start, end);

  return {
    records,
    page,
    hasNextPage: end < all.length,
  };
}

async function airtableFetchPage<TFields extends Record<string, unknown>>(
  tableName: string,
  pageSize: number,
  offset?: string,
): Promise<AirtableListResponse<TFields>> {
  const { apiKey, baseId } = getAirtableConfig();

  const url = new URL(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
  );
  url.searchParams.set("pageSize", String(pageSize));
  if (offset) url.searchParams.set("offset", offset);

  const maxAttempts = 3;
  let lastText = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      return (await res.json()) as AirtableListResponse<TFields>;
    }

    lastText = await res.text().catch(() => "");
    const requestId = res.headers.get("x-airtable-request-id");

    // Airtable occasionally returns transient 5xx errors; retry a couple times.
    const isRetryable = res.status >= 500 && res.status < 600;
    const isLastAttempt = attempt === maxAttempts;

    if (!isRetryable || isLastAttempt) {
      const safeUrl = url.toString();
      throw new Error(
        `Airtable request failed (${res.status} ${res.statusText}). URL: ${safeUrl}.${requestId ? ` requestId: ${requestId}.` : ""} ${lastText}`.trim(),
      );
    }

    await new Promise((r) => setTimeout(r, 250 * attempt));
  }

  throw new Error(
    `Airtable request failed. URL: ${url.toString()}. ${lastText}`.trim(),
  );
}

/**
 * Fetches a page by page-number (1-based) by walking Airtable's cursor-based offset.
 * This keeps the URL simple (`?page=2`) while still using Airtable's native pagination.
 */
export async function fetchAirtableTablePage<TFields extends Record<string, unknown>>(
  params: {
    tableName: string;
    page?: unknown;
    pageSize?: number;
    maxPagesToWalk?: number;
  },
): Promise<AirtablePageResult<TFields>> {
  const pageSize = params.pageSize ?? 10;

  // Mock mode: read from a local JSON file (no Airtable network calls).
  if (process.env.AIRTABLE_DATA_PATH) {
    return fetchMockTablePage<TFields>({
      tableName: params.tableName,
      page: params.page,
      pageSize,
    });
  }

  const maxPagesToWalk = params.maxPagesToWalk ?? 50;

  const requestedPage = toSafePositiveInt(params.page, 1);
  const targetPage = Math.min(requestedPage, maxPagesToWalk);

  let currentPage = 1;
  let offset: string | undefined;

  while (currentPage < targetPage) {
    const res = await airtableFetchPage<TFields>(params.tableName, pageSize, offset);
    offset = res.offset;
    if (!offset) {
      return {
        records: res.records,
        page: currentPage,
        hasNextPage: false,
      };
    }
    currentPage += 1;
  }

  const res = await airtableFetchPage<TFields>(params.tableName, pageSize, offset);

  return {
    records: res.records,
    page: currentPage,
    hasNextPage: Boolean(res.offset),
  };
}

export function getFirstAttachmentUrl(value: unknown): string | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const first = value[0] as AirtableAttachment;
  if (!first || typeof first !== "object") return undefined;
  if (typeof first.url === "string" && first.url.length > 0) return first.url;
  return undefined;
}
