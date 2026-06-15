import { CvAnalyzer } from "@/components/tools/cv-analyzer";

export default function CvPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm text-muted">Tools</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">CV Analyzer</h1>
      <p className="mt-2 text-sm text-muted">
        Quick checklist for graduate applications — sections, length, and impact.
      </p>
      <div className="mt-8">
        <CvAnalyzer />
      </div>
    </div>
  );
}
