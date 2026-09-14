'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { analyticsAllowed } from '@/lib/analytics-preference'

export function WebAnalytics({ token }: { token?: string }) {
  const pathname = usePathname()

  useEffect(() => {
    const existing = document.querySelector('script[src^="https://static.cloudflareinsights.com/beacon.min.js"]')
    if (pathname === '/privacy-policy') {
      // Privacy links use a full navigation. Also cover a client-side navigation:
      // removing an executed script does not remove its beacon listeners.
      if (existing) window.location.reload()
      return
    }
    if (!token || !/^[a-f0-9]{32}$/i.test(token) || existing || !analyticsAllowed()) return
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
    script.dataset.cfBeacon = JSON.stringify({ token })
    document.head.appendChild(script)
    // Root layout persists during SPA navigation; load the vendor once.
    // No form values, enquiry IDs or custom events are passed to analytics.
  }, [pathname, token])

  return null
}
