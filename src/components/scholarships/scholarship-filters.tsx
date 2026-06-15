"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const COUNTRIES = ["", "Australia", "Canada", "United Kingdom", "United States"];
const FUNDING = ["", "fully_funded", "partial", "merit", "need_based"];
const DEGREES = ["", "bsc", "msc", "phd"];

const FUNDING_LABELS: Record<string, string> = {
  fully_funded: "Fully funded",
  partial: "Partial",
  merit: "Merit-based",
  need_based: "Need-based",
};

type ScholarshipFiltersProps = {
  showSavedToggle?: boolean;
};

export function ScholarshipFilters({ showSavedToggle = false }: ScholarshipFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/scholarships?${params.toString()}`);
  }

  const savedOnly = searchParams.get("saved") === "1";

  return (
    <div className="space-y-4">
      {showSavedToggle ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update("saved", "")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              !savedOnly
                ? "bg-foreground text-background"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => update("saved", "1")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              savedOnly
                ? "bg-foreground text-background"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            Saved
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-4 rounded-2xl border border-border bg-surface p-4">
        <div className="min-w-[140px] flex-1 space-y-1.5">
          <Label htmlFor="filter-country">Country</Label>
          <Select
            id="filter-country"
            value={searchParams.get("country") ?? ""}
            onChange={(e) => update("country", e.target.value)}
          >
            <option value="">All countries</option>
            {COUNTRIES.filter(Boolean).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[140px] flex-1 space-y-1.5">
          <Label htmlFor="filter-funding">Funding</Label>
          <Select
            id="filter-funding"
            value={searchParams.get("funding") ?? ""}
            onChange={(e) => update("funding", e.target.value)}
          >
            <option value="">All types</option>
            {FUNDING.filter(Boolean).map((f) => (
              <option key={f} value={f}>
                {FUNDING_LABELS[f]}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[140px] flex-1 space-y-1.5">
          <Label htmlFor="filter-degree">Degree</Label>
          <Select
            id="filter-degree"
            value={searchParams.get("degree") ?? ""}
            onChange={(e) => update("degree", e.target.value)}
          >
            <option value="">All degrees</option>
            {DEGREES.filter(Boolean).map((d) => (
              <option key={d} value={d}>
                {d.toUpperCase()}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
