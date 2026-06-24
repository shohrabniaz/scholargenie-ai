"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/supabase/site-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const authSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

type AuthFormProps = {
  mode: "login" | "signup";
  initialError?: string | null;
  initialMessage?: string | null;
};

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return "Please confirm your email before logging in. Check your inbox for the confirmation link.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password. Try again or reset your password.";
  }
  return message;
}

export function AuthForm({
  mode,
  initialError = null,
  initialMessage = null,
}: AuthFormProps) {
  const [error, setError] = useState<string | null>(
    initialError ? friendlyAuthError(initialError) : null,
  );
  const [message, setMessage] = useState<string | null>(initialMessage);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  async function resendConfirmation() {
    const email = pendingEmail ?? getValues("email");
    if (!email) return;

    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl("/onboarding"),
      },
    });

    if (resendError) {
      setError(resendError.message);
    } else {
      setMessage("Confirmation email sent. Check your inbox.");
    }
    setLoading(false);
  }

  async function onSubmit(data: AuthFormData) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: getAuthCallbackUrl("/onboarding"),
        },
      });

      if (signUpError) {
        setError(friendlyAuthError(signUpError.message));
        setLoading(false);
        return;
      }

      if (signUpData.session) {
        window.location.assign("/onboarding");
        return;
      }

      setPendingEmail(data.email);
      setMessage(
        "Account created. Check your email and click the confirmation link, then log in.",
      );
      setLoading(false);
      return;
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (signInError) {
      const friendly = friendlyAuthError(signInError.message);
      setError(friendly);
      if (friendly.includes("confirm your email")) {
        setPendingEmail(data.email);
      }
      setLoading(false);
      return;
    }

    if (!signInData.session) {
      setError("Could not start a session. Please try again.");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") ?? "/dashboard";
    window.location.assign(next.startsWith("/") ? next : "/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-red-500" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Password</Label>
          {mode === "login" ? (
            <Link
              href="/forgot-password"
              className="text-xs text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          ) : null}
        </div>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-red-500" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {message ? (
        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      {pendingEmail && error?.includes("confirm your email") ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={resendConfirmation}
        >
          Resend confirmation email
        </Button>
      ) : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? "Please wait…"
          : mode === "login"
            ? "Log in"
            : "Create account"}
      </Button>
    </form>
  );
}
