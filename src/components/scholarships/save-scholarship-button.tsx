"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SaveScholarshipButtonProps = {
  scholarshipId: string;
  initiallySaved?: boolean;
};

export function SaveScholarshipButton({
  scholarshipId,
  initiallySaved = false,
}: SaveScholarshipButtonProps) {
  const [saved, setSaved] = useState(initiallySaved);
  const [loading, setLoading] = useState(false);

  async function toggleSave() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    if (saved) {
      const { error } = await supabase
        .from("saved_scholarships")
        .delete()
        .eq("user_id", user.id)
        .eq("scholarship_id", scholarshipId);

      if (!error) setSaved(false);
    } else {
      const { error } = await supabase.from("saved_scholarships").insert({
        user_id: user.id,
        scholarship_id: scholarshipId,
      });

      if (!error) setSaved(true);
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggleSave}
      disabled={loading}
      aria-label={saved ? "Remove from saved" : "Save scholarship"}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border transition-colors",
        "hover:bg-foreground/[0.06] disabled:opacity-40",
        saved && "bg-foreground/[0.06] text-foreground",
      )}
    >
      <Bookmark
        className={cn("h-4 w-4", saved && "fill-current")}
        aria-hidden
      />
    </button>
  );
}
