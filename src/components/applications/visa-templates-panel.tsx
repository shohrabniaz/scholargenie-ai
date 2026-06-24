"use client";

import { VISA_TEMPLATES } from "@/lib/visa/templates";

export function VisaTemplatesPanel() {
  return (
    <section className="space-y-4" aria-labelledby="visa-templates-heading">
      <div>
        <h2 id="visa-templates-heading" className="text-sm font-medium text-muted">
          Visa step templates
        </h2>
        <p className="mt-1 text-sm text-muted">
          Use these checklists when you add a visa application or track a country-specific path.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {VISA_TEMPLATES.map((template) => (
          <article
            key={template.country}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <h3 className="font-medium text-foreground">{template.country}</h3>
            <ol className="mt-3 space-y-2">
              {template.steps.map((step, i) => (
                <li key={step.title} className="text-sm">
                  <span className="font-medium text-foreground">
                    {i + 1}. {step.title}
                  </span>
                  <p className="mt-0.5 text-muted">{step.detail}</p>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}
