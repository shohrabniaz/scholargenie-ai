"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  waitlistSchema,
  type WaitlistFormData,
  DEGREE_OPTIONS,
  HOME_COUNTRY_OPTIONS,
} from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function WaitlistForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  });

  async function onSubmit(data: WaitlistFormData) {
    setStatus("loading");
    setMessage("");

    if (!isSupabaseConfigured()) {
      setStatus("success");
      setMessage("Thanks — we'll be in touch.");
      reset();
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("waitlist").insert({
      email: data.email,
      home_country: data.home_country || null,
      degree_level: data.degree_level || null,
      field_of_study: data.field_of_study || null,
    });

    if (error) {
      setStatus("error");
      setMessage(
        error.code === "23505"
          ? "This email is already on the waitlist."
          : "Something went wrong. Please try again.",
      );
      return;
    }

    setStatus("success");
    setMessage("You're on the list. We'll email you when we launch new features.");
    reset();
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm font-medium text-muted">Early access</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        Join the waitlist
      </h2>
      <p className="mt-2 text-sm text-muted">
        Be first to try scholarship matches and the professor finder.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="waitlist-email">Email</Label>
          <Input
            id="waitlist-email"
            type="email"
            placeholder="you@university.edu"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm text-red-500" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="waitlist-country">Home country</Label>
            <Select id="waitlist-country" {...register("home_country")}>
              <option value="">Select</option>
              {HOME_COUNTRY_OPTIONS.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="waitlist-degree">Degree</Label>
            <Select id="waitlist-degree" {...register("degree_level")}>
              <option value="">Select</option>
              {DEGREE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="waitlist-field">Field of study</Label>
          <Input
            id="waitlist-field"
            placeholder="Cybersecurity"
            {...register("field_of_study")}
          />
        </div>

        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Joining…" : "Join waitlist"}
        </Button>

        {message ? (
          <p
            className={`text-sm ${status === "error" ? "text-red-500" : "text-muted"}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
