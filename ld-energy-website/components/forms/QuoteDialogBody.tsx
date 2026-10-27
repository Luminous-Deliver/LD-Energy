'use client'

import { BookingCard } from '@/components/forms/BookingCard'
import type { QuoteContext } from '@/lib/quote-context'
import '@/app/booking-v7.css'

/**
 * The quote dialog's form: the same booking card as the homepage and /quote, in the homepage's v7 look (.bk7),
 * started from the clicked link's selections. Loaded on first use, so pages that never open the dialog never pay
 * for the form. Ids carry a prefix so the homepage's own form and this copy never share one.
 */
export default function QuoteDialogBody({ context }: { context: QuoteContext }) {
  return (
    <div className="bk7">
      <BookingCard variant="dialog" context={context} idPrefix="qd-" sourcePage={context.sourcePage} areaPage={context.areaPage} />
    </div>
  )
}
