'use client'

import { useEffect, useState } from 'react'
import { site } from '@/lib/site'
import type { DeliveryState } from '@/lib/email-delivery'

const EVERY_MS = 5000
// 2 minutes: a missing mailbox bounces within seconds, and the recorded bounce can take up to a minute to reach
// every Cloudflare location (KV)
const TRIES = 24

/**
 * The thank-you screen's line about the emailed copy (Abdul 29/10/2026). It watches for about two minutes: a
 * bounce means the address is wrong, so the customer is told now, while they are still here, and given the phone.
 * Abdul gets the same bounce by email from the Resend webhook.
 */
export function CopyDelivery({ email, confirmationId }: { email: string; confirmationId?: string }) {
  const [state, setState] = useState<DeliveryState>('pending')
  useEffect(() => {
    if (!confirmationId) return
    let tries = 0, stopped = false
    let timer: number | undefined
    const ask = async () => {
      tries++
      try {
        const res = await fetch(`/api/contact/delivery?id=${encodeURIComponent(confirmationId)}`, { cache: 'no-store' })
        const body: { state?: DeliveryState } = res.ok ? await res.json() : {}
        if (stopped) return
        if (body.state === 'bounced' || body.state === 'delivered') { setState(body.state); return }
        if (!res.ok && res.status !== 502 && res.status !== 503) return // an unknown id never changes
      } catch { /* offline for a moment: try again */ }
      if (!stopped && tries < TRIES) timer = window.setTimeout(ask, EVERY_MS)
    }
    timer = window.setTimeout(ask, 3000)
    return () => { stopped = true; window.clearTimeout(timer) }
  }, [confirmationId])

  if (state === 'bounced') return (
    <div className="bf__sent-bounce" role="alert">
      <p><strong>We couldn’t deliver your copy to {email}.</strong> There may be a typo in the address, so our reply won’t reach you by email.</p>
      <p>Please call or WhatsApp us on <a href={site.phoneHref}>{site.phone}</a> and we’ll take it from there. <a href={site.whatsappHref}>WhatsApp us</a></p>
    </div>
  )
  return (
    <p className="bf__sent-copy">
      We’ve emailed a copy to <strong>{email}</strong>. Abdul’s reply with your price comes by email too, so if you can’t see either, check your junk or spam folder.
    </p>
  )
}
