'use client'

import type { ReactNode } from 'react'
import { useHomeQuote, type HomeService } from './HomeQuoteContext'

/** "See my … price": picks the service in the one booking form below and brings it into view, focused on its heading. */
export function PickService({ service, className, children }: { service: HomeService; className: string; children: ReactNode }) {
  const { openCalculator } = useHomeQuote()
  return <button type="button" data-pick={service} className={className} onClick={() => openCalculator(service, true)}>{children}</button>
}
