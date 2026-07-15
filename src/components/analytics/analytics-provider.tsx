"use client";

import { Suspense, type ReactNode } from "react";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { PostHogPageView } from "@/components/analytics/pageview";

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  );
}
