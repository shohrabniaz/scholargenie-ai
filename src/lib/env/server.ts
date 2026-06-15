export function getOpenAiApiKey() {
  return process.env.OPENAI_API_KEY?.trim() || null;
}

export function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || null;
}

export function getResendFromEmail() {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "ScholarGenie AI <onboarding@resend.dev>"
  );
}

export function getCronSecret() {
  return process.env.CRON_SECRET?.trim() || null;
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

export function isOpenAiConfigured() {
  return Boolean(getOpenAiApiKey());
}

export function isResendConfigured() {
  return Boolean(getResendApiKey());
}
