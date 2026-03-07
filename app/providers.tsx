"use client";

import { ThemeProvider } from "next-themes";
import ThemeBodyClassCleanup from "@/app/components/theme-body-class-cleanup";

export function Providers(props: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="campwise-theme"
    >
      <ThemeBodyClassCleanup />
      {props.children}
    </ThemeProvider>
  );
}
