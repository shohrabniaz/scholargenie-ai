import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { MarketingHeader } from "@/components/layout/marketing-header";

export const metadata: Metadata = {
  title: "Set new password",
};

export default function ResetPasswordPage() {
  return (
    <>
      <MarketingHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <p className="text-sm text-muted">Account recovery</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Choose a new password
          </h1>
          <p className="mt-2 text-sm text-muted">
            Enter a new password for your account.
          </p>
          <div className="mt-8">
            <ResetPasswordForm />
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
