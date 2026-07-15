"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AnalyticsEvents, track } from "@/lib/analytics/events";
import {
  computeUniversityTier,
} from "@/lib/matching/university-tier";
import { TIER_LABELS, type University } from "@/types/university";
import type { Profile } from "@/types/database";

type UniversityCompareClientProps = {
  universities: University[];
  profile: Profile | null;
  initialIds?: string[];
};

export function UniversityCompareClient({
  universities,
  profile,
  initialIds = [],
}: UniversityCompareClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string[]>(
    initialIds.filter(Boolean).slice(0, 3),
  );

  const chosen = useMemo(
    () =>
      selected
        .map((id) => universities.find((u) => u.id === id))
        .filter(Boolean) as University[],
    [selected, universities],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function applyCompare() {
    const params = new URLSearchParams(searchParams.toString());
    if (selected.length > 0) params.set("ids", selected.join(","));
    else params.delete("ids");
    track(AnalyticsEvents.universitiesCompared, { count: selected.length });
    router.push(`/universities/compare?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm font-medium text-foreground">
          Select up to 3 universities
        </p>
        <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          {universities.map((u) => {
            const checked = selected.includes(u.id);
            return (
              <li key={u.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm hover:bg-foreground/[0.04]">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && selected.length >= 3}
                    onChange={() => toggle(u.id)}
                  />
                  <span className="text-foreground">
                    {u.name}
                    <span className="text-muted"> · {u.country}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <Button type="button" size="sm" className="mt-3" onClick={applyCompare}>
          Compare selected
        </Button>
      </div>

      {chosen.length >= 2 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="py-2 pr-3 font-medium">Metric</th>
                {chosen.map((u) => (
                  <th key={u.id} className="py-2 px-3 font-medium text-foreground">
                    {u.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Country", (u: University) => u.country],
                  ["City", (u: University) => u.city ?? "—"],
                  [
                    "Tuition (USD)",
                    (u: University) =>
                      u.tuition_usd_min != null
                        ? `${u.tuition_usd_min.toLocaleString()}${
                            u.tuition_usd_max
                              ? `–${u.tuition_usd_max.toLocaleString()}`
                              : "+"
                          }`
                        : "—",
                  ],
                  ["Min GPA", (u: University) => u.min_gpa?.toString() ?? "—"],
                  ["Min IELTS", (u: University) => u.min_ielts?.toString() ?? "—"],
                  [
                    "Your tier",
                    (u: University) => {
                      const tier = computeUniversityTier(profile, u);
                      return tier ? TIER_LABELS[tier] : "—";
                    },
                  ],
                  [
                    "Fields",
                    (u: University) =>
                      u.fields?.slice(0, 3).join(", ") || "—",
                  ],
                ] as [string, (u: University) => string][]
              ).map(([label, getter]) => (
                <tr key={label} className="border-b border-border">
                  <td className="py-2 pr-3 text-muted">{label}</td>
                  {chosen.map((u) => (
                    <td key={u.id} className="py-2 px-3 text-foreground">
                      {getter(u)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted">Pick at least 2 universities to compare.</p>
      )}
    </div>
  );
}
