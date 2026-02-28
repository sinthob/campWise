"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

export default function NavBar() {
  const { setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          CampWise
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <Link
            href="/gear-lists"
            className="rounded-full px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Gear Lists
          </Link>
          <Link
            href="/campgrounds"
            className="rounded-full px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Campgrounds
          </Link>
          <Link
            href="/camping-hacks"
            className="rounded-full px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Tips &amp; Hacks
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => {
            const isDark = document.documentElement.classList.contains("dark");
            setTheme(isDark ? "light" : "dark");
          }}
          aria-label="Toggle dark mode"
          className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Dark mode
        </button>
      </div>

      <nav className="mx-auto flex w-full max-w-6xl gap-2 px-4 pb-3 sm:hidden">
        <Link
          href="/gear-lists"
          className="flex-1 rounded-full px-3 py-2 text-center text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Gear
        </Link>
        <Link
          href="/campgrounds"
          className="flex-1 rounded-full px-3 py-2 text-center text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Camps
        </Link>
        <Link
          href="/camping-hacks"
          className="flex-1 rounded-full px-3 py-2 text-center text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Tips
        </Link>
      </nav>
    </header>
  );
}
