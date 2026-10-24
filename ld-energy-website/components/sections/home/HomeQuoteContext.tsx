'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'

/** The services the homepage's cards and Pre-Assessment strip can pick. Keys match `quoteServices`. */
export type HomeService = 'epc' | 'bundle' | 'floor-plan' | 'pre-assessment'

interface HomeQuoteState {
  /** The latest "See my price" pick from further down the page; `n` changes on every click. */
  request: { service: HomeService; n: number } | null
  /** Pick a service in the hero booking form and bring the card into view. */
  openCalculator: (service: HomeService, scroll?: boolean) => void
  cardRef: RefObject<HTMLDivElement | null>
}

const Ctx = createContext<HomeQuoteState | null>(null)

/**
 * Homepage-only bridge between the service cards and the hero booking form, so a
 * "See my price" button drives the one form instead of printing a second set of prices.
 */
export function HomeQuoteProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<HomeQuoteState['request']>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const openCalculator = useCallback((service: HomeService, scroll = false) => {
    setRequest(previous => ({ service, n: (previous?.n ?? 0) + 1 }))
    if (scroll && cardRef.current) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      // desktop: to the Prices section's head, so its title, rating and accreditation line arrive with the form (prototype
      // v7.2); phones: to the form, whose head is a screen below the section's
      const wide = window.matchMedia('(min-width: 760px)').matches
      const target = (wide && cardRef.current.closest('section')) || cardRef.current
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
  }, [])

  const value = useMemo(() => ({ request, openCalculator, cardRef }), [request, openCalculator])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useHomeQuote() {
  const value = useContext(Ctx)
  if (!value) throw new Error('useHomeQuote must be used inside HomeQuoteProvider')
  return value
}

/** The same state, or null on pages without the homepage hero. */
export function useOptionalHomeQuote() {
  return useContext(Ctx)
}
