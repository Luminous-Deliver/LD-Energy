'use client'

import type { RefObject } from 'react'
import { Star } from 'lucide-react'
import { site } from '@/lib/site'
import { ContactForm, type FormVariant } from '@/components/forms/ContactForm'
import type { SourcePage } from '@/lib/enquiry-attribution'

/**
 * The one booking form in its card: the assessor strip on top, the form below. The same card
 * sits in the homepage hero, on /contact and on every area page, so a visitor sees one form
 * wherever they start.
 */
export function BookingCard({ variant, cardRef, sourcePage, areaPage }: {
  variant: FormVariant; cardRef?: RefObject<HTMLDivElement | null>; sourcePage?: SourcePage; areaPage?: string
}) {
  return (
    <div ref={cardRef} className="qc scroll-mt-28" data-variant={variant}>
      <div className="qc__bar">
        <span className="qc__title">Get your exact quote</span>
        <span className="qc__who">
          <span>Your assessor <b>{site.assessor.name}</b></span>
          <span className="tabular-nums">{site.assessor.accreditationNumber}</span>
          <a href={site.reviews.profileUrl} target="_blank" rel="noopener noreferrer" className="qc__stars">
            <Star aria-hidden="true" className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {site.reviews.ratingValue.toFixed(1)} on Google
          </a>
          <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer" className="qc__verify">Verify on GOV.UK</a>
        </span>
      </div>
      <ContactForm variant={variant} sourcePage={sourcePage} areaPage={areaPage} />
    </div>
  )
}
