import Link from "next/link";
import { FileText, PenLine } from "lucide-react";

const tools = [
  {
    href: "/tools/sop",
    icon: PenLine,
    title: "SOP Writer",
    description: "Structured statement of purpose draft from your profile.",
  },
  {
    href: "/tools/cv",
    icon: FileText,
    title: "CV Analyzer",
    description: "Checklist for sections, length, and impact.",
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-muted">Tools</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Application tools</h1>
      <p className="mt-2 text-sm text-muted">
        Draft your SOP and review your CV before you apply.
      </p>

      <ul className="mt-8 space-y-3">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-background"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.04]">
                <tool.icon className="h-4 w-4 text-muted" strokeWidth={1.5} aria-hidden />
              </div>
              <div>
                <p className="font-medium text-foreground">{tool.title}</p>
                <p className="mt-1 text-sm text-muted">{tool.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
