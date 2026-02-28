"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

export default function NavBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-50 border-b border-moss/30 bg-forest text-sand shadow-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-base font-bold tracking-wide">
          🌲 CampWise
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <Link
            href="/gear-lists"
            className="rounded-full px-4 py-2 text-sm text-sand/85 hover:bg-moss/20 hover:text-sand"
          >
            Gear Lists
          </Link>
          <Link
            href="/campgrounds"
            className="rounded-full px-4 py-2 text-sm text-sand/85 hover:bg-moss/20 hover:text-sand"
          >
            Campgrounds
          </Link>
          <Link
            href="/camping-hacks"
            className="rounded-full px-4 py-2 text-sm text-sand/85 hover:bg-moss/20 hover:text-sand"
          >
            Tips &amp; Hacks
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => {
            setTheme(isDark ? "light" : "dark");
          }}
          aria-label="Toggle dark mode"
          className="inline-flex h-10 items-center justify-center rounded-full border border-moss/40 bg-forest px-4 text-sm font-semibold text-sand hover:bg-moss/20"
        >
          {isDark ? "Light mode" : "Dark mode"}
        </button>
      </div>

      <nav className="mx-auto flex w-full max-w-6xl gap-2 px-4 pb-4 sm:hidden">
        <Link
          href="/gear-lists"
          className="flex-1 rounded-full px-3 py-2 text-center text-sm text-sand/85 hover:bg-moss/20 hover:text-sand"
        >
          Gear
        </Link>
        <Link
          href="/campgrounds"
          className="flex-1 rounded-full px-3 py-2 text-center text-sm text-sand/85 hover:bg-moss/20 hover:text-sand"
        >
          Camps
        </Link>
        <Link
          href="/camping-hacks"
          className="flex-1 rounded-full px-3 py-2 text-center text-sm text-sand/85 hover:bg-moss/20 hover:text-sand"
        >
          Tips
        </Link>
      </nav>
    </header>
  );
}
