import { NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// A binding can be listed in the Pages dashboard yet resolve empty at runtime.
// From 15/09/2026 every production secret did, and the quote form returned 503
// for eight days unnoticed. This reports what the running deployment resolves,
// for the scheduled check in .github/workflows/form-health.yml. Names and
// booleans only: never values, lengths or prefixes. Presence is not validity,
// and a revoked key still passes; no upstream call here, because a public
// endpoint that spends the Resend rate limit could block real enquiries.
const REQUIRED = ['TURNSTILE_SECRET_KEY', 'RESEND_API_KEY', 'RESEND_WEBHOOK_SECRET'] as const

export async function GET() {
  let cfEnv: Record<string, string> = {}
  try {
    cfEnv = getRequestContext().env as Record<string, string>
  } catch {
    // fallback to process.env when running locally
  }

  const checks = Object.fromEntries(REQUIRED.map(name => [name, Boolean(cfEnv[name] || process.env[name])]))
  const ok = Object.values(checks).every(Boolean)
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } })
}
