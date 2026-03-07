"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function ThemeBodyClassCleanup() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (typeof document === "undefined") return;

    // next-themes drives theme via <html class="dark">.
    // If any legacy code left theme classes on <body>, Tailwind's `dark:`
    // variants can incorrectly stay active and cause low-contrast/invisible UI.
    document.body.classList.remove("dark");
    document.body.classList.remove("light");
  }, [resolvedTheme]);

  return null;
}
