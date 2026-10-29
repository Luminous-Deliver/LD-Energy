/**
 * Where an enquirer arrived from (Abdul 29/10/2026, after competitor emails showing "came from bing.com").
 *
 * Kept deliberately small, in line with the 11/09 rule in lib/enquiry-attribution.ts: the referring site's domain only
 * (never the full link, which can carry search words or tracking codes) and the path of the first page opened on this
 * site (never its query string). Held in memory for this page load only: nothing is written to the visitor's device.
 * Next.js navigation keeps document.referrer at the original arrival, so a later form still sees it.
 */
const OWN_HOST = /(^|\.)luminousanddeliver\.co\.uk$|\.pages\.dev$|^localhost$|^127\.0\.0\.1$/

export interface LandingContext { referrerHost?: string; landingPage?: string; sourceTag?: string }

/** The one link tag kept (29/10/2026): `utm_source`, from links Abdul controls, such as `?utm_source=gbp` on the
 *  Google Business Profile website button. Apps (Maps, Gmail, WhatsApp) send no referrer, so a tag is the only signal. */
export const SOURCE_TAG_RE = /^[a-z0-9_-]{1,40}$/

function capture(): LandingContext {
  if (typeof window === 'undefined') return {}
  const out: LandingContext = { landingPage: window.location.pathname.slice(0, 120) }
  const tag = new URLSearchParams(window.location.search).get('utm_source')?.trim().toLowerCase()
  if (tag && SOURCE_TAG_RE.test(tag)) out.sourceTag = tag
  try {
    const host = document.referrer ? new URL(document.referrer).hostname.toLowerCase().replace(/^www\./, '') : ''
    if (host && !OWN_HOST.test(host)) out.referrerHost = host.slice(0, 100)
  } catch {
    // an unreadable referrer is the same as none
  }
  return out
}

let first: LandingContext | null = null

/** Call once as the site loads (components/layout/HashScroll.tsx) so the first page is the one recorded. */
export function rememberLanding(): void {
  if (!first) first = capture()
}

export function landingContext(): LandingContext {
  rememberLanding()
  return first ?? {}
}

/** The server-side shapes: a bare hostname and a bare path, so nothing else can ride along. */
export const REFERRER_HOST_RE = /^[a-z0-9.-]{1,100}$/
export const LANDING_PAGE_RE = /^\/[a-z0-9\-/]{0,119}$/

const TAG_LABELS: Record<string, string> = { gbp: 'Google Business Profile', google: 'Google', bing: 'Bing', facebook: 'Facebook', instagram: 'Instagram', whatsapp: 'WhatsApp', nextdoor: 'Nextdoor', checkatrade: 'Checkatrade' }

/** "Google", "Bing" and so on for the business email; any other site by its domain. A link tag wins over the referrer. */
export function referrerLabel(host?: string, tag?: string): string {
  if (tag) return `${TAG_LABELS[tag] ?? tag} (link tag utm_source=${tag})`
  if (!host) return 'Unknown: an app link (Google Maps, Gmail, WhatsApp), a bookmark or a typed address'
  const known: Array<[RegExp, string]> = [
    [/(^|\.)google\.[a-z.]+$/, 'Google'], [/(^|\.)bing\.com$/, 'Bing'], [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
    [/(^|\.)yahoo\.[a-z.]+$/, 'Yahoo'], [/(^|\.)ecosia\.org$/, 'Ecosia'], [/(^|\.)search\.brave\.com$/, 'Brave Search'],
    [/(^|\.)(chatgpt\.com|openai\.com)$/, 'ChatGPT'], [/(^|\.)perplexity\.ai$/, 'Perplexity'], [/(^|\.)claude\.ai$/, 'Claude'],
    [/(^|\.)(facebook\.com|fb\.com|m\.facebook\.com|l\.facebook\.com)$/, 'Facebook'], [/(^|\.)instagram\.com$/, 'Instagram'],
    [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'LinkedIn'], [/(^|\.)nextdoor\.co(m|\.uk)$/, 'Nextdoor'], [/(^|\.)(t\.co|x\.com|twitter\.com)$/, 'X'],
  ]
  const hit = known.find(([re]) => re.test(host))
  return hit ? `${hit[1]} (${host})` : host
}
