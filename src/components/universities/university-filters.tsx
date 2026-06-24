"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { DESTINATION_COUNTRIES } from "@/lib/constants/countries";
const TIERS = ["", "safe", "target", "ambitious"];

const TIER_LABELS: Record<string, string> = {
  safe: "Safe",
  target: "Target",
  ambitious: "Ambitious",
};

export function UniversityFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/universities?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4 rounded-2xl border border-border bg-surface p-4">
      <div className="min-w-[140px] flex-1 space-y-1.5">
        <Label htmlFor="uni-country">Country</Label>
        <Select
          id="uni-country"
          value={searchParams.get("country") ?? ""}
          onChange={(e) => update("country", e.target.value)}
        >
          <option value="">All countries</option>
          {DESTINATION_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div className="min-w-[140px] flex-1 space-y-1.5">
        <Label htmlFor="uni-tier">Match tier</Label>
        <Select
          id="uni-tier"
          value={searchParams.get("tier") ?? ""}
          onChange={(e) => update("tier", e.target.value)}
        >
          <option value="">All tiers</option>
          {TIERS.filter(Boolean).map((t) => (
            <option key={t} value={t}>
              {TIER_LABELS[t]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
