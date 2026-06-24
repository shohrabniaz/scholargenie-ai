import Link from "next/link";

import { APP_NAME } from "@/lib/brand";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <p className="text-sm text-muted">
          {APP_NAME} — free for students. Not legal advice.
        </p>
        <div className="flex gap-6 text-sm text-muted">
          <Link href="/countries/australia" className="hover:text-foreground">
            Guides
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-foreground">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
