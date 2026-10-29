/**
 * Postcode check for the business email (Abdul 29/10/2026): borough, ward, inside or outside London, and the straight-
 * line distance from the base, from postcodes.io (open data, no key: https://github.com/ideal-postcodes/postcodes.io).
 *
 * It only informs Abdul. A slow or failed lookup never blocks or delays a booking past the timeout: the email then says
 * the check was unavailable. The form has already validated the postcode's shape.
 */
import { site } from '@/lib/site'

export type PostcodeCheck =
  | { status: 'ok'; postcode: string; borough: string; ward?: string; inLondon: boolean; region?: string; km: number }
  | { status: 'not-found' }
  | { status: 'unavailable' }

interface PostcodesIoResult {
  postcode: string
  region: string | null
  country: string | null
  admin_district: string | null
  admin_ward: string | null
  latitude: number | null
  longitude: number | null
}

/** Great-circle distance in km, one decimal. Straight line, not travel time. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)) * 10) / 10
}

export async function checkPostcode(postcode: string, fetcher: typeof fetch = fetch, timeoutMs = 2500): Promise<PostcodeCheck> {
  const compact = postcode.replace(/\s+/g, '').toUpperCase()
  if (!/^[A-Z0-9]{5,7}$/.test(compact)) return { status: 'not-found' }
  try {
    const res = await fetcher(`https://api.postcodes.io/postcodes/${compact}`, { signal: AbortSignal.timeout(timeoutMs) })
    if (res.status === 404) return { status: 'not-found' }
    if (!res.ok) return { status: 'unavailable' }
    const r = ((await res.json()) as { result?: PostcodesIoResult }).result
    if (!r || r.latitude === null || r.longitude === null) return { status: 'not-found' }
    return {
      status: 'ok',
      postcode: r.postcode,
      borough: r.admin_district ?? 'Unknown',
      ward: r.admin_ward ?? undefined,
      region: r.region ?? r.country ?? undefined,
      inLondon: r.region === 'London',
      km: distanceKm(site.geo, { lat: r.latitude, lng: r.longitude }),
    }
  } catch {
    return { status: 'unavailable' }
  }
}

/** One line for the email: "Newham, Stratford and New Town ward · inside London · 1.2 km (0.7 miles) from Stratford". */
export function postcodeCheckLine(c: PostcodeCheck): string {
  if (c.status === 'not-found') return 'Not found on postcodes.io: check the postcode with the customer'
  if (c.status === 'unavailable') return 'Lookup unavailable just now (postcodes.io): check it yourself'
  const miles = Math.round(c.km * 0.621371 * 10) / 10
  const where = c.inLondon ? 'inside London' : `OUTSIDE London (${c.region ?? 'unknown region'})`
  return `${c.borough}${c.ward ? `, ${c.ward} ward` : ''} · ${where} · ${c.km} km (${miles} miles) from Stratford, straight line`
}
