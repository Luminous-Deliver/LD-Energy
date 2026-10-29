'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { rememberLanding } from '@/lib/landing'

/* A link to another page's section (/preparing-for-your-epc#rdsap-10) used to land at the top: app/loading.tsx is
 * on screen while the page loads, so Next looks for the #id before it exists. After each route change, wait for the
 * element and go to it once, the way a full page load does. Abdul 24/10: "these links stopped working". */
export function HashScroll() {
  const pathname = usePathname()
  // the first page of the visit, for the enquiry email's "came from" (lib/landing.ts); later calls keep the first
  useEffect(() => { rememberLanding() }, [])
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    let tries = 0
    let raf = 0
    const go = () => {
      const el = document.getElementById(id)
      if (el) { el.scrollIntoView({ block: 'start', behavior: 'instant' }); return }
      if (++tries < 60) raf = requestAnimationFrame(go)
    }
    raf = requestAnimationFrame(go)
    return () => cancelAnimationFrame(raf)
  }, [pathname])
  return null
}
