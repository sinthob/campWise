"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  basePath: string;
  searchPlaceholder: string;
  typeLabel: string;
  typePlaceholder: string;
  typeOptions: string[];
};

export default function ListFilters(props: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";

  function update(params: { q?: string; type?: string }) {
    const next = new URLSearchParams(searchParams.toString());

    if (typeof params.q === "string") {
      if (params.q.trim().length > 0) next.set("q", params.q);
      else next.delete("q");
    }

    if (typeof params.type === "string") {
      if (params.type.trim().length > 0) next.set("type", params.type);
      else next.delete("type");
    }

    // Reset pagination when filters change.
    next.delete("page");

    const qs = next.toString();
    router.replace(qs ? `${props.basePath}?${qs}` : props.basePath, {
      scroll: false,
    });
  }

  return (
    <div className="mb-6 rounded-2xl border border-moss/30 bg-forest p-4 shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex-1">
          <span className="sr-only">Search</span>
          <input
            value={q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder={props.searchPlaceholder}
            className="h-11 w-full rounded-full border border-moss/40 bg-forest/60 px-4 text-sm text-sand outline-none ring-0 placeholder:text-sand/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>

        <label className="sm:w-72">
          <span className="sr-only">{props.typeLabel}</span>
          <select
            value={type}
            onChange={(e) => update({ type: e.target.value })}
            className="h-11 w-full rounded-full border border-moss/40 bg-forest/60 px-4 text-sm text-sand outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="">{props.typePlaceholder}</option>
            {props.typeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
