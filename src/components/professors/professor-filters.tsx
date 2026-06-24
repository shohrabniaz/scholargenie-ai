"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { DESTINATION_COUNTRIES } from "@/lib/constants/countries";

export function ProfessorFilters({ showSavedToggle = false }: { showSavedToggle?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/professors?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4 rounded-2xl border border-border bg-surface p-4">
      <div className="min-w-[140px] flex-1 space-y-1.5">
        <Label htmlFor="prof-country">Country</Label>
        <Select
          id="prof-country"
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
      {showSavedToggle ? (
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => update("saved", searchParams.get("saved") === "1" ? "" : "1")}
            className={`h-10 rounded-xl border px-4 text-sm transition-colors ${
              searchParams.get("saved") === "1"
                ? "border-foreground/20 bg-foreground/[0.06] font-medium text-foreground"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {searchParams.get("saved") === "1" ? "Saved" : "All"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
