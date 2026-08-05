"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { AnalyticsEvents, track, identifyUser } from "@/lib/analytics/events";
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
    return "Your email is not verified yet. Request an AbroadGenie verification email below, or verify instantly.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password. Try again or reset your password.";
  }
  return message;
}

async function signInAndRedirect(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    throw new Error(error?.message ?? "Could not sign in");
  }

  if (data.user) {
    identifyUser(data.user.id, { email: data.user.email });
  }

  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") ?? "/dashboard";
  window.location.assign(next.startsWith("/") ? next : "/dashboard");
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
  const [needsVerification, setNeedsVerification] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [savedPassword, setSavedPassword] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  async function verifyEmailNow() {
    const email = savedEmail ?? getValues("email");
    const password = savedPassword ?? getValues("password");
    if (!email) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/confirm-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = (await res.json()) as { error?: string; message?: string; ok?: boolean };

    if (!res.ok) {
      setError(data.message ?? data.error ?? "Could not verify email.");
      setLoading(false);
      return;
    }

    if (password) {
      try {
        await signInAndRedirect(email, password);
        return;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verified, but login failed.");
        setLoading(false);
        return;
      }
    }

    setMessage("Email verified. You can log in now.");
    setNeedsVerification(false);
    setLoading(false);
  }

  async function sendVerificationMail() {
    const email = savedEmail ?? getValues("email");
    if (!email) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mode: "email" }),
    });

    const data = (await res.json()) as {
      error?: string;
      ok?: boolean;
      note?: string;
      channel?: string;
      method?: string;
    };

    if (!res.ok) {
      setError(data.error ?? "Could not send verification email.");
      setLoading(false);
      return;
    }

    if (data.method === "instant") {
      setMessage(
        data.note ??
          "Email verified instantly. You can log in now. Add RESEND_API_KEY for branded verification emails.",
      );
      setNeedsVerification(false);
    } else {
      setMessage(
        "We sent a verification email from AbroadGenie AI. Check inbox and spam, then tap the link.",
      );
    }
    setLoading(false);
  }

  async function onSubmit(data: AuthFormData) {
    setLoading(true);
    setError(null);
    setMessage(null);
    setNeedsVerification(false);
    setSavedEmail(data.email);
    setSavedPassword(data.password);

    if (mode === "signup") {
      const apiRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const apiData = (await apiRes.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (apiRes.ok && apiData.ok) {
        track(AnalyticsEvents.signup, { method: "api" });
        try {
          await signInAndRedirect(data.email, data.password);
          return;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Account created but login failed.";
          const friendly = friendlyAuthError(msg);
          setError(friendly);
          if (friendly.toLowerCase().includes("not verified")) {
            setNeedsVerification(true);
          }
          setLoading(false);
          return;
        }
      }

      if (apiRes.status === 503) {
        setNeedsVerification(true);
        setMessage(
          "Almost there — tap “Send verification email” or “Verify instantly” to finish.",
        );
        setError(apiData.message ?? null);
        setLoading(false);
        return;
      }

      setError(apiData.message ?? apiData.error ?? "Could not create account.");
      setLoading(false);
      return;
    }

    try {
      await signInAndRedirect(data.email, data.password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      const friendly = friendlyAuthError(msg);
      setError(friendly);
      if (friendly.toLowerCase().includes("not verified")) {
        setNeedsVerification(true);
      }
      setLoading(false);
    }
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

      {needsVerification ? (
        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            disabled={loading}
            onClick={sendVerificationMail}
          >
            Send verification email
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={verifyEmailNow}
          >
            Verify instantly
          </Button>
        </div>
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
