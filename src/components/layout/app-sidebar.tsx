"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Search,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme/theme-toggle-lazy";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/scholarships", label: "Scholarships", icon: Search },
  { href: "/universities", label: "Universities", icon: GraduationCap },
  { href: "/professors", label: "Professors", icon: Users },
  { href: "/advisor", label: "Advisor", icon: Sparkles },
  { href: "/deadlines", label: "Deadlines", icon: Calendar },
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

export function AppSidebar({ email }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col border-b border-border bg-surface lg:w-56 lg:min-h-screen lg:border-b-0 lg:border-r">
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
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
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
      </nav>

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
  );
}
