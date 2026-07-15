"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import { createClient } from "@/lib/supabase/client";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle-lazy";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/scholarships", label: "Scholarships", icon: Search },
  { href: "/universities", label: "Universities", icon: GraduationCap },
  { href: "/professors", label: "Professors", icon: Users },
  { href: "/advisor", label: "Advisor", icon: Sparkles },
  { href: "/deadlines", label: "Deadlines", icon: Calendar },
  { href: "/applications", label: "Applications", icon: ClipboardList },
  { href: "/tools", label: "Tools", icon: FileText },
  { href: "/onboarding", label: "Profile", icon: User },
];

function isActive(pathname: string, href: string) {
  if (href === "/tools") {
    return pathname === "/tools" || pathname.startsWith("/tools/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AppSidebarProps = {
  email?: string | null;
};

function NavLinks({
  pathname,
  onNavigate,
  compact = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  return (
    <ul className={cn(compact ? "space-y-0.5" : "space-y-0.5")}>
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-foreground/[0.06] font-medium text-foreground"
                  : "text-muted hover:bg-foreground/[0.04] hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AppSidebar({ email }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          <Link
            href="/dashboard"
            className="truncate text-sm font-semibold tracking-tight text-foreground"
          >
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-1">
            <NotificationsBell variant="icon" />
            <ThemeToggle />
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col border-l border-border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <p className="text-sm font-semibold text-foreground">Menu</p>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-foreground/[0.04]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="App navigation">
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </nav>
            <div className="border-t border-border p-4">
              {email ? (
                <p className="mb-3 truncate text-xs text-muted">{email}</p>
              ) : null}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface lg:flex lg:min-h-screen">
        <div className="flex items-center justify-between p-5">
          <Link
            href="/dashboard"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            {APP_NAME}
          </Link>
          <ThemeToggle />
        </div>

        <nav className="flex-1 px-3 pb-3" aria-label="App navigation">
          <NavLinks pathname={pathname} />
        </nav>

        <NotificationsBell variant="row" />

        <div className="border-t border-border p-4">
          {email ? (
            <p className="mb-3 truncate text-xs text-muted">{email}</p>
          ) : null}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
