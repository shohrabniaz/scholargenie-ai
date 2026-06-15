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
import {
  CATEGORY_LABELS,
  type DeadlineCategory,
  type UserDeadline,
} from "@/types/deadline";
import type { Scholarship } from "@/types/scholarship";

type SavedScholarshipDeadline = {
  scholarship: Scholarship;
};

type DeadlinesClientProps = {
  userDeadlines: UserDeadline[];
  savedScholarships: SavedScholarshipDeadline[];
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(date: string) {
  const diff = Math.ceil(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

export function DeadlinesClient({
  userDeadlines: initialDeadlines,
  savedScholarships,
}: DeadlinesClientProps) {
  const router = useRouter();
  const [deadlines, setDeadlines] = useState(initialDeadlines);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState<DeadlineCategory>("application");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const scholarshipItems = savedScholarships
    .filter((s) => s.scholarship.deadline)
    .map((s) => ({
      id: s.scholarship.id,
      title: s.scholarship.name,
      due_date: s.scholarship.deadline!,
      category: "application" as const,
      source: "saved" as const,
    }));

  const allItems = [
    ...scholarshipItems.map((s) => ({
      id: `sch-${s.id}`,
      title: s.title,
      due_date: s.due_date,
      category: s.category,
      notes: null as string | null,
      deletable: false,
    })),
    ...deadlines.map((d) => ({
      id: d.id,
      title: d.title,
      due_date: d.due_date,
      category: d.category,
      notes: d.notes,
      deletable: true,
    })),
  ].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

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
      .from("user_deadlines")
      .insert({
        user_id: user.id,
        title: title.trim(),
        due_date: dueDate,
        category,
        notes: notes.trim() || null,
      })
      .select()
      .single<UserDeadline>();

    if (!error && data) {
      setDeadlines((prev) => [...prev, data]);
      setTitle("");
      setDueDate("");
      setNotes("");
      setShowForm(false);
      router.refresh();
    }

    setLoading(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("user_deadlines").delete().eq("id", id);

    if (!error) {
      setDeadlines((prev) => prev.filter((d) => d.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {allItems.length} upcoming date{allItems.length === 1 ? "" : "s"}
        </p>
        <Button type="button" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Add deadline"}
        </Button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleAdd}
          className="space-y-4 rounded-2xl border border-border bg-surface p-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="dl-title">Title</Label>
            <Input
              id="dl-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Visa interview, IELTS retake…"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dl-date">Due date</Label>
              <Input
                id="dl-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dl-category">Category</Label>
              <Select
                id="dl-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as DeadlineCategory)}
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dl-notes">Notes (optional)</Label>
            <Textarea
              id="dl-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <Button type="submit" size="sm" disabled={loading}>
            Save deadline
          </Button>
        </form>
      ) : null}

      <ul className="space-y-2">
        {allItems.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted">
            No deadlines yet. Save scholarships or add your own reminders.
          </li>
        ) : (
          allItems.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(item.due_date)} · {daysUntil(item.due_date)} ·{" "}
                  {CATEGORY_LABELS[item.category]}
                </p>
                {item.notes ? (
                  <p className="mt-2 text-sm text-muted">{item.notes}</p>
                ) : null}
              </div>
              {item.deletable ? (
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete deadline"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
