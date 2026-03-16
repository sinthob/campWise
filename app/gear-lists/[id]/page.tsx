import Link from "next/link";

import { fetchAirtableRecordById, getFirstAttachmentUrl } from "@/lib/airtable";

type GearListFields = Record<string, unknown> & {
  "Set Name"?: string;
  "AI Gear Tip"?: string;
  "Gear Image"?: unknown;
};

export const dynamic = "force-dynamic";

function getPrimitiveDetails(
  fields: Record<string, unknown>,
  excludeKeys: string[],
) {
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
              ? "ใช่"
              : "ไม่ใช่"
            : String(value),
    }));
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
  const tip = record.fields["AI Gear Tip"] ?? "";
  const imageUrl = getFirstAttachmentUrl(record.fields["Gear Image"]);

  const details = getPrimitiveDetails(record.fields, [
    "Set Name",
    "AI Gear Tip",
    "Gear Image",
  ]);

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/gear-lists"
          className="text-sm font-medium text-slate-700 hover:text-primary dark:text-slate-300"
        >
          ← กลับไปที่รายการอุปกรณ์
        </Link>

        <header className="mt-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            {String(setName)}
          </h1>
        </header>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative w-full bg-zinc-100 dark:bg-zinc-900">
            <div className="aspect-[16/10] w-full">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={typeof setName === "string" ? setName : "รูปอุปกรณ์"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
                  ไม่มีรูป
                </div>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">
              คำแนะนำจาก AI
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300">
              {String(tip || "ยังไม่มีคำแนะนำจาก AI")}
            </p>

            {details.length > 0 ? (
              <>
                <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-slate-200">
                  รายละเอียด
                </h3>
                <dl className="mt-3 grid grid-cols-1 gap-y-3 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-2 sm:gap-x-8">
                  {details.map((d) => (
                    <div key={d.key} className="flex min-w-0 gap-2">
                      <dt className="min-w-32 font-semibold text-slate-900 dark:text-slate-200">
                        {d.key}
                      </dt>
                      <dd className="min-w-0 flex-1 break-words">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
