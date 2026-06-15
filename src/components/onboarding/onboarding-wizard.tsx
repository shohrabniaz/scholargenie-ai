"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import {
  onboardingSchema,
  type OnboardingFormData,
  COUNTRY_OPTIONS,
  DEGREE_OPTIONS,
  HOME_COUNTRY_OPTIONS,
} from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "About you" },
  { id: 2, title: "Academics" },
  { id: 3, title: "Goals" },
] as const;

type OnboardingWizardProps = {
  defaultValues?: Partial<OnboardingFormData>;
  isEdit?: boolean;
};

export function OnboardingWizard({
  defaultValues,
  isEdit = false,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      preferred_countries: [],
      ielts_score: null,
      pte_score: null,
      ...defaultValues,
    },
  });

  const preferredCountries = watch("preferred_countries") ?? [];

  function toggleCountry(country: string) {
    const current = preferredCountries;
    if (current.includes(country)) {
      setValue(
        "preferred_countries",
        current.filter((c) => c !== country),
        { shouldValidate: true },
      );
      return;
    }
    setValue("preferred_countries", [...current, country], { shouldValidate: true });
  }

  async function goNext() {
    let fields: (keyof OnboardingFormData)[] = [];
    if (step === 1) fields = ["full_name", "home_country", "degree_level"];
    if (step === 2) fields = ["field_of_study", "cgpa"];
    if (step === 3) fields = ["budget_usd", "preferred_countries"];

    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, 3));
  }

  async function onSubmit(data: OnboardingFormData) {
    setLoading(true);
    setSubmitError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitError("You must be signed in to complete onboarding.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        home_country: data.home_country,
        degree_level: data.degree_level,
        field_of_study: data.field_of_study,
        cgpa: data.cgpa,
        ielts_score: data.ielts_score ?? null,
        pte_score: data.pte_score ?? null,
        budget_usd: data.budget_usd,
        preferred_countries: data.preferred_countries,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (error) {
      setSubmitError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>
          {isEdit ? "Update profile" : "Your profile"}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? "Keep your details current for better matches."
            : "A few details so we can match scholarships and universities."}
        </CardDescription>
      </CardHeader>

      <ol className="mb-8 flex gap-2" aria-label="Onboarding progress">
        {STEPS.map((s) => (
          <li
            key={s.id}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-center text-xs font-medium sm:text-sm",
              step >= s.id
                ? "bg-foreground text-background"
                : "bg-foreground/[0.06] text-muted",
            )}
          >
            {s.title}
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" {...register("full_name")} />
              {errors.full_name ? (
                <p className="text-sm text-red-500">{errors.full_name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="home_country">Home country</Label>
              <Select id="home_country" {...register("home_country")}>
                <option value="">Select</option>
                {HOME_COUNTRY_OPTIONS.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </Select>
              {errors.home_country ? (
                <p className="text-sm text-red-500">{errors.home_country.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree_level">Degree you&apos;re applying for</Label>
              <Select id="degree_level" {...register("degree_level")}>
                <option value="">Select</option>
                {DEGREE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.degree_level ? (
                <p className="text-sm text-red-500">{errors.degree_level.message}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field_of_study">Field of study</Label>
              <Input
                id="field_of_study"
                placeholder="e.g. Cybersecurity"
                {...register("field_of_study")}
              />
              {errors.field_of_study ? (
                <p className="text-sm text-red-500">{errors.field_of_study.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cgpa">CGPA (4.0 scale)</Label>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="4"
                {...register("cgpa", { valueAsNumber: true })}
              />
              {errors.cgpa ? (
                <p className="text-sm text-red-500">{errors.cgpa.message}</p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ielts_score">IELTS (optional)</Label>
                <Input
                  id="ielts_score"
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  placeholder="7.0"
                  {...register("ielts_score", {
                    setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pte_score">PTE (optional)</Label>
                <Input
                  id="pte_score"
                  type="number"
                  min="10"
                  max="90"
                  placeholder="65"
                  {...register("pte_score", {
                    setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                  })}
                />
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget_usd">Annual budget (USD)</Label>
              <Input
                id="budget_usd"
                type="number"
                min="0"
                placeholder="15000"
                {...register("budget_usd", { valueAsNumber: true })}
              />
              {errors.budget_usd ? (
                <p className="text-sm text-red-500">{errors.budget_usd.message}</p>
              ) : null}
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">
                Preferred destinations
              </legend>
              <div className="flex flex-wrap gap-2">
                {COUNTRY_OPTIONS.map((country) => {
                  const selected = preferredCountries.includes(country);
                  return (
                    <button
                      key={country}
                      type="button"
                      onClick={() => toggleCountry(country)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                        selected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-surface text-muted hover:border-foreground/20 hover:text-foreground",
                      )}
                    >
                      {country}
                    </button>
                  );
                })}
              </div>
              {errors.preferred_countries ? (
                <p className="text-sm text-red-500">
                  {errors.preferred_countries.message}
                </p>
              ) : null}
            </fieldset>
          </div>
        ) : null}

        {submitError ? (
          <p className="text-sm text-red-500" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(s - 1, 1))}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={goNext}>
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save" : "Finish"}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
