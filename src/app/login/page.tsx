import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { MarketingHeader } from "@/components/layout/marketing-header";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Log in",
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <>
      <MarketingHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <p className="text-sm text-muted">Welcome back</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Log in</h1>
          <p className="mt-2 text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-4 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted">
            Database was refreshed in July 2026. If your old login fails,{" "}
            <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
              create a new account
            </Link>
            .
          </p>
          <div className="mt-8">
            <AuthForm
              mode="login"
              initialError={params.error}
              initialMessage={params.message}
            />
          </div>
        </div>
      </main>
    </>
  );
}
