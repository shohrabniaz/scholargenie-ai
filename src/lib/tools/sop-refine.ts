export function refineSopDraft(draft: string, instruction: string): string {
  const lower = instruction.toLowerCase();
  let text = draft.trim();

  if (lower.includes("shorter") || lower.includes("concise")) {
    const paragraphs = text.split(/\n\n+/).filter(Boolean);
    text = paragraphs.slice(0, Math.max(2, paragraphs.length - 1)).join("\n\n");
  }

  if (lower.includes("stronger opening") || lower.includes("opening")) {
    const rest = text.replace(/^[^\n]+\n?/, "").trim();
    text = `From my first research project onward, I have been drawn to problems where theory meets real-world impact.\n\n${rest}`;
  }

  if (lower.includes("grammar") || lower.includes("clarity")) {
    text = text
      .replace(/\s+/g, " ")
      .replace(/\. /g, ".\n\n")
      .trim();
  }

  return `${text}\n\n[Refined with rule-based helper — add OPENAI_API_KEY for deeper edits.]`;
}
