/**
 * Reference only (kept as plain TS so it doesn't break builds).
 *
 * next-themes example (App Router):
 *
 * // app/providers.tsx
 * "use client";
 * import { ThemeProvider } from "next-themes";
 *
 * export function Providers({ children }: { children: React.ReactNode }) {
 *   return (
 *     <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
 *       {children}
 *     </ThemeProvider>
 *   );
 * }
 *
 * // Theme toggle
 * "use client";
 * import { useTheme } from "next-themes";
 *
 * export function ThemeToggle() {
 *   const { resolvedTheme, setTheme } = useTheme();
 *   const isDark = resolvedTheme === "dark";
 *   return (
 *     <button onClick={() => setTheme(isDark ? "light" : "dark")}>
 *       Toggle Theme
 *     </button>
 *   );
 * }
 */

export const NEXT_THEMES_EXAMPLE = "See comment block above.";