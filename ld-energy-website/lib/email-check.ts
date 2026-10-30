/**
 * Two checks on the customer's email address (Abdul 29/10/2026: a quote sent to a mistyped address is a lost lead).
 *
 * 1. emailTypoSuggestion: the form offers "Did you mean …@gmail.com?" for the common slips. A suggestion only: an
 *    unusual address that is really theirs still sends.
 * 2. emailDomainCanReceive: the server asks DNS whether the domain can take mail at all. Only a definite "no" refuses
 *    the form (the domain does not exist, has no mail or web host record, or publishes a null MX). A slow or failed
 *    lookup lets the request through: the check must never cost a real lead.
 */

const COMMON_DOMAINS = [
  'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com', 'live.co.uk', 'msn.com',
  'yahoo.com', 'yahoo.co.uk', 'icloud.com', 'me.com', 'aol.com', 'btinternet.com', 'sky.com', 'virginmedia.com',
  'protonmail.com', 'proton.me', 'talktalk.net',
]

/** Real providers one letter from a common one: never "corrected" (mail.com is not a slip for gmail.com). */
const REAL_NEIGHBOURS = ['mail.com', 'gmx.com', 'gmx.co.uk', 'ymail.com', 'email.com', 'aol.co.uk', 'live.ie', 'outlook.ie', 'hotmail.fr', 'yahoo.fr', 'mac.com']

/** Slips too far apart for the edit distance below, or ones that are real but unwanted (gmail.co.uk is not Gmail). */
const KNOWN_SLIPS: Record<string, string> = {
  'gmail.co.uk': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.om': 'gmail.com',
  'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmaill.com': 'gmail.com',
  'hotmail.co': 'hotmail.co.uk', 'hotmail.con': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotmial.com': 'hotmail.com',
  'outlook.co': 'outlook.com', 'outlook.con': 'outlook.com', 'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com',
  'yahoo.co': 'yahoo.co.uk', 'yahoo.con': 'yahoo.com', 'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com',
  'icloud.co': 'icloud.com', 'icloud.con': 'icloud.com', 'iclod.com': 'icloud.com', 'btinternet.co.uk': 'btinternet.com',
}

/** Optimal string alignment distance: a swapped pair of letters ("gmial") counts as one slip. */
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  }
  return d[a.length][b.length]
}

/** "fazmin@gmial.com" → "fazmin@gmail.com"; null when the domain looks right or is nothing like a common one. */
export function emailTypoSuggestion(email: string): string | null {
  const at = email.trim().lastIndexOf('@')
  if (at < 1) return null
  const local = email.trim().slice(0, at)
  const domain = email.trim().slice(at + 1).toLowerCase()
  if (!domain.includes('.') || COMMON_DOMAINS.includes(domain) || REAL_NEIGHBOURS.includes(domain)) return null
  if (KNOWN_SLIPS[domain]) return `${local}@${KNOWN_SLIPS[domain]}`
  // one slip on a short domain, two on a longer one; never a guess at a domain that is already a near tie
  const ranked = COMMON_DOMAINS.map((d) => [d, distance(domain, d)] as const).sort((x, y) => x[1] - y[1])
  const [best, score] = ranked[0]
  const limit = best.length > 9 ? 2 : 1
  if (score === 0 || score > limit || ranked[1][1] === score) return null
  return `${local}@${best}`
}

type DnsAnswer = { Status?: number; Answer?: Array<{ type: number; data: string }> }

async function lookup(name: string, type: 'MX' | 'A' | 'AAAA', signal: AbortSignal): Promise<DnsAnswer> {
  const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
    headers: { accept: 'application/dns-json' }, signal,
  })
  if (!res.ok) throw new Error(`DNS ${res.status}`)
  return (await res.json()) as DnsAnswer
}

/** false only when DNS says plainly that this domain cannot receive email; true otherwise, including on any failure. */
export async function emailDomainCanReceive(email: string, timeoutMs = 2500): Promise<boolean> {
  const domain = email.trim().slice(email.trim().lastIndexOf('@') + 1).toLowerCase()
  if (!domain) return true
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const mx = await lookup(domain, 'MX', controller.signal)
    if (mx.Status === 3) return false // NXDOMAIN: the domain does not exist
    if (mx.Status !== 0) return true // SERVFAIL and the like say nothing about the address
    const records = (mx.Answer ?? []).filter((r) => r.type === 15)
    // RFC 7505 null MX ("0 ."): the domain states it takes no mail
    if (records.length) return !records.every((r) => /^\s*\d+\s+\.?\s*$/.test(r.data))
    // no MX: mail falls back to the domain's own address (RFC 5321 s5.1)
    const [a, aaaa] = await Promise.all([lookup(domain, 'A', controller.signal), lookup(domain, 'AAAA', controller.signal)])
    if (a.Status !== 0 || aaaa.Status !== 0) return a.Status === 3 ? false : true
    return [...(a.Answer ?? []), ...(aaaa.Answer ?? [])].some((r) => r.type === 1 || r.type === 28)
  } catch {
    return true
  } finally {
    clearTimeout(timer)
  }
}

export const EMAIL_UNREACHABLE_MESSAGE = 'This email address can’t receive emails. Please check it for a typo.'

/** The endings offered as soon as "@" is typed: the UK's most used providers, in rough order of use. */
const QUICK_DOMAINS = ['gmail.com', 'hotmail.co.uk', 'outlook.com', 'icloud.com', 'yahoo.co.uk', 'hotmail.com', 'live.co.uk', 'btinternet.com']

/** "fazmin@" → five full addresses; "fazmin@ho" → the hotmail ones. Empty once a dot is typed or nothing matches. */
export function emailDomainCompletions(email: string, max = 5): string[] {
  const value = email.trim()
  const at = value.indexOf('@')
  if (at < 1 || value.indexOf('@', at + 1) !== -1) return []
  const local = value.slice(0, at)
  const partial = value.slice(at + 1).toLowerCase()
  if (partial.includes('.')) return []
  return QUICK_DOMAINS.filter((d) => d.startsWith(partial)).slice(0, max).map((d) => `${local}@${d}`)
}
