import Link from "next/link";

import { fetchAirtableRecordById, getFirstAttachmentUrl } from "@/lib/airtable";

type GearListFields = Record<string, unknown> & {
  "Set Name"?: string;
  "AI Gear Tip"?: string;
  "Gear Image"?: unknown;
  "Product Link"?: unknown;
  "Shopee Link"?: unknown;
  "Shopee"?: unknown;
  "Lazada Link"?: unknown;
  "Lazada"?: unknown;
  "Category"?: string;
  "Type"?: string;
};

export const dynamic = "force-dynamic";

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

function toStringList(value: unknown): string[] {
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
  const parts = normalized
    .split(/\n|•|\u2022/g)
    .flatMap((p) => p.split(/^\s*[-*]\s*/m))
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length > 1) return parts;
  if (normalized.includes(",")) {
    return normalized
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [normalized];
}

function parseCampingTips(raw: string): {
  pros: string[];
  cons: string[];
  useCases: string[];
  summaryText: string;
} | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return null;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as CampingTipsJson;
    const pros = toStringList(obj.pros ?? obj.strengths);
    const cons = toStringList(obj.cons ?? obj.weaknesses);
    const useCases = toStringList(
      obj.use_cases ??
        obj.useCases ??
        obj.best_use_cases ??
        obj.bestUseCases ??
        obj.bestFor,
    );
    const rawSummary =
      obj.summary ?? obj.aiSummary ?? obj.ai_summary ?? obj.verdict ?? obj.aiVerdict;
    const summaryText = typeof rawSummary === "string" ? rawSummary.trim() : "";
    if (
      pros.length === 0 &&
      cons.length === 0 &&
      useCases.length === 0 &&
      !summaryText
    ) {
      return null;
    }
    return { pros, cons, useCases, summaryText };
  } catch {
    return null;
  }
}

function toExcerpt(value: unknown, maxChars: number): string {
  const raw = typeof value === "string" ? value : String(value ?? "");
  const s = raw.replace(/\s+/g, " ").trim();
  if (s.length <= maxChars) return s;
  return `${s.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function getStringLink(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const found = value.find((v): v is string => typeof v === "string");
    return found ?? null;
  }
  return null;
}

function splitOnTradeOff(text: string): { main: string; tradeOff: string } {
  const marker = "Trade-off:";
  const idx = text.indexOf(marker);
  if (idx === -1) return { main: text.trim(), tradeOff: "" };
  return {
    main: text.slice(0, idx).trim(),
    tradeOff: text.slice(idx + marker.length).trim(),
  };
}

export default async function GearListDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const tableName = process.env.AIRTABLE_DATA_PATH
    ? "Gear_Lists"
    : (process.env.AIRTABLE_TABLE_GEAR_LISTS ?? "Gear_Lists");

  const record = await fetchAirtableRecordById<GearListFields>({
    tableName,
    recordId: id,
  });

  if (!record) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-foreground">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/gear-lists"
            className="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300"
          >
            ← กลับไปที่รายการอุปกรณ์
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            ไม่พบรายการอุปกรณ์
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            อาจถูกลบ หรือคุณไม่มีสิทธิ์เข้าถึง
          </p>
        </div>
      </div>
    );
  }

  const setName = record.fields["Set Name"] ?? "ชุดอุปกรณ์ (ไม่มีชื่อ)";
  const tipRaw = record.fields["AI Gear Tip"] ?? "";
  const tipText = typeof tipRaw === "string" ? tipRaw : String(tipRaw);
  const imageUrl = getFirstAttachmentUrl(record.fields["Gear Image"]);

  // Price links
  const shopeeLink = getStringLink(
    record.fields["Shopee Link"] ?? record.fields["Shopee"],
  );
  const lazadaLink = getStringLink(
    record.fields["Lazada Link"] ?? record.fields["Lazada"],
  );
  const productLink = getStringLink(record.fields["Product Link"]);

  // Category
  const categoryRaw = record.fields["Category"] ?? record.fields["Type"] ?? "";
  const category =
    typeof categoryRaw === "string" ? categoryRaw.trim() : "";

  // Parse AI tip JSON
  const tipsJson = parseCampingTips(tipText);
  const pros = tipsJson?.pros ?? [];
  const cons = tipsJson?.cons ?? [];
  const useCases = tipsJson?.useCases ?? [];

  // Build verdict string (appends Trade-off from cons when JSON)
  const rawVerdict = tipsJson
    ? (tipsJson.summaryText ? toExcerpt(tipsJson.summaryText, 220) : "") +
      (cons[0] ? ` Trade-off: ${cons[0]}` : "")
    : tipText;
  const { main: verdictMain, tradeOff: verdictTradeOff } =
    splitOnTradeOff(rawVerdict);

  // Created date
  const createdDateText = record.createdTime
    ? new Date(record.createdTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  // Extra key-value details (excluding featured fields)
  const featuredKeys = new Set([
    "Set Name",
    "AI Gear Tip",
    "Gear Image",
    "Product Link",
    "Shopee Link",
    "Shopee",
    "Lazada Link",
    "Lazada",
    "Category",
    "Type",
  ]);
  const details = Object.entries(record.fields)
    .filter(([key]) => !featuredKeys.has(key))
    .filter(([, value]) => {
      const t = typeof value;
      return t === "string" || t === "number" || t === "boolean" || value === null;
    })
    .map(([key, value]) => ({
      key,
      value:
        value === null
          ? "-"
          : typeof value === "boolean"
            ? value
              ? "ใช่"
              : "ไม่ใช่"
            : String(value),
    }));

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/gear-lists"
          className="text-sm font-medium text-foreground/80 hover:text-accent"
        >
          ← กลับไปที่รายการอุปกรณ์
        </Link>

        {/* ─── Hero card: horizontal layout ─── */}
        <section className="mt-6 overflow-hidden rounded-3xl bg-forest text-sand shadow-lg ring-1 ring-moss/40">
          <div className="flex flex-col md:flex-row md:items-stretch">
            {/* Left: product image */}
            <div className="relative w-full shrink-0 overflow-hidden bg-moss/30 md:w-[40%]">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={typeof setName === "string" ? setName : "รูปอุปกรณ์"}
                  className="h-full min-h-[240px] w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full min-h-[240px] w-full items-center justify-center text-sm text-sand/50">
                  ไม่มีรูป
                </div>
              )}
            </div>

            {/* Right: content column */}
            <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:p-7">
              {/* Badge + date row */}
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center rounded-full bg-moss/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sand">
                  Gear
                </span>
                {createdDateText && (
                  <span className="text-xs text-sand/50">
                    เพิ่มข้อมูลเมื่อ {createdDateText}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-sand sm:text-3xl">
                {String(setName)}
              </h1>

              {/* Category */}
              {category && (
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 flex-none rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  <span className="text-sand/60">Category:</span>
                  <span className="font-semibold text-sand">{category}</span>
                </div>
              )}

              {/* AI Verdict */}
              {(verdictMain || verdictTradeOff) && (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-sand/40">
                    AI Verdict
                  </p>
                  <p className="text-sm leading-6 text-sand/80">
                    {verdictMain}
                    {verdictTradeOff && (
                      <>
                        {verdictMain ? " " : ""}
                        <span className="font-semibold text-accent">
                          Trade-off:
                        </span>{" "}
                        {verdictTradeOff}
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Suitable For label + price buttons */}
              <div className="mt-auto pt-2">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-sand/40">
                  Suitable For
                </p>
                <div className="flex flex-wrap gap-3">
                  {shopeeLink && (
                    <a
                      href={shopeeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {/* Shopping bag icon (Shopee) */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M19 7h-1.586l-2.707-2.707A1 1 0 0014 4H10a1 1 0 00-.707.293L6.586 7H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2zm-9-.586L11.414 5h1.172L14 6.414V7h-4v-.586zM5 9h14v2H5V9zm0 10v-6h14v6H5z" />
                      </svg>
                      CHECK PRICE AT SHOPEE
                    </a>
                  )}
                  {lazadaLink && (
                    <a
                      href={lazadaLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {/* Price tag icon (Lazada) */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z" />
                      </svg>
                      CHECK PRICE AT LAZADA
                    </a>
                  )}
                  {!shopeeLink && !lazadaLink && productLink && (
                    <a
                      href={productLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      เปิดหน้าสินค้า
                    </a>
                  )}
                  {!shopeeLink && !lazadaLink && !productLink && (
                    <p className="text-sm text-sand/50">ยังไม่มีลิงก์สินค้า</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Pros / Cons / Usage sections ─── */}
        {(pros.length > 0 || cons.length > 0 || useCases.length > 0) && (
          <section aria-label="รายละเอียดเพิ่มเติม" className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {pros.length > 0 && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-moss/30 dark:bg-forest/60">
                  <h3 className="text-base font-semibold">ข้อดี</h3>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/80">
                    {pros.slice(0, 10).map((item, idx) => (
                      <li key={`pro-${idx}`} className="flex gap-2">
                        <span className="mt-[2px] text-accent">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cons.length > 0 && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-moss/30 dark:bg-forest/60">
                  <h3 className="text-base font-semibold">ข้อจำกัด</h3>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/80">
                    {cons.slice(0, 10).map((item, idx) => (
                      <li key={`con-${idx}`} className="flex gap-2">
                        <span className="mt-[2px] text-foreground/60">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {useCases.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-moss/30 dark:bg-forest/60">
                <h3 className="text-base font-semibold">เหมาะสำหรับ</h3>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/80">
                  {useCases.slice(0, 12).map((item, idx) => (
                    <li key={`use-${idx}`} className="flex gap-2">
                      <span className="mt-[2px] text-accent">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* ─── Extra key-value details ─── */}
        {details.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">
              รายละเอียด
            </h2>
            <dl className="grid grid-cols-1 gap-y-3 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-moss/30 dark:bg-forest/60 dark:text-slate-400 sm:grid-cols-2 sm:gap-x-8">
              {details.map((d) => (
                <div key={d.key} className="flex min-w-0 gap-2">
                  <dt className="min-w-32 font-semibold text-slate-900 dark:text-slate-200">
                    {d.key}
                  </dt>
                  <dd className="min-w-0 flex-1 break-words">{d.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}
