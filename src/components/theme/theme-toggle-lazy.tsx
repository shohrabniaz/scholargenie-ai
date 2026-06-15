"use client";

import dynamic from "next/dynamic";

export const ThemeToggle = dynamic(
  () => import("./theme-toggle").then((m) => m.ThemeToggle),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-9 w-9 rounded-full border border-border bg-surface"
        aria-hidden
      />
    ),
  },
);
