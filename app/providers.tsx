"use client";

import { ThemeProvider } from "next-themes";

export function Providers(props: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="campwise-theme"
    >
      {props.children}
    </ThemeProvider>
  );
}
