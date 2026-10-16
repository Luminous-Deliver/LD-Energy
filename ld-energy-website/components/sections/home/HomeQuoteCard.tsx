'use client'

import { BookingCard } from '@/components/forms/BookingCard'
import { useHomeQuote } from './HomeQuoteContext'

/**
 * The hero window is the booking form itself (Abdul, 16/10/2026): the visitor picks who,
 * what and how big, sees the guide price, and carries on in place. No page change.
 */
export function HomeQuoteCard() {
  const { cardRef } = useHomeQuote()
  return <BookingCard variant="hero" cardRef={cardRef} sourcePage="home" />
}
