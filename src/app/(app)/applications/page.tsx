import { createClient } from "@/lib/supabase/server";
import { ApplicationsClient } from "@/components/applications/applications-client";
import { VisaTemplatesPanel } from "@/components/applications/visa-templates-panel";
import type { Application } from "@/types/application";

export default async function ApplicationsPage() {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .order("updated_at", { ascending: false })
    .returns<Application[]>();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-muted">Applications</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Track your progress</h1>
      <p className="mt-2 text-sm text-muted">
        Kanban-style tracker for scholarships, universities, and visa steps.
      </p>

      <div className="mt-8 space-y-10">
        <ApplicationsClient initialApplications={applications ?? []} />
        <VisaTemplatesPanel />
      </div>
    </div>
  );
}
