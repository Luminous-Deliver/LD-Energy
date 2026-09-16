'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { ExternalLink, Mail, MessageCircle, Phone, ReceiptText, ShieldCheck } from 'lucide-react'
import { GoogleRating } from '@/components/ui/GoogleRating'
import { site } from '@/lib/site'
import { areaLabel } from '@/lib/floor-area'
import { guideEstimate } from '@/lib/pricing-estimate'
import { serviceChoices } from '@/lib/booking-copy'
import { EXPRESS_SPEED } from '@/lib/booking-options'

/** The form's current selections. Controlled values only; no customer details. */
export interface QuoteSnapshot {
  service: string
  areaBand: string
  customerType: string
  speed: string
  improvementPlan: boolean
}

// Two contexts: the form only needs the stable setter, so publishing never re-renders it.
const PublishContext = createContext<((snapshot: QuoteSnapshot) => void) | null>(null)
const SnapshotContext = createContext<QuoteSnapshot | null>(null)

export function QuoteSummaryProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<QuoteSnapshot | null>(null)
  return (
    <PublishContext.Provider value={setSnapshot}>
      <SnapshotContext.Provider value={snapshot}>{children}</SnapshotContext.Provider>
    </PublishContext.Provider>
  )
}

/** Null outside a provider, e.g. the embedded form on area pages. */
export function usePublishQuote() {
  return useContext(PublishContext)
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-sm text-secondary-600">{label}</dt>
      <dd className={muted ? 'text-right text-sm text-secondary-500' : 'text-right text-sm font-semibold text-secondary-900'}>{value}</dd>
    </div>
  )
}

/**
 * Desktop companion to the quote form. It restates choices and the shared guide
 * estimate; it is not announced (the form owns the live region) and never submits.
 */
export function QuoteSummaryPanel() {
  const snapshot = useContext(SnapshotContext)
  const service = snapshot?.service || 'EPC Certificate'
  const estimate = guideEstimate({
    services: [service],
    areaBand: snapshot?.areaBand,
    speed: snapshot?.speed,
    improvementPlan: snapshot?.improvementPlan,
  })
  const notSelected = 'Not selected yet'
  const area = estimate.isBulk ? 'Not needed for a portfolio' : snapshot?.areaBand ? areaLabel(snapshot.areaBand) : notSelected
  const plan = estimate.planIncluded ? 'Included' : snapshot?.improvementPlan && estimate.canHavePlan ? `Added (+£${site.addOns.improvementPlan})` : 'Not added'
  const priced = estimate.state === 'priced' && estimate.total !== null
  const total = priced
    ? `£${estimate.total}`
    : estimate.isBulk ? 'Quoted individually' : estimate.state === 'awaiting-area' ? 'Choose a floor area' : 'After review'

  return (
    <aside aria-label="Your quote summary" className="overflow-hidden rounded-2xl border border-secondary-200 bg-white shadow-premium">
      <div className="border-b border-secondary-100 bg-[#F1F6F3] px-6 py-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#386B59]">
          <ReceiptText aria-hidden="true" className="h-4 w-4" />
          Your quote
        </p>
      </div>
      <div className="px-6 pb-6 pt-2">
        <dl className="divide-y divide-secondary-100">
          <Row label="Service" value={serviceChoices.find((choice) => choice.value === service)?.label || notSelected} />
          <Row label="Floor area" value={area} muted={area === notSelected} />
          <Row label="Booking as" value={snapshot?.customerType || notSelected} muted={!snapshot?.customerType} />
          {estimate.isLodged && <Row label="Lodgement" value={snapshot?.speed === EXPRESS_SPEED ? `Next-day (+£${estimate.express})` : 'Standard'} />}
          {estimate.canHavePlan && <Row label="Improvement Plan" value={plan} muted={plan === 'Not added'} />}
        </dl>
        <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-secondary-200 pt-4">
          <p className="text-base font-semibold text-secondary-900">Guide estimate</p>
          {/* Only a real figure gets the display size; waiting states stay readable text. */}
          <p className={priced ? 'text-right font-serif text-3xl font-semibold leading-none text-secondary-900 tabular-nums' : 'text-right text-sm font-semibold text-secondary-600'}>{total}</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-secondary-600">Not a final quote. Your exact price and appointment are confirmed before booking.</p>

        <div className="mt-5 border-t border-secondary-200 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-500">Prefer to talk?</p>
          <ul className="mt-3 space-y-2">
            <li>
              <a href={site.phoneHref} className="flex min-h-11 items-center gap-3 rounded-xl border border-secondary-200 px-3 py-2 text-sm font-semibold text-secondary-900 transition-colors hover:border-[#47846E] hover:bg-[#F1F6F3]">
                <Phone aria-hidden="true" className="h-4 w-4 text-[#386B59]" />
                Call {site.phone}
              </a>
            </li>
            <li>
              <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 rounded-xl border border-secondary-200 px-3 py-2 text-sm font-semibold text-secondary-900 transition-colors hover:border-[#47846E] hover:bg-[#F1F6F3]">
                <MessageCircle aria-hidden="true" className="h-4 w-4 text-[#386B59]" />
                WhatsApp, good for photos
              </a>
            </li>
            <li>
              <a href={site.emailHref} className="flex min-h-11 items-center gap-3 rounded-xl border border-secondary-200 px-3 py-2 text-sm font-semibold text-secondary-900 transition-colors hover:border-[#47846E] hover:bg-[#F1F6F3]">
                <Mail aria-hidden="true" className="h-4 w-4 text-[#386B59]" />
                <span className="min-w-0 [overflow-wrap:anywhere]">{site.email}</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-5 space-y-2 border-t border-secondary-200 pt-5 text-sm">
          <p className="flex items-center gap-2 text-secondary-700">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-[#386B59]" />
            Elmhurst accredited · {site.assessor.accreditationNumber}
            <a href={site.assessor.verifyUrl} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex min-h-8 items-center gap-1 font-semibold text-primary-800 underline underline-offset-4">
              Verify <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
          </p>
          <GoogleRating className="flex min-h-8 flex-wrap items-center gap-x-2 gap-y-1 text-secondary-700 hover:text-secondary-900" />
        </div>
      </div>
    </aside>
  )
}
