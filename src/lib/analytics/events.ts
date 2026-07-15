"use client";

import posthog from "posthog-js";

export const AnalyticsEvents = {
  signup: "signup",
  onboardingCompleted: "onboarding_completed",
  scholarshipSaved: "scholarship_saved",
  applicationTracked: "application_tracked",
  advisorMessage: "advisor_message",
  waitlistJoined: "waitlist_joined",
  outreachStatusChanged: "outreach_status_changed",
  sopDraftSaved: "sop_draft_saved",
  universitiesCompared: "universities_compared",
} as const;

export function track(
  event: (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents],
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // analytics must never break product flows
  }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()) return;
  try {
    posthog.identify(userId, traits);
  } catch {
    // ignore
  }
}
