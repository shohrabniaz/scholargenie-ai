import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { MarketingHeader } from "@/components/layout/marketing-header";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <MarketingHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <p className="text-sm text-muted">Account recovery</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-muted">
            Enter your email and we&apos;ll send you a reset link.
          </p>
          <div className="mt-8">
            <ForgotPasswordForm />
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
              Back to log in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
