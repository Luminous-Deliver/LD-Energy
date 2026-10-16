import { Section } from '@/components/ui/Section'
import { BookingCard } from '@/components/forms/BookingCard'
import type { SourcePage } from '@/lib/enquiry-attribution'

/**
 * Embedded booking section on area pages: the intro, then the same booking card as the
 * homepage hero and /contact. The card carries its own live price.
 */
export function ContactSection({ areaPage, sourcePage }: { areaPage?: string; sourcePage?: SourcePage }) {
  return (
    <Section variant="muted" tier="primary" id="contact" className="scroll-mt-20 md:scroll-mt-24">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest font-semibold text-secondary-600">
          <span className="block h-px w-8 bg-secondary-300" aria-hidden="true" />
          Request a quote
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-secondary-900">
          Get my exact quote
        </h2>
        <p className="mt-2 text-secondary-700 leading-relaxed">
          Tell us about your property and we’ll confirm an exact price and a time slot. Replies come
          from the assessor directly, during our opening hours. Prefer to talk? Call, WhatsApp or
          email us instead.
        </p>
      </div>
      <div className="mt-7">
        <BookingCard variant="area" areaPage={areaPage} sourcePage={sourcePage} />
      </div>
    </Section>
  )
}
