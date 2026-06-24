"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types/notification";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(8)
      .returns<Notification[]>();

    setItems(data ?? []);
  }

  useEffect(() => {
    void fetch("/api/notifications/sync", { method: "POST" }).then(() => load());
  }, []);

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  const unread = items.length;

  return (
    <div className="relative px-3 pb-2">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load();
        }}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
      >
        <Bell className="h-4 w-4 shrink-0" aria-hidden />
        Notifications
        {unread > 0 ? (
          <span className="ml-auto rounded-full bg-foreground px-1.5 py-0.5 text-xs text-background">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute bottom-full left-3 right-3 z-50 mb-1 max-h-64 overflow-y-auto rounded-2xl border border-border bg-background p-2 shadow-lg">
          {items.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted">All caught up.</p>
          ) : (
            <ul className="space-y-1">
              {items.map((n) => (
                <li key={n.id}>
                  {n.href ? (
                    <Link
                      href={n.href}
                      onClick={() => markRead(n.id)}
                      className="block rounded-xl px-3 py-2 text-left hover:bg-foreground/[0.04]"
                    >
                      <p className="text-xs font-medium text-foreground">{n.title}</p>
                      {n.body ? (
                        <p className="mt-0.5 text-xs text-muted line-clamp-2">{n.body}</p>
                      ) : null}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="block w-full rounded-xl px-3 py-2 text-left hover:bg-foreground/[0.04]"
                    >
                      <p className="text-xs font-medium text-foreground">{n.title}</p>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
