"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

export default function NavBar() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const effectiveTheme: "light" | "dark" =
    resolvedTheme === "light" || resolvedTheme === "dark"
      ? resolvedTheme
      : theme === "light" || theme === "dark"
        ? theme
        : "light";

  const isDark = effectiveTheme === "dark";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white text-foreground shadow-sm dark:border-moss/30 dark:bg-forest dark:text-sand">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-base font-bold tracking-wide">
          🌲 CampWise
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <Link
            href="/gear-lists"
            className="rounded-full px-4 py-2 text-sm text-foreground/80 hover:bg-zinc-100 hover:text-foreground dark:text-sand/85 dark:hover:bg-moss/20 dark:hover:text-sand"
          >
            รายการอุปกรณ์
          </Link>
          <Link
            href="/campgrounds"
            className="rounded-full px-4 py-2 text-sm text-foreground/80 hover:bg-zinc-100 hover:text-foreground dark:text-sand/85 dark:hover:bg-moss/20 dark:hover:text-sand"
          >
            ลานกางเต็นท์
          </Link>
          <Link
            href="/camping-hacks"
            className="rounded-full px-4 py-2 text-sm text-foreground/80 hover:bg-zinc-100 hover:text-foreground dark:text-sand/85 dark:hover:bg-moss/20 dark:hover:text-sand"
          >
            เคล็ดลับ &amp; ทริค
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => {
            const next = isDark ? "light" : "dark";
            setTheme(next);
          }}
          aria-label="สลับโหมดสว่าง/มืด"
          className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-foreground hover:bg-zinc-50 dark:border-moss/40 dark:bg-forest dark:text-sand dark:hover:bg-moss/20"
        >
          {isDark ? "ธีม: มืด" : "ธีม: สว่าง"}
        </button>
      </div>

      <nav className="mx-auto flex w-full max-w-6xl gap-2 px-4 pb-4 sm:hidden">
        <Link
          href="/gear-lists"
          className="flex-1 rounded-full px-3 py-2 text-center text-sm text-foreground/80 hover:bg-zinc-100 hover:text-foreground dark:text-sand/85 dark:hover:bg-moss/20 dark:hover:text-sand"
        >
          อุปกรณ์
        </Link>
        <Link
          href="/campgrounds"
          className="flex-1 rounded-full px-3 py-2 text-center text-sm text-foreground/80 hover:bg-zinc-100 hover:text-foreground dark:text-sand/85 dark:hover:bg-moss/20 dark:hover:text-sand"
        >
          แคมป์
        </Link>
        <Link
          href="/camping-hacks"
          className="flex-1 rounded-full px-3 py-2 text-center text-sm text-foreground/80 hover:bg-zinc-100 hover:text-foreground dark:text-sand/85 dark:hover:bg-moss/20 dark:hover:text-sand"
        >
          เคล็ดลับ
        </Link>
      </nav>
    </header>
  );
}
