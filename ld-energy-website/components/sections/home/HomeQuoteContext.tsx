'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import type { AreaChoice } from '@/lib/floor-area'

/** The three services the homepage prices. Keys match `quoteServices`. */
export type HomeService = 'epc' | 'bundle' | 'floor-plan'
/** Why the visitor said they are here. Shapes the hint shown beside the calculator. */
export type HomeRoute = 'landlord' | 'agent' | 'seller' | 'home' | null

interface HomeQuoteState {
  step: 'route' | 'calc'
  route: HomeRoute
  service: HomeService
  area: AreaChoice | ''
  setService: (service: HomeService) => void
  setArea: (area: AreaChoice) => void
  /** Show the calculator with a service picked; keeps any size already chosen. */
  openCalculator: (service: HomeService, route?: HomeRoute, scroll?: boolean) => void
  backToRoutes: () => void
  cardRef: RefObject<HTMLDivElement | null>
  headingRef: RefObject<HTMLHeadingElement | null>
}

const Ctx = createContext<HomeQuoteState | null>(null)

/**
 * Homepage-only state shared by the hero quote card and the service cards, so a
 * "See my price" button on a service card drives the one calculator instead of
 * printing a second set of prices.
 */
export function HomeQuoteProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<'route' | 'calc'>('route')
  const [route, setRoute] = useState<HomeRoute>(null)
  const [service, setService] = useState<HomeService>('epc')
  const [area, setArea] = useState<AreaChoice | ''>('')
  const cardRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const focusHeading = useCallback(() => {
    // After React commits the new step, so the heading exists.
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }))
  }, [])

  const openCalculator = useCallback((next: HomeService, nextRoute: HomeRoute = null, scroll = false) => {
    setService(next)
    setRoute(nextRoute)
    setStep('calc')
    if (scroll && cardRef.current) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      cardRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
    focusHeading()
  }, [focusHeading])

  const backToRoutes = useCallback(() => {
    setStep('route')
    focusHeading()
  }, [focusHeading])

  const value = useMemo(
    () => ({ step, route, service, area, setService, setArea, openCalculator, backToRoutes, cardRef, headingRef }),
    [step, route, service, area, openCalculator, backToRoutes],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useHomeQuote() {
  const value = useContext(Ctx)
  if (!value) throw new Error('useHomeQuote must be used inside HomeQuoteProvider')
  return value
}
