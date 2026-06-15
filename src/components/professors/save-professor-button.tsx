"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type SaveProfessorButtonProps = {
  professorId: string;
  initiallySaved?: boolean;
};

export function SaveProfessorButton({
  professorId,
  initiallySaved = false,
}: SaveProfessorButtonProps) {
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
        .from("saved_professors")
        .delete()
        .eq("user_id", user.id)
        .eq("professor_id", professorId);

      if (!error) setSaved(false);
    } else {
      const { error } = await supabase.from("saved_professors").insert({
        user_id: user.id,
        professor_id: professorId,
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
      aria-label={saved ? "Remove from saved" : "Save professor"}
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
