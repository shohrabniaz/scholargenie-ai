import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { MarketingHeader } from "@/components/layout/marketing-header";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <>
      <MarketingHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <p className="text-sm text-muted">Get started</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Create account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
          <div className="mt-8">
            <AuthForm mode="signup" />
          </div>
        </div>
      </main>
    </>
  );
}
