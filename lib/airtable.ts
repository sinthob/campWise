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

function escapeAirtableString(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function buildFilterByFormula(params: {
  query?: string;
  searchFields?: string[];
  typeField?: string;
  typeValue?: string;
}) {
  const clauses: string[] = [];

  const q = params.query?.trim();
  const fields = (params.searchFields ?? []).filter(Boolean);
  if (q && fields.length > 0) {
    const escaped = escapeAirtableString(q);
    const orParts = fields.map(
      (f) => `IFERROR(SEARCH("${escaped}", {${f}}), 0) > 0`,
    );
    clauses.push(`OR(${orParts.join(",")})`);
  }

  const typeField = params.typeField?.trim();
  const typeValue = params.typeValue?.trim();
  if (typeField && typeValue) {
    const escapedType = escapeAirtableString(typeValue);
    clauses.push(`{${typeField}} = "${escapedType}"`);
  }

  if (clauses.length === 0) return undefined;
  if (clauses.length === 1) return clauses[0];
  return `AND(${clauses.join(",")})`;
}

async function fetchMockTablePage<TFields extends Record<string, unknown>>(
  params: {
    tableName: string;
    page?: unknown;
    pageSize: number;
    query?: string;
    searchFields?: string[];
    typeField?: string;
    typeValue?: string;
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

  let all = (data[params.tableName] ?? []) as Array<AirtableRecord<TFields>>;

  const q = params.query?.trim().toLowerCase();
  const searchFields = (params.searchFields ?? []).filter(Boolean);
  if (q && searchFields.length > 0) {
    all = all.filter((rec) => {
      for (const field of searchFields) {
        const v = (rec.fields as Record<string, unknown>)[field];
        if (v === null || v === undefined) continue;
        const s = String(v).toLowerCase();
        if (s.includes(q)) return true;
      }
      return false;
    });
  }

  const typeField = params.typeField?.trim();
  const typeValue = params.typeValue?.trim();
  if (typeField && typeValue) {
    all = all.filter((rec) => {
      const v = (rec.fields as Record<string, unknown>)[typeField];
      return String(v ?? "") === typeValue;
    });
  }

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
  filterByFormula?: string,
): Promise<AirtableListResponse<TFields>> {
  const { apiKey, baseId } = getAirtableConfig();

  const url = new URL(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
  );
  url.searchParams.set("pageSize", String(pageSize));
  if (offset) url.searchParams.set("offset", offset);
  if (filterByFormula) url.searchParams.set("filterByFormula", filterByFormula);

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
    query?: string;
    searchFields?: string[];
    typeField?: string;
    typeValue?: string;
  },
): Promise<AirtablePageResult<TFields>> {
  const pageSize = params.pageSize ?? 10;

  // Mock mode: read from a local JSON file (no Airtable network calls).
  if (process.env.AIRTABLE_DATA_PATH) {
    return fetchMockTablePage<TFields>({
      tableName: params.tableName,
      page: params.page,
      pageSize,
      query: params.query,
      searchFields: params.searchFields,
      typeField: params.typeField,
      typeValue: params.typeValue,
    });
  }

  const maxPagesToWalk = params.maxPagesToWalk ?? 50;

  const requestedPage = toSafePositiveInt(params.page, 1);
  const targetPage = Math.min(requestedPage, maxPagesToWalk);

  let currentPage = 1;
  let offset: string | undefined;

  const filterByFormula = buildFilterByFormula({
    query: params.query,
    searchFields: params.searchFields,
    typeField: params.typeField,
    typeValue: params.typeValue,
  });

  while (currentPage < targetPage) {
    const res = await airtableFetchPage<TFields>(
      params.tableName,
      pageSize,
      offset,
      filterByFormula,
    );
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

  const res = await airtableFetchPage<TFields>(
    params.tableName,
    pageSize,
    offset,
    filterByFormula,
  );

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

async function fetchMockRecordById<TFields extends Record<string, unknown>>(
  params: {
    tableName: string;
    recordId: string;
  },
): Promise<AirtableRecord<TFields> | null> {
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
  const found = all.find((r) => r.id === params.recordId);
  return found ?? null;
}

export async function fetchAirtableRecordById<
  TFields extends Record<string, unknown>,
>(params: {
  tableName: string;
  recordId: string;
}): Promise<AirtableRecord<TFields> | null> {
  if (process.env.AIRTABLE_DATA_PATH) {
    return fetchMockRecordById<TFields>(params);
  }

  const { apiKey, baseId } = getAirtableConfig();

  const url = new URL(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(params.tableName)}/${params.recordId}`,
  );

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
      return (await res.json()) as AirtableRecord<TFields>;
    }

    // Record not found.
    if (res.status === 404) {
      return null;
    }

    lastText = await res.text().catch(() => "");
    const requestId = res.headers.get("x-airtable-request-id");

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
