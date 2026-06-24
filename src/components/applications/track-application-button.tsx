"use client";

import { useState } from "react";
import { ClipboardPlus, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { defaultChecklist } from "@/lib/applications/checklist";
import type { ApplicationKind } from "@/types/application";

type TrackApplicationButtonProps = {
  title: string;
  kind: ApplicationKind;
  scholarshipId?: string;
  universityId?: string;
  initiallyTracked?: boolean;
};

export function TrackApplicationButton({
  title,
  kind,
  scholarshipId,
  universityId,
  initiallyTracked = false,
}: TrackApplicationButtonProps) {
  const [tracked, setTracked] = useState(initiallyTracked);
  const [loading, setLoading] = useState(false);

  async function handleTrack() {
    if (tracked) return;
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      title,
      kind,
      status: "researching",
      scholarship_id: scholarshipId ?? null,
      university_id: universityId ?? null,
      checklist: defaultChecklist(kind),
    });

    if (!error) setTracked(true);
    setLoading(false);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={loading || tracked}
      onClick={handleTrack}
    >
      {tracked ? (
        <>
          <Check className="h-3.5 w-3.5" aria-hidden />
          Tracked
        </>
      ) : (
        <>
          <ClipboardPlus className="h-3.5 w-3.5" aria-hidden />
          Track
        </>
      )}
    </Button>
  );
}
