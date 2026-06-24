"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  defaultChecklist,
  parseChecklist,
} from "@/lib/applications/checklist";
import {
  KIND_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  type Application,
  type ApplicationKind,
  type ApplicationStatus,
} from "@/types/application";

type ApplicationsClientProps = {
  initialApplications: Application[];
};

const KINDS: ApplicationKind[] = ["scholarship", "university", "visa", "other"];

export function ApplicationsClient({
  initialApplications,
}: ApplicationsClientProps) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ApplicationKind>("university");
  const [status, setStatus] = useState<ApplicationStatus>("researching");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const grouped = STATUS_ORDER.map((s) => ({
    status: s,
    items: applications.filter((a) => a.status === s),
  })).filter((g) => g.items.length > 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        title: title.trim(),
        kind,
        status,
        notes: notes.trim() || null,
        checklist: defaultChecklist(kind),
      })
      .select()
      .single<Application>();

    if (!error && data) {
      setApplications((prev) => [data, ...prev]);
      setTitle("");
      setNotes("");
      setShowForm(false);
      router.refresh();
    }

    setLoading(false);
  }

  async function updateStatus(id: string, nextStatus: ApplicationStatus) {
    const supabase = createClient();
    const { error } = await supabase
      .from("applications")
      .update({ status: nextStatus })
      .eq("id", id);

    if (!error) {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)),
      );
      router.refresh();
    }
  }

  async function toggleChecklistItem(appId: string, itemId: string, kind: ApplicationKind) {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    const items = parseChecklist(app.checklist, kind).map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item,
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("applications")
      .update({ checklist: items })
      .eq("id", appId);

    if (!error) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, checklist: items } : a)),
      );
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("applications").delete().eq("id", id);

    if (!error) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {applications.length} application{applications.length === 1 ? "" : "s"}
        </p>
        <Button type="button" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Add application"}
        </Button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleAdd}
          className="space-y-4 rounded-2xl border border-border bg-surface p-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="app-title">Title</Label>
            <Input
              id="app-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="University of Melbourne — MSc CS"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="app-kind">Type</Label>
              <Select
                id="app-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as ApplicationKind)}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABELS[k]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-status">Status</Label>
              <Select
                id="app-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-notes">Notes (optional)</Label>
            <Textarea
              id="app-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <Button type="submit" size="sm" disabled={loading}>
            Save
          </Button>
        </form>
      ) : null}

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
          No applications yet. Track scholarships, universities, and visa steps here.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ status: groupStatus, items }) => (
            <section key={groupStatus}>
              <h2 className="text-sm font-medium text-muted">
                {STATUS_LABELS[groupStatus]} ({items.length})
              </h2>
              <ul className="mt-3 space-y-2">
                {items.map((app) => (
                  <li
                    key={app.id}
                    className="rounded-2xl border border-border bg-surface p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{app.title}</p>
                          <Badge variant="subtle">{KIND_LABELS[app.kind]}</Badge>
                        </div>
                        {app.notes ? (
                          <p className="mt-2 text-sm text-muted">{app.notes}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(app.id)}
                        aria-label="Delete application"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    <div className="mt-3">
                      <Label htmlFor={`status-${app.id}`} className="sr-only">
                        Update status
                      </Label>
                      <Select
                        id={`status-${app.id}`}
                        value={app.status}
                        onChange={(e) =>
                          updateStatus(app.id, e.target.value as ApplicationStatus)
                        }
                        className="max-w-xs"
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <ul className="mt-4 space-y-2 border-t border-border pt-3">
                      {parseChecklist(app.checklist, app.kind).map((item) => (
                        <li key={item.id}>
                          <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={item.done}
                              onChange={() =>
                                toggleChecklistItem(app.id, item.id, app.kind)
                              }
                              className="rounded border-border"
                            />
                            <span
                              className={
                                item.done ? "text-muted line-through" : "text-foreground"
                              }
                            >
                              {item.label}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
