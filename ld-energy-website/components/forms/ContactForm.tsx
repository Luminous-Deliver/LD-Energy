'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { landingContext } from '@/lib/landing'
import { usePathname } from 'next/navigation'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, HelpCircle, KeyRound, Mail, MessageCircle, Phone, ShieldAlert, WifiOff } from 'lucide-react'
import { Field, Input, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { pricing, site, maxBundleSaving, formatPrice, SAME_DAY_LODGEMENT_SURCHARGE, NEXT_DAY_VISIT_SURCHARGE, promise } from '@/lib/site'
import { areaBands, areaLabel, bandForArea, parseExactArea, TOP_BAND } from '@/lib/floor-area'
import { RollingPrice } from './RollingPrice'
import { guideEstimate, guideEstimateRows, guidePrice, PLAN_LABEL, ENERGY_REPORT_LABEL } from '@/lib/pricing-estimate'
import {
  turnaroundCopy, includedList, contactStepIntro, serviceChoices, serviceLabel, customerTypeChoices, nextSteps,
  formatPreferredDate, enquirySummaryText, dwellingChoices, whatYouGet, deliveredList, whatsappFormText, visitDateNote,
  type BadgeTone,
} from '@/lib/booking-copy'
import { londonYmd } from '@/lib/booking-options'
import { whatsappQuoteText } from '@/lib/area-page'
import { Ico } from '@/components/sections/home/HomeIcon'
import { parseQuoteContext, quoteContextFromForm, quoteHref, quoteServices, QUOTE_PATH, type QuoteContext } from '@/lib/quote-context'
import { conversionEvent } from '@/lib/conversion-events'
import { customerTypeForSource, sourcePageForPath, ctaIds, type SourcePage, type CtaId } from '@/lib/enquiry-attribution'
import { restoredCustomerType, rememberCustomerType } from '@/lib/customer-type-history'
import { useTurnstile } from '@/lib/useTurnstile'
import { usePublishQuote } from '@/components/forms/QuoteSummary'
import { useOptionalHomeQuote } from '@/components/sections/home/HomeQuoteContext'
import { contactSchema, BULK, PRE_ASSESSMENT, SAME_DAY_LODGEMENT_SPEED, NEXT_DAY_VISIT_SPEED, type ContactInput } from '@/lib/validators'
import { FORM_DRAFT } from '@/lib/form-layout'
import './booking-v7.css'

/**
 * Which fields each step validates before moving on: the taps and price, then timing and
 * access. The final step (details) is validated by the whole schema on submit.
 */
const QUOTE_FIELDS: (keyof ContactInput)[] = ['customerType', 'services', 'dwellingType', 'areaBand', 'floorArea', 'floorAreaUnknown', 'improvementPlan', 'energyReport']
const TITLES = ['Your guide price', 'Timing and access', 'Your details']
const GATES: (keyof ContactInput)[][] = [QUOTE_FIELDS, ['speed', 'preferredDate', 'notes']]
const LAST = TITLES.length

/**
 * Phones: system C, "Answers fold away" (Abdul 23/10/2026: "C is perfect for mobile"). The same form and the same
 * react-hook-form state, drawn as a numbered rail: one question open at a time, each answer folding into one line with
 * its own Change. The three desktop steps still run underneath (Turnstile, submit, step events), so `step` follows
 * whichever rail question is open. Desktop is unchanged.
 */
type RailId = 'who' | 'service' | 'dwelling' | 'size' | 'price' | 'timing' | 'details'
const RAIL_LABELS: Record<RailId, string> = {
  who: 'You', service: 'Service', dwelling: 'Property type', size: 'Size', price: 'Guide price', timing: 'Timing and access', details: 'Your details',
}
// the accessible name of each Change button; "Change you" would read badly
const RAIL_CHANGE: Record<RailId, string> = {
  who: 'Change which best describes you', service: 'Change service', dwelling: 'Change property type', size: 'Change size',
  price: 'Change guide price options', timing: 'Change timing and access', details: 'Change your details',
}
const RAIL_STEP: Record<RailId, number> = { who: 1, service: 1, dwelling: 1, size: 1, price: 1, timing: 2, details: LAST }
const RAIL_GATES: Record<RailId, (keyof ContactInput)[]> = {
  who: ['customerType'], service: ['services'], dwelling: ['dwellingType'], size: ['areaBand', 'floorArea'], price: GATES[0], timing: GATES[1], details: [],
}
const FIELD_RAIL: Partial<Record<keyof ContactInput, RailId>> = {
  customerType: 'who', services: 'service', dwellingType: 'dwelling', areaBand: 'size', floorArea: 'size', floorAreaUnknown: 'size',
  improvementPlan: 'price', energyReport: 'price', speed: 'timing', preferredDate: 'timing', notes: 'timing',
}
/** A portfolio skips the size and the timing, as the desktop form skips step 2. */
function railOrder(bulk: boolean): RailId[] {
  return bulk ? ['who', 'service', 'price', 'details'] : ['who', 'service', 'dwelling', 'size', 'price', 'timing', 'details']
}
/** The next question that still needs an answer: after `from` first, then from the top, else the details. */
function railNext(list: RailId[], seen: ReadonlySet<RailId>, from: RailId | null, answers: { dwellingType?: string; areaBand?: string }): RailId {
  const needs = (id: RailId) => !seen.has(id) || (id === 'dwelling' && !answers.dwellingType) || (id === 'size' && !answers.areaBand)
  return list.slice(from ? list.indexOf(from) + 1 : 0).find(needs) || list.find(needs) || 'details'
}
const PHONE_QUERY = '(max-width: 759px)'
function subscribePhone(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
/** The phone layout follows the CSS breakpoint. The server renders desktop; booking-v7.css hides that until hydration. */
function usePhone() {
  return useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE_QUERY).matches, () => false)
}

const controlClass = 'inline-flex min-h-[48px] items-center justify-center rounded-lg px-4 py-3 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:opacity-60'
const badgeClass: Record<BadgeTone, string> = { green: 'bg-accent-600', navy: 'bg-primary-700' }
// the design system's drawn icons, as the v7 prototype (house, key, document, flat)
const customerIcons: Record<string, string> = {
  'Homeowner': 'house', 'Landlord (tenanted)': 'key', 'Estate agent': 'document', 'Letting agent / firm': 'flat',
}

/** WhatsApp from the form: the approved prefill, then the choices made so far (v7, approved 22/10/2026). */
function formWhatsappHref(values: Pick<ContactInput, 'services' | 'dwellingType' | 'areaBand' | 'floorArea'>, guide?: string): string {
  const text = whatsappFormText(whatsappQuoteText(values.services[0]), {
    services: values.services, dwellingType: values.dwellingType || '',
    areaLabel: values.areaBand ? areaLabel(values.areaBand, values.floorArea) : '', guide,
  })
  return `${site.whatsappHref}?text=${encodeURIComponent(text)}`
}

/** Numbered questions on step 1 (v7, from the Stitch mock-up): a serif numeral beside each legend. */
function Qn({ n }: { n: number }) {
  return <span className="bf__qn" aria-hidden="true">{n}</span>
}
const serviceTabLabels: Record<string, string> = {
  'EPC Certificate': 'Domestic EPC', 'Both (Bundle)': 'EPC + Floor Plan', 'Floor Plan': 'Floor Plan',
  [PRE_ASSESSMENT]: 'Pre-Assessment', [BULK]: 'Several properties',
}

interface ChoiceOption {
  value: string; label: string; description?: string; badge?: string; badgeTone?: BadgeTone; fullRow?: boolean
}

interface ChoiceProps {
  name: string; legend: string; value: string; onChange: (value: string) => void
  options: ChoiceOption[]
  error?: string; hint?: string; inputRef?: (element: HTMLInputElement | null) => void
  /** Prefix for element ids, so a second copy of the form on the page (the quote dialog) never repeats an id. */
  idPrefix?: string
}

/**
 * Native radio group drawn as cards. The radio covers its card invisibly, so keyboard,
 * screen-reader and click behaviour stay native while the dot itself is not drawn.
 */
function Choices({ name, legend, value, onChange, options, error, hint, inputRef, idPrefix = '' }: ChoiceProps) {
  const base = idPrefix + name
  const hintId = hint ? `${base}-hint` : ''
  const errorId = error ? `${base}-error` : ''
  return (
    <fieldset className="min-w-0" aria-invalid={!!error} aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}>
      <legend className="bf__legend">{legend}</legend>
      {hint && <p id={hintId} className="bf__sub">{hint}</p>}
      <div className="bf__choices bf__choices--ruled mt-2.5 grid gap-2.5 sm:grid-cols-2">
        {options.map((option, index) => {
          const selected = value === option.value
          return (
            <label key={option.value} className={cn('bf-tile bf-tile--row', option.fullRow && 'col-span-full')} data-checked={selected || undefined}>
              <input type="radio" name={name} value={option.value} checked={selected}
                id={`${base}-${index}`} ref={index === 0 ? inputRef : undefined}
                onChange={() => onChange(option.value)} required
                aria-label={option.label} aria-describedby={[hintId, option.description ? `${base}-description-${index}` : '', errorId].filter(Boolean).join(' ') || undefined}
                className="bf-radio" />
              {selected && <Check aria-hidden="true" strokeWidth={3} className="bf-tile__check" />}
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 pr-4 text-[15px] font-semibold leading-snug text-secondary-900">
                {option.label}
                {option.badge && <span className={cn('rounded px-1.5 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-white', badgeClass[option.badgeTone || 'green'])}>{option.badge}</span>}
              </span>
              {option.description && <span id={`${base}-description-${index}`} className="mt-0.5 block text-sm leading-snug text-secondary-600">{option.description}</span>}
            </label>
          )
        })}
      </div>
      {error && <p id={errorId} className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
    </fieldset>
  )
}

type SendProblem = { kind: 'security' } | { kind: 'offline' } | { kind: 'unavailable'; retryable: boolean }

/** Says what actually went wrong, keeps the details, and never suggests a retry that cannot work. */
function SendProblemNotice({ problem, summary }: { problem: SendProblem; summary: string }) {
  if (problem.kind !== 'unavailable') {
    const Icon = problem.kind === 'security' ? ShieldAlert : WifiOff
    return (
      <div role="alert" className="flex items-start gap-3 rounded-lg border border-warm-400 bg-warm-50 p-3 text-base text-secondary-900">
        <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-warm-700" />
        <p>{problem.kind === 'security'
          ? 'The security check expired. Tick it again, then send. Your details are still here.'
          : 'You seem to be offline. Check your connection, then send again. Your details are still here.'}</p>
      </div>
    )
  }
  const whatsapp = `${site.whatsappHref}?text=${encodeURIComponent(summary)}`
  const email = `${site.emailHref}?subject=${encodeURIComponent('Quote request')}&body=${encodeURIComponent(summary)}`
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4">
      <p className="font-semibold text-red-800">We couldn’t send this online.</p>
      <p className="mt-1 text-base text-secondary-800">
        Your details are still here. Send them another way in one tap{problem.retryable ? ', or try again in a minute' : ''}.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`${controlClass} gap-2 bg-accent-600 text-white hover:bg-accent-700`}>
          <MessageCircle aria-hidden="true" className="h-5 w-5" />Send on WhatsApp
        </a>
        <a href={email} className={`${controlClass} gap-2 border border-secondary-300 bg-white text-secondary-900`}>
          <Mail aria-hidden="true" className="h-5 w-5" />Email it
        </a>
        <a href={site.phoneHref} className={`${controlClass} gap-2 border border-secondary-300 bg-white text-secondary-900`}>
          <Phone aria-hidden="true" className="h-5 w-5" />Call {site.phone}
        </a>
      </div>
    </div>
  )
}

function RequestSent({ data, confirmationSent, focusRef, onReset, idPrefix = '' }: {
  data: ContactInput; confirmationSent: boolean; focusRef: RefObject<HTMLDivElement | null>; onReset: () => void; idPrefix?: string
}) {
  const estimate = guideEstimate(data)
  const kind = estimate.productKind
  const firstName = data.name.trim().split(/\s+/)[0]
  const guide = estimate.state === 'priced' && estimate.total !== null ? guidePrice(estimate, estimate.total) : undefined
  // what the chosen service delivers (v7, approved 22/10/2026): the card's own list, as the confirmation email
  const delivered = deliveredList(kind, { improvementPlan: estimate.improvementPlan > 0, energyReport: estimate.energyReport })
  const rows: [string, string][] = [
    ['Service', data.services.map(serviceLabel).join(' + ')],
    ...(estimate.isBulk ? [['Properties', data.propertyCount || 'To be confirmed'] as [string, string]]
      : [['Property type', data.dwellingType || 'Not selected'] as [string, string], ['Floor area', areaLabel(data.areaBand, data.floorArea)] as [string, string]]),
    ...(estimate.isLodged && data.speed === SAME_DAY_LODGEMENT_SPEED ? [['Turnaround', 'Same-day lodgement'] as [string, string]] : []),
    ...(estimate.isLodged && data.speed === NEXT_DAY_VISIT_SPEED ? [['Turnaround', 'Next-day visit and lodgement'] as [string, string]] : []),
    ...(estimate.improvementPlan ? [[PLAN_LABEL, `+£${estimate.improvementPlan}`] as [string, string]] : []),
    ...(estimate.energyReport ? [[ENERGY_REPORT_LABEL, 'Included at no extra charge'] as [string, string]] : []),
    ['Guide estimate', guide ?? (estimate.isBulk ? 'Quoted individually' : 'Price to be confirmed')],
    ...(data.preferredDate && !estimate.isBulk ? [['Preferred date', formatPreferredDate(data.preferredDate)] as [string, string]] : []),
  ]
  return (
    <div ref={focusRef} tabIndex={-1} aria-labelledby={`${idPrefix}request-sent-heading`} className="bf__sent">
      {FORM_DRAFT && <p className="bf__draft">Draft preview: nothing was sent. On the live site this is where the customer lands.</p>}
      <h2 id={`${idPrefix}request-sent-heading`} className="bf__sent-h">Request sent. Thanks, {firstName}.</h2>
      {confirmationSent && <p className="bf__sent-copy">We’ve emailed a copy to <strong>{data.email}</strong>.</p>}

      <div>
        <p className="bf__est-label">What happens next</p>
        <ol className="bf__sent-next">
          {nextSteps(kind, data.speed, estimate.energyReport).map((step) => <li key={step}>{step}</li>)}
        </ol>
      </div>

      {delivered.length > 0 && (
        <div>
          <p className="bf__est-label">What you receive</p>
          <ul className="bf__ticks">{delivered.map((item) => <li key={item}><Check aria-hidden="true" className="h-4 w-4 shrink-0" />{item}</li>)}</ul>
        </div>
      )}

      <dl className="bf__rows">
        {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>

      <p className="bf__sent-call">Need it sooner? <a href={formWhatsappHref(data, guide)} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a></p>
      <p><button type="button" className="bf__again" onClick={onReset}>Send another request</button></p>
    </div>
  )
}

/** Focus with an offset measured from the actual floating header, including when enlarged. */
function focusBookingElement(element: HTMLElement | null) {
  if (!element) return
  // inside the quote dialog the page header is not over the form; the dialog's own bar is
  const dialog = element.closest('dialog')
  const header = dialog ? dialog.querySelector('[data-dialog-bar]') : document.querySelector('header')
  const offset = (header?.getBoundingClientRect().height || (dialog ? 0 : 80)) + 16
  element.style.scrollMarginTop = `${offset}px`
  element.focus({ preventScroll: true })
  element.scrollIntoView({ block: 'start', behavior: 'instant' })
}

/** The floor-area field above can close as a row is picked (320 px phones), pushing the picked row off screen. */
function keepRowInView(input: HTMLInputElement) {
  requestAnimationFrame(() => input.closest('label')?.scrollIntoView({ block: 'nearest' }))
}

export type FormVariant = 'hero' | 'page' | 'area' | 'dialog'

export function ContactForm({ areaPage, sourcePage, variant = 'page', context, idPrefix = '' }: {
  areaPage?: string; sourcePage?: SourcePage; variant?: FormVariant
  /** Selections to start from: the quote dialog passes the clicked link's; /quote reads its own URL. */
  context?: QuoteContext
  /** Prefix for every element id, so the dialog's copy never repeats the homepage form's ids. */
  idPrefix?: string
}) {
  const pathname = usePathname()
  // /quote is the form's own page: it reads its URL and keeps the URL in step with the choices
  const dedicated = pathname === QUOTE_PATH && variant === 'page'
  const fid = (id: string) => idPrefix + id
  const home = useOptionalHomeQuote()
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [problem, setProblem] = useState<SendProblem | null>(null)
  const [sent, setSent] = useState<{ data: ContactInput; confirmationSent: boolean } | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  // The shared floor-area field. "Over 115 m²" opens it; any other band opens it on request. Once
  // the customer types, it stays open even when their figure moves them to a smaller band.
  const [areaOpen, setAreaOpen] = useState(false)
  // desktop: the band the exact-size field sits under; set by a hand pick (or frozen when typing starts), never by the
  // band a typed figure selects, or the field would move rows mid-word and drop focus (24/10: "100" became "1")
  const [areaHost, setAreaHost] = useState<string | null>(null)
  // phones (C): the open question, the answered ones, and a tick that asks for the open one to be scrolled to and focused
  const phone = usePhone()
  const [railOpen, setRailOpen] = useState<RailId>('who')
  const [railSeen, setRailSeen] = useState<ReadonlySet<RailId>>(() => new Set())
  const [railTick, setRailTick] = useState(0)
  const [railMode, setRailMode] = useState(false)
  const [railPick, setRailPick] = useState<object | null>(null)
  const [railPicked, setRailPicked] = useState<object | null>(null)
  // a tap folds the question and opens the next; a key press never does (arrow keys only move the choice, Enter moves on)
  const tapped = useRef(false)
  const railTimer = useRef<number | undefined>(undefined)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errSumRef = useRef<HTMLDivElement>(null)
  // a refused send focuses the error summary, which lists and links every problem (prototype v7.2); after the commit
  // that draws it, since the validation is async and the summary is not in the page until then
  const [refusals, setRefusals] = useState(0)
  useEffect(() => { if (refusals) focusBookingElement(errSumRef.current) }, [refusals])
  const successRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const started = useRef(false)
  const submitting = useRef(false)
  const moveFocus = useRef(false)
  const initialised = useRef(false)
  const serviceTouched = useRef(false)
  const quietReset = useRef(false)
  const defaultCta: CtaId = variant === 'hero' ? 'hero-form' : dedicated ? 'direct' : 'embedded'
  const { register, handleSubmit, control, reset, watch, getValues, setValue, trigger, clearErrors, getFieldState, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    shouldFocusError: false,
    defaultValues: {
      name: '', phone: '', email: '', address: '', postcode: '', services: ['EPC Certificate'], dwellingType: '',
      areaBand: '', floorArea: '', floorAreaUnknown: false, customerType: '', improvementPlan: false, energyReport: false, speed: 'Standard (72 hours)',
      areaPage, sourcePage: sourcePage || sourcePageForPath(pathname), ctaId: defaultCta,
      propertyCount: '', preferredDate: '', notes: '', website: '', turnstileToken: FORM_DRAFT ? 'draft-preview' : '', consent: false,
    },
  })

  useEffect(() => {
    if (initialised.current) return
    initialised.current = true
    let initialSource = sourcePage || sourcePageForPath(pathname)
    const seed = context ?? (dedicated ? parseQuoteContext(new URLSearchParams(window.location.search)) : undefined)
    if (seed) {
      setValue('services', [quoteServices[seed.service || 'epc']])
      if (seed.service) serviceTouched.current = true
      setValue('areaBand', seed.area || '')
      setValue('speed', seed.speed === 'next-day' ? NEXT_DAY_VISIT_SPEED : seed.speed === 'same-day' ? SAME_DAY_LODGEMENT_SPEED : 'Standard (72 hours)')
      setValue('improvementPlan', !!seed.plan)
      initialSource = seed.sourcePage || initialSource
      setValue('sourcePage', initialSource)
      setValue('ctaId', seed.ctaId || (dedicated ? 'direct' : defaultCta))
      // the area page a quote started on rides along in the link, now that area pages have no form of their own
      if (!areaPage && seed.areaPage) setValue('areaPage', seed.areaPage)
    }
    const customerType = restoredCustomerType(window.history.state) ?? customerTypeForSource(initialSource)
    // Homeowner is not offered on a portfolio enquiry, so it must not arrive pre-selected either.
    setValue('customerType', getValues('services').includes(BULK) && customerType === 'Homeowner' ? '' : customerType)
    if (dedicated && window.location.hash === '#booking-form') focusBookingElement(document.getElementById('booking-form'))
    // URL context seeds a new form only. Browser history must never overwrite edits.
  }, [dedicated, pathname, sourcePage, setValue, getValues, context, areaPage, defaultCta])

  // A "See my price" button further down the homepage picks a service in this card.
  const request = home?.request
  const handledPick = useRef(0)
  useEffect(() => {
    if (!request || variant !== 'hero' || handledPick.current === request.n) return
    handledPick.current = request.n
    // after a sent request, a fresh one with this service picked (prototype v7.2)
    if (status === 'success') startOver()
    serviceTouched.current = true
    setValue('services', [quoteServices[request.service]])
    // The same rules as choosing a tab: no hidden add-on survives a change of service.
    if (request.service !== 'epc' && request.service !== 'bundle') { setValue('speed', 'Standard (72 hours)'); setValue('improvementPlan', false) }
    setValue('energyReport', false)   // the homepage's buttons never pick the Pre-Assessment
    setRailPick(request)
    // focus to the form's heading without a jump: the page glides to the Prices section (HomeQuoteContext). On step 1
    // already, setStep changes nothing, so the step effect would never move focus (lost in the 22/10 port)
    if (step === 1) headingRef.current?.focus({ preventScroll: true })
    else { moveFocus.current = true; setStep(1) }
  }, [request, variant, setValue, status]) // eslint-disable-line react-hooks/exhaustive-deps -- once per pick

  // A #contact link on the same page (the area page's closing band) says which button led here. Dropped in 54d75fd;
  // without it a quote from the closing band was logged as embedded.
  useEffect(() => {
    if (dedicated) return
    const captureCta = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-enquiry-cta]') : null
      const ctaId = anchor?.dataset.enquiryCta as CtaId
      if (anchor?.getAttribute('href') === '#contact' && ctaIds.includes(ctaId)) setValue('ctaId', ctaId)
    }
    document.addEventListener('click', captureCta)
    return () => document.removeEventListener('click', captureCta)
  }, [dedicated, setValue])

  useEffect(() => {
    if (moveFocus.current) { focusBookingElement(headingRef.current); moveFocus.current = false }
  }, [step])
  useEffect(() => { if (status === 'success') focusBookingElement(successRef.current) }, [status])
  // phones: the question that just opened comes into view and takes focus (smooth, or a jump under reduced motion)
  useEffect(() => {
    if (!railTick) return
    const item = formRef.current?.querySelector<HTMLElement>('.bf-st.is-open')
    if (!item) return
    // whatever is pinned over the top: the dialog's bar, or on a page the header and an area page's On this page bar
    const dialog = item.closest('dialog')
    const bars = dialog ? [dialog.querySelector('[data-dialog-bar]')] : [document.querySelector('header'), document.querySelector('.in-secbar')]
    const cover = Math.max(0, ...bars.map(bar => bar && ['sticky', 'fixed'].includes(getComputedStyle(bar).position)
      ? Math.max(0, parseFloat(getComputedStyle(bar).top) || 0) + bar.getBoundingClientRect().height : 0))
    item.style.scrollMarginTop = `${cover + 12}px`
    item.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    item.querySelector<HTMLElement>('[data-rail-q]')?.focus({ preventScroll: true })
  }, [railTick])
  useEffect(() => () => window.clearTimeout(railTimer.current), [])

  const { containerRef: turnstileRef, token: turnstileToken, isLoading: turnstileLoading, error: turnstileError, reset: resetTurnstile } = useTurnstile({
    enabled: !FORM_DRAFT && step === LAST && status !== 'success',
    onVerify: token => setValue('turnstileToken', token, { shouldValidate: true }),
    onExpire: () => setValue('turnstileToken', '', { shouldValidate: !quietReset.current }),
    onError: () => setValue('turnstileToken', '', { shouldValidate: true }),
  })
  const values = watch()
  const estimate = guideEstimate(values)
  // A portfolio has nothing to choose about timing, so it skips step 2 (v7, approved 22/10/2026): two steps, not three.
  const portfolio = values.services.includes(BULK)
  const stepCount = portfolio ? 2 : LAST
  const stepAt = portfolio && step === LAST ? 2 : step
  const dateNote = visitDateNote(values.preferredDate, values.speed === NEXT_DAY_VISIT_SPEED)

  // phones: arriving on the phone layout (first render after hydration, or a resize) opens the question matching the step
  if (phone !== railMode) {
    setRailMode(phone); setRailPicked(railPick)
    if (phone) {
      const list = railOrder(portfolio)
      const at: RailId = step === LAST ? 'details' : step === 2 ? 'timing' : 'who'
      setRailSeen(new Set(list.slice(0, list.indexOf(at)))); setRailOpen(at)
    }
  } else if (phone && railPick !== railPicked) {
    // a "See my price" button on the homepage has picked the service: that question counts as answered
    setRailPicked(railPick)
    const seen = new Set(railSeen).add('service')
    setRailSeen(seen); setRailOpen(railNext(railOrder(portfolio), seen, null, values)); setRailTick(tick => tick + 1)
  }

  // The plan's box pulses three times as it comes into view (v7: "a little subtle blinking animation"); never under
  // reduced motion, never once ticked.
  const pulseObserver = useRef<IntersectionObserver | null>(null)
  const planBox = useCallback((box: HTMLLabelElement | null) => {
    pulseObserver.current?.disconnect()
    if (!box || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    pulseObserver.current = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || box.querySelector('input')?.checked) return
      box.classList.add('is-pulsing')
      pulseObserver.current?.disconnect()
    }, { threshold: 0.6 })
    pulseObserver.current.observe(box)
  }, [])
  const publishQuote = usePublishQuote()
  const [selectedService] = values.services
  const { areaBand, floorArea, customerType, speed, improvementPlan, energyReport } = values
  useEffect(() => {
    // Desktop summary panels only; selections, never customer details.
    publishQuote?.({ service: selectedService, areaBand: areaBand || '', floorArea: floorArea || '', customerType: customerType || '', speed, improvementPlan: !!improvementPlan, energyReport: !!energyReport })
  }, [publishQuote, selectedService, areaBand, floorArea, customerType, speed, improvementPlan, energyReport])
  const { isBulk, isLodged, canHavePlan, planIncluded, productKind } = estimate
  const estimateText = estimate.state === 'awaiting-area' ? '' : estimate.state === 'priced' && estimate.total !== null
    ? `Guide estimate: ${guidePrice(estimate, estimate.total)} · ${areaLabel(values.areaBand, values.floorArea)}`
    : isBulk ? 'Your portfolio will be quoted individually.' : "Price to be confirmed. We'll confirm the size and price from your property details."

  function start() {
    if (!started.current) { started.current = true; conversionEvent('form_start', quoteContextFromForm(getValues())) }
  }

  function rememberSelection() {
    const context = quoteContextFromForm(getValues())
    if (dedicated) window.history.replaceState(window.history.state, '', quoteHref(context))
  }

  // a fresh request: "Send another request", and a "See my price" pick after a sent one
  function startOver() {
    reset(); started.current = false; serviceTouched.current = false; setAreaOpen(false); setAreaHost(null); setSent(null); setStatus('idle'); moveFocus.current = true; setStep(1)
    setRailOpen('who'); setRailSeen(new Set()); setRailTick(tick => tick + 1)
    rememberCustomerType('', window.history)
    if (dedicated) window.history.replaceState(window.history.state, '', quoteHref())
  }

  function focusError(errorFields: FieldErrors<ContactInput>) {
    // Follow visible DOM order; the schema's object-key order is not the user's reading order.
    const names = new Set(Object.keys(errorFields))
    const input = Array.from(formRef.current?.querySelectorAll<HTMLElement>('input, textarea, button') || [])
      .find(element => names.has(element.getAttribute('name') || '') && element.getClientRects().length > 0)
    focusBookingElement(input || document.getElementById(fid('security-check')))
  }

  async function next() {
    start()
    if (await trigger(GATES[step - 1])) {
      conversionEvent('form_step_complete', { ...quoteContextFromForm(getValues()), step })
      moveFocus.current = true; setStep(step === 1 && getValues('services').includes(BULK) ? LAST : step + 1)
    } else {
      requestAnimationFrame(() => {
        const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
        focusBookingElement(invalid?.querySelector<HTMLElement>('input') || invalid || headingRef.current)
      })
    }
  }

  /* ------------------------------------------------------------- phones: the rail */
  /** Opens one rail question (the others fold) and keeps the desktop step in line with it. */
  function railGo(id: RailId, seen?: ReadonlySet<RailId>) {
    window.clearTimeout(railTimer.current)
    if (seen) setRailSeen(seen)
    setRailOpen(id); setStep(RAIL_STEP[id]); setRailTick(tick => tick + 1)
  }

  /** Start again (Abdul 24/10: on a phone there was no way back to a blank form short of changing every answer). */
  function railStartOver() {
    window.clearTimeout(railTimer.current)
    reset(); clearErrors(); setShowErrors(false); started.current = false; serviceTouched.current = false; setAreaOpen(false); setAreaHost(null)
    rememberCustomerType('', window.history)
    railGo('who', new Set())
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' }))
  }

  /** Folds the open question once its gate passes, then opens the next that still needs an answer. */
  async function railAdvance(from: RailId) {
    window.clearTimeout(railTimer.current)
    start()
    const gate = RAIL_GATES[from]
    if (!(await trigger(gate))) {
      // the price's gate is the whole of desktop step 1, so its first problem may sit on an earlier question
      const field = gate.find(name => getFieldState(name).invalid)
      const owner = field && FIELD_RAIL[field]
      if (owner && owner !== from) { railGo(owner); return }
      requestAnimationFrame(() => {
        const invalid = formRef.current?.querySelector<HTMLElement>('.bf-st.is-open [aria-invalid="true"]')
        focusBookingElement(invalid?.querySelector<HTMLElement>('input') || invalid || null)
      })
      return
    }
    // the same step events as the desktop's Continue: leaving the price is step 1, leaving the timing step 2
    if (from === 'price' || from === 'timing') conversionEvent('form_step_complete', { ...quoteContextFromForm(getValues()), step: RAIL_STEP[from] })
    const seen = new Set(railSeen).add(from)
    railGo(railNext(railOrder(getValues('services').includes(BULK)), seen, from, getValues()), seen)
  }

  /** A tapped answer folds after a beat, so the choice is seen landing; keyboard choices wait for Enter. */
  function railTap(from: RailId) {
    if (!tapped.current) return
    window.clearTimeout(railTimer.current)
    railTimer.current = window.setTimeout(() => void railAdvance(from), 240)
  }
  const railEnter = (from: RailId) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') { event.preventDefault(); void railAdvance(from) }
  }

  /** After a refused send on a phone: the first problem on a folded question reopens it, else the usual focus. */
  function railError(errorFields: FieldErrors<ContactInput>) {
    const list = railOrder(getValues('services').includes(BULK))
    const owners = new Set(Object.keys(errorFields).map(name => FIELD_RAIL[name as keyof ContactInput]).filter(Boolean))
    const first = list.find(id => owners.has(id))
    if (first) railGo(first)
    else focusError(errorFields)
  }

  /** A fresh challenge after a failed send. The notice explains it, so the empty token is not also flagged as a field error. */
  function retryChallenge() { quietReset.current = true; resetTurnstile(); quietReset.current = false }

  async function onSubmit(data: ContactInput) {
    if (submitting.current) return
    if (FORM_DRAFT) {
      setSent({ data, confirmationSent: false }); setStatus('success')
      return
    }
    submitting.current = true
    setStatus('submitting'); setProblem(null)
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, ...landingContext() }) })
      const body: { ok?: boolean; delivered?: boolean; confirmationSent?: boolean; code?: string } = await response.json().catch(() => ({}))
      if (response.ok && body.ok === true && body.delivered === true) {
        conversionEvent('enquiry_submitted', quoteContextFromForm(data))
        setSent({ data, confirmationSent: body.confirmationSent === true })
        setStatus('success')
        return
      }
      retryChallenge(); setStatus('error')
      // A refused security check is fixable in place. Delivery failures (500/502/504) may clear
      // on a second attempt; a missing configuration (503) or refused origin (403) never will.
      setProblem(body.code === 'security' ? { kind: 'security' } : { kind: 'unavailable', retryable: [500, 502, 504].includes(response.status) })
    } catch {
      retryChallenge(); setStatus('error')
      setProblem(navigator.onLine === false ? { kind: 'offline' } : { kind: 'unavailable', retryable: true })
    } finally { submitting.current = false }
  }

  const shell = cn('bf', variant === 'hero' ? 'bf--hero' : 'bf--page', variant === 'dialog' && 'bf--dialog')

  if (status === 'success' && sent) return (
    <div className={shell}>
      <RequestSent data={sent.data} confirmationSent={sent.confirmationSent} focusRef={successRef} idPrefix={idPrefix} onReset={startOver} />
    </div>
  )

  /* ------------------------------------------------------------- step 1: taps only */
  const chooseService = (value: string) => {
    serviceTouched.current = true
    if (value === BULK && getValues('customerType') === 'Homeowner') { setValue('customerType', ''); rememberCustomerType('', window.history) }
    setValue('services', [value as ContactInput['services'][number]], { shouldValidate: !!errors.services })
    // No hidden add-on survives a change of service: the paid plan only exists on the EPC and the
    // bundle (moving between those two keeps it), the free energy report only on the Pre-Assessment.
    const lodged = value === 'EPC Certificate' || value === 'Both (Bundle)'
    if (!lodged) { setValue('speed', 'Standard (72 hours)'); setValue('improvementPlan', false) }
    if (value !== PRE_ASSESSMENT) setValue('energyReport', false)
    rememberSelection(); conversionEvent('service_selection', quoteContextFromForm(getValues()))
  }
  const chooseArea = (value: string) => {
    setValue('areaBand', value as ContactInput['areaBand'], { shouldValidate: !!errors.areaBand })
    setAreaHost(value === 'unknown' ? null : value)
    // A typed figure stays only while it agrees with the chosen size, so picking another size clears it.
    const typed = getValues('floorArea'), exact = parseExactArea(typed)
    if (typed && (exact === undefined || bandForArea(exact) !== value)) { setValue('floorArea', ''); clearErrors('floorArea') }
    if (value !== TOP_BAND) setValue('floorAreaUnknown', false)
    else clearErrors('floorArea')
    rememberSelection(); conversionEvent('estimator_use', quoteContextFromForm(getValues()))
  }
  const whoChosen = (value: string) => {
    rememberCustomerType(value as ContactInput['customerType'], window.history)
    // An agent instructing on a sale usually needs the floor plan too; only a default.
    if (!serviceTouched.current && value === 'Estate agent') chooseService('Both (Bundle)')
  }
  const sizeNote = errors.floorArea?.message || ((parseExactArea(floorArea) ?? 0) > 300 ? 'That is a very large home. If your figure is in square feet, divide it by 10.76 to get m².' : '')
  const baseTotal = (band: string) => guideEstimate({ services: values.services, areaBand: band })
  const bandIndex = areaBands.indexOf(values.areaBand as (typeof areaBands)[number])
  const band = bandIndex >= 0 ? pricing[bandIndex] : undefined
  const onTopBand = values.areaBand === TOP_BAND
  const showArea = areaOpen || onTopBand || !!floorArea
  // desktop (Abdul 24/10: "when I click the approximate floor area it opens"): a picked band opens the exact figure under
  // it, still optional below the top band; phones keep the link, as a pick there moves straight to the next question
  const bandPicked = !!values.areaBand && values.areaBand !== 'unknown'
  const showAreaDesk = showArea || bandPicked
  const areaUnder: string = areaHost ?? (bandPicked && values.areaBand ? values.areaBand : TOP_BAND)

  const planChoice = canHavePlan && !planIncluded && (
    <label ref={planBox} className="bf-check bf-check--offer" onAnimationEnd={event => event.currentTarget.classList.remove('is-pulsing')}>
      <input type="checkbox" className="bf-check__box" {...register('improvementPlan', { onChange: event => { (event.target as HTMLElement).closest('label')?.classList.remove('is-pulsing'); rememberSelection() } })} />
      {/* Abdul's wording, 22/10/2026 pricing spec §7 */}
      <span className="min-w-0"><span className="bf-check__t">Add a personalised EPC Improvement Plan <span className="whitespace-nowrap">— £{site.addOns.improvementPlan}</span></span>
        <span className="bf-check__d">A written explanation of what is affecting your rating and which improvements to consider first. Your standard EPC recommendations are included whether or not you choose this extra.</span></span>
    </label>
  )
  const reportChoice = productKind === 'preAssessment' && (
    <label className="bf-check">
      <input type="checkbox" className="bf-check__box" {...register('energyReport', { onChange: rememberSelection })} />
      {/* Abdul's wording, 22/10/2026 pricing spec §6. Free, so it never changes the price. */}
      <span className="min-w-0"><span className="bf-check__t">Include a separate energy report — no extra charge</span>
        <span className="bf-check__d">Receive a separate summary of the assessment findings alongside your personalised improvement plan.</span></span>
    </label>
  )

  /** One shared floor-area field (spec 2, 22/10/2026): under the top band's row, labelled for the band it serves. */
  // the example sits inside the picked band, so it never suggests a figure the band would refuse (84 under 55-75 m²)
  const areaExample = ({ 'up-to-40': 32, '40-55': 48, '55-75': 64, '75-95': 84, '95-115': 104, 'over-115': 145 } as Record<string, number>)[values.areaBand ?? ''] ?? 84
  const areaField = (
    <div className="bf__area">
      <label htmlFor={fid('floorArea')} className="bf__area-label">{onTopBand ? 'Approximate internal floor area' : 'Internal floor area'}</label>
      <p id={fid('floorArea-help')} className="bf__sub">{onTopBand ? 'Include all floors. An estimate is fine.' : 'Enter the size if known. An estimate is fine.'}</p>
      <div className="bf__area-row">
        <div className="relative w-36">
          <Input id={fid('floorArea')} inputMode="decimal" autoComplete="off" maxLength={10} placeholder={`e.g. ${areaExample}`}
            aria-invalid={!!errors.floorArea} aria-describedby={[fid('floorArea-help'), sizeNote ? fid('floorArea-note') : ''].filter(Boolean).join(' ')} hasError={!!errors.floorArea} className="pr-10"
            {...register('floorArea', {
              onChange: event => {
                setAreaOpen(true); setAreaHost((h) => h ?? areaUnder)
                const exact = parseExactArea(event.target.value)
                if (event.target.value) setValue('floorAreaUnknown', false)
                if (exact !== undefined && getValues('areaBand') !== bandForArea(exact)) {
                  setValue('areaBand', bandForArea(exact), { shouldValidate: !!errors.areaBand }); rememberSelection()
                }
                if (errors.floorArea) void trigger('floorArea')
              },
              onBlur: () => { if (parseExactArea(getValues('floorArea')) !== undefined) conversionEvent('estimator_use', quoteContextFromForm(getValues())) },
            })} />
          <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-secondary-600">m²</span>
        </div>
        {!onTopBand && <span className="text-sm text-secondary-600">Optional</span>}
      </div>
      {onTopBand && (
        <label className="bf__area-unknown">
          <input type="checkbox" className="bf-check__box" {...register('floorAreaUnknown', {
            onChange: event => { if (event.target.checked) { setValue('floorArea', ''); clearErrors('floorArea') } },
          })} />
          I don&rsquo;t know the floor area
        </label>
      )}
      {sizeNote && <p id={fid('floorArea-note')} role={errors.floorArea ? 'alert' : undefined} className={cn('mt-1.5 text-sm', errors.floorArea ? 'text-red-700' : 'text-secondary-600')}>{sizeNote}</p>}
    </div>
  )

  /** The estimate panel's parts: the desktop panel shows them in this order, the phone's price question moves the
   *  extras up under the price, as prototype C. */
  const estHead = <>
    <p className="bf__est-label">Estimated guide price</p>
    {isBulk ? (
      <><p className="bf__price bf__price--text"><b>Quote</b></p><p className="bf__for">Several properties are quoted individually.</p></>
    ) : estimate.state === 'priced' && band && estimate.total !== null ? (
      <>
        <p className="bf__price">{estimate.isStartingPrice && <small>From</small>}<b data-price className="tabular-nums"><RollingPrice text={`£${formatPrice(estimate.total)}`} /></b><span>{isLodged || productKind === 'preAssessment' ? 'inc. assessment' : 'inc. on-site measuring'}{isLodged ? ' and GOV.UK lodgement' : ''}</span></p>
        <p className="bf__for">{areaLabel(values.areaBand, values.floorArea)}</p>
        {estimate.isStartingPrice && <p className="bf__for">Final price depends on property size and complexity. We&rsquo;ll confirm your exact quote before booking.</p>}
        {estimate.saving > 0 && <p className="bf__save">Save £{estimate.saving} compared with booking separately.</p>}
        <dl className="bf__rows">{guideEstimateRows(estimate).map(([label, amount]) => <div key={label}><dt>{label}</dt><dd className="tabular-nums">{amount}</dd></div>)}</dl>
      </>
    ) : estimate.state === 'manual-quote' ? (
      <>
        <p className="bf__price bf__price--text"><b data-price>Price to be confirmed</b></p>
        <p className="bf__for">We&rsquo;ll confirm the size and price from your property details.</p>
        <dl className="bf__rows">{guideEstimateRows(estimate).map(([label, amount]) => <div key={label}><dt>{label}</dt><dd className="tabular-nums">{amount}</dd></div>)}</dl>
      </>
    ) : (
      <><p className="bf__price"><small>From</small><b data-price className="tabular-nums"><RollingPrice text={`£${formatPrice(estimate.fromTotal ?? 0)}`} /></b></p><p className="bf__for">Pick a size for your guide price.</p></>
    )}
  </>
  const estGet = <>
    {whatYouGet(productKind).length > 0 && <>
      <p className="bf__est-label bf__get-h">What you get</p>
      <ul className="bf__ticks bf__get">{whatYouGet(productKind).map(item => <li key={item}><Check aria-hidden="true" className="h-4 w-4 shrink-0" />{item}</li>)}</ul>
    </>}
    <details className="bf__incl"><summary><span>What’s included in the price</span><ArrowRight aria-hidden="true" className="h-5 w-5" /></summary>
      <ul>{includedList(productKind).map(item => <li key={item}>{item}</li>)}</ul></details>
  </>
  const estExtras = <>
    {(planChoice || reportChoice) && <div className="bf__extras">
      {planChoice}
      {reportChoice}
    </div>}
  </>
  const estFine = <>
    {planIncluded && estimate.state === 'awaiting-area' && <p className="bf__note mt-3">Your personalised written improvement plan is included in the price.</p>}
    <p className="bf__fine"><Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[#386B59]" />No upfront payment. You pay once the assessment is done.</p>
    <p className="bf__fine bf__fine--quiet">Exact price and appointment confirmed before booking.</p>
  </>

  const quoteStep = (
    <div className="bf__quote">
      <Controller control={control} name="customerType" render={({ field }) => (
        <fieldset className="min-w-0" aria-invalid={!!errors.customerType} aria-describedby={errors.customerType ? fid('customerType-error') : undefined}>
          <legend className="bf__legend"><Qn n={1} />Which best describes you?</legend>
          <div className={cn('bf__who', isBulk && 'is-three')}>
            {customerTypeChoices(isBulk).map((option, index) => {
              const icon = customerIcons[option.value] || 'house'
              const checked = field.value === option.value
              return (
                <label key={option.value} className="bf-tile bf-tile--who" data-checked={checked || undefined}>
                  <input type="radio" name="customerType" value={option.value} checked={checked} required className="bf-radio"
                    ref={index === 0 ? field.ref : undefined} aria-label={option.label} aria-describedby={fid(`customerType-d-${index}`)}
                    onChange={() => { field.onChange(option.value); whoChosen(option.value) }} />
                  <span aria-hidden="true" className="bf-tile__ico"><Ico name={icon} /></span>
                  <span className="min-w-0"><b>{option.label}</b><span id={fid(`customerType-d-${index}`)} className="bf-tile__d">{option.description}</span></span>
                  {checked && <Check aria-hidden="true" strokeWidth={3} className="bf-tile__check" />}
                </label>
              )
            })}
          </div>
          {errors.customerType && <p id={fid('customerType-error')} role="alert" className="mt-2 text-sm text-red-700">{errors.customerType.message}</p>}
        </fieldset>
      )} />

      <fieldset className="min-w-0" aria-invalid={!!errors.services} aria-describedby={errors.services ? fid('services-error') : undefined}>
        <legend className="bf__legend"><Qn n={2} />Which service?</legend>
        <div className="bf__tabs">
          {serviceChoices.map(option => {
            const checked = selectedService === option.value
            return (
              <label key={option.value} className="bf-pill" data-checked={checked || undefined}>
                <input type="radio" name="services" value={option.value} checked={checked} required className="bf-radio"
                  aria-label={option.label} onChange={() => chooseService(option.value)} />
                <span aria-hidden="true" className="bf-pill__dot" />
                {serviceTabLabels[option.value] || option.label}
                {option.value === 'Both (Bundle)' && <span className="bf-pill__save">Save up to £{maxBundleSaving}</span>}
                {option.value === PRE_ASSESSMENT && <span className="bf-pill__tag">Not lodged</span>}
                {/* Abdul 24/10: say who the several-properties route is for, in the phone list's word */}
                {option.value === BULK && <span className="bf-pill__tag">Agencies</span>}
              </label>
            )
          })}
        </div>
        <p className="bf__sub">{serviceChoices.find(choice => choice.value === selectedService)?.description}</p>
        {errors.services && <p id={fid('services-error')} role="alert" className="mt-2 text-sm text-red-700">{errors.services.message}</p>}
      </fieldset>

      {/* v7, approved 22/10/2026: the kind of home (a maisonette on two floors changes the survey). Not on a portfolio. */}
      {!isBulk && <Controller control={control} name="dwellingType" render={({ field }) => (
        <fieldset className="min-w-0" aria-invalid={!!errors.dwellingType} aria-describedby={[fid('dwellingType-hint'), errors.dwellingType ? fid('dwellingType-error') : ''].filter(Boolean).join(' ')}>
          <legend className="bf__legend"><Qn n={3} />What type of property is it?</legend>
          <p id={fid('dwellingType-hint')} className="bf__sub">It helps us confirm your exact price.</p>
          <div className="bf__who bf__dwelling">
            {dwellingChoices.map((option, index) => {
              const checked = field.value === option.value
              return (
                <label key={option.value} className="bf-tile bf-tile--who bf-tile--dwelling" data-checked={checked || undefined}>
                  <input type="radio" name="dwellingType" value={option.value} checked={checked} required className="bf-radio"
                    ref={index === 0 ? field.ref : undefined} aria-label={option.value} aria-describedby={fid(`dwellingType-d-${index}`)}
                    onChange={() => { field.onChange(option.value); rememberSelection() }} />
                  <span className="min-w-0"><b>{option.value}</b><span id={fid(`dwellingType-d-${index}`)} className="bf-tile__d">{option.description}</span></span>
                  {checked && <Check aria-hidden="true" strokeWidth={3} className="bf-tile__check" />}
                </label>
              )
            })}
          </div>
          {errors.dwellingType && <p id={fid('dwellingType-error')} role="alert" className="mt-2 text-sm text-red-700">{errors.dwellingType.message}</p>}
        </fieldset>
      )} />}

      <div className="bf__calc">
        <div className="min-w-0">
          {isBulk ? (
            <p className="bf__note">A single floor area does not apply to several properties. We&rsquo;ll ask roughly how many on the next step, and quote them individually.</p>
          ) : (
            <fieldset className="min-w-0" aria-invalid={!!errors.areaBand} aria-describedby={[fid('areaBand-hint'), errors.areaBand ? fid('areaBand-error') : ''].filter(Boolean).join(' ')}>
              <legend className="bf__legend"><Qn n={4} />How big is the property?</legend>
              <p id={fid('areaBand-hint')} className="bf__sub">Choose the approximate internal floor area. Bedrooms are only a rough guide. Not sure? We can confirm it from your property details.</p>
              <div className="bf__sizes">
                {areaBands.map((b, i) => {
                  const checked = values.areaBand === b
                  const row = baseTotal(b)
                  const price = row.baseGuide !== null ? guidePrice(row, row.baseGuide) : ''
                  return (
                    <div key={b} className="contents">
                      <label className="bf-tile bf-tile--size" data-checked={checked || undefined}>
                        <input type="radio" name="areaBand" value={b} checked={checked} required className="bf-radio"
                          aria-label={`${pricing[i].areaLabel}, ${pricing[i].typicalLabel}${price ? `, ${price}` : ''}`}
                          onChange={() => chooseArea(b)} />
                        <span className="bf-size__top"><b>{pricing[i].areaLabel}</b>{price && <span className="tabular-nums">{price}</span>}</span>
                        <span className="bf-tile__d">{pricing[i].typicalLabel}</span>
                      </label>
                      {showAreaDesk && b === areaUnder && areaField}
                    </div>
                  )
                })}
                <label className="bf-tile bf-tile--unsure" data-checked={values.areaBand === 'unknown' || undefined}>
                  <input type="radio" name="areaBand" value="unknown" checked={values.areaBand === 'unknown'} required className="bf-radio"
                    aria-label="Not sure of floor area" onChange={() => chooseArea('unknown')} />
                  <HelpCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
                  <span className="min-w-0 flex-1"><span className="bf-size__top"><b>Not sure of the size?</b><span>Price confirmed before booking</span></span>
                    <span className="bf-tile__d">We&rsquo;ll confirm the size and price from your property details.</span></span>
                </label>
              </div>
              {!showAreaDesk && (
                <button type="button" className="bf__more"
                  onClick={() => { setAreaOpen(true); requestAnimationFrame(() => document.getElementById(fid('floorArea'))?.focus()) }}>
                  Know the exact size? Enter it in m²
                </button>
              )}
              {errors.areaBand && <p id={fid('areaBand-error')} role="alert" className="mt-2 text-sm text-red-700">{errors.areaBand.message}</p>}
            </fieldset>
          )}
        </div>

        <div className="bf__est" data-estimate>
          {estHead}{estGet}{estExtras}{estFine}
        </div>
      </div>
      {values.customerType === 'Landlord (tenanted)' && <p className="bf__note bf__note--key"><KeyRound aria-hidden="true" className="bf__note-ico" />Please let your tenants know about the visit and include any access arrangements in the notes.</p>}
    </div>
  )

  /* ------------------------------------------------------------- timing and details */
  // the phone shows the surcharge on the right of the row, so it keeps the name and the amount apart as well
  const speedOptions: (ChoiceOption & { name: string; surcharge?: string })[] = [
    { value: 'Standard (72 hours)', label: 'Standard lodgement', name: 'Standard lodgement', description: 'Lodged on the GOV.UK register within 72 hours of the visit.' },
    { value: SAME_DAY_LODGEMENT_SPEED, label: `Same-day lodgement (+\u2060£${SAME_DAY_LODGEMENT_SURCHARGE})`, name: 'Same-day lodgement', surcharge: `+£${SAME_DAY_LODGEMENT_SURCHARGE}`, description: 'Lodged on the GOV.UK register on the day of the visit.' },
    { value: NEXT_DAY_VISIT_SPEED, label: `Next-day visit and lodgement (+\u2060£${NEXT_DAY_VISIT_SURCHARGE})`, name: 'Next-day visit and lodgement', surcharge: `+£${NEXT_DAY_VISIT_SURCHARGE}`, description: 'We visit the next day and lodge your EPC that day. Availability confirmed before booking.' },
  ]
  const speedChosen = (value: string) => {
    rememberSelection()
    // a next-day visit means tomorrow: it fills in tomorrow's date when none is set (v7)
    if (value === NEXT_DAY_VISIT_SPEED && !getValues('preferredDate')) setValue('preferredDate', londonYmd(1))
  }
  const visitFields = (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
      {!isBulk && <Field label="Preferred visit date" htmlFor={fid('preferredDate')} hint="Optional. A requested date is not a confirmed appointment." error={errors.preferredDate?.message}>
        <Input id={fid('preferredDate')} type="date" min={londonYmd(0)} aria-describedby={dateNote.text && !errors.preferredDate ? fid('preferredDate-note') : undefined}
          {...register('preferredDate', { onChange: () => { if (errors.preferredDate) void trigger('preferredDate') } })} />
        {/* never in the past; today and tomorrow say what they depend on; a next-day visit means tomorrow */}
        {dateNote.text && !errors.preferredDate && <p id={fid('preferredDate-note')} role="status" className={cn('bf__date-note', dateNote.blocking && 'is-bad')}>{dateNote.text}</p>}
      </Field>}
      <Field label="Access notes or other instructions" htmlFor={fid('notes')} hint="Optional. Access, parking or anything about the property." error={errors.notes?.message} className={isBulk ? 'sm:col-span-2' : undefined}>
        <Textarea id={fid('notes')} rows={2} {...register('notes')} />
      </Field>
    </div>
  )
  const timingFields = <>
    {isLodged ? <Controller control={control} name="speed" render={({ field }) => <Choices name="speed" idPrefix={idPrefix} legend="How quickly do you need the certificate?"
      value={field.value} inputRef={field.ref} error={errors.speed?.message} onChange={value => { field.onChange(value); speedChosen(value) }}
      options={speedOptions} />} /> : <p className="text-base text-secondary-700">{turnaroundCopy(productKind)}</p>}
    {visitFields}
  </>

  const detailFields = <>
    <p className="text-base text-secondary-700">{contactStepIntro(productKind)}</p>
    <p className="text-sm text-secondary-700">Fields marked * are required.</p>
    {showErrors && Object.keys(errors).length > 0 && <div role="alert" ref={errSumRef} tabIndex={-1} className="bf__errsum rounded-lg border border-danger p-3 text-sm text-red-700">
      <p className="font-semibold">Please check the following:</p>
      <ul>{Object.entries(errors).map(([name, error]) => <li key={name}><a href={`#${fid(name === 'turnstileToken' ? 'security-check' : name)}`} className="inline-block py-2 underline" onClick={event => {
        event.preventDefault(); focusBookingElement(document.getElementById(fid(name === 'turnstileToken' ? 'security-check' : name)))
      }}>{error?.message}</a></li>)}</ul>
    </div>}
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Full name" htmlFor={fid('name')} required error={errors.name?.message}><Input id={fid('name')} autoComplete="name" {...register('name')} /></Field>
      <Field label="Phone number" htmlFor={fid('phone')} required error={errors.phone?.message}><Input id={fid('phone')} type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} /></Field>
      <Field label="Email address" htmlFor={fid('email')} required error={errors.email?.message} className="sm:col-span-2"><Input id={fid('email')} type="email" inputMode="email" autoComplete="email" {...register('email')} /></Field>
      {isBulk && <Field label="How many properties?" htmlFor={fid('propertyCount')} required error={errors.propertyCount?.message} hint="A rough number is fine." className="sm:col-span-2"><Input id={fid('propertyCount')} placeholder="e.g. 12, or 20+" {...register('propertyCount')} /></Field>}
      <Field label={isBulk ? 'Properties and postcodes' : 'Property address'} htmlFor={fid('address')} required={!isBulk} error={errors.address?.message}
        hint={isBulk ? 'Optional. Paste a list if you have one, or supply it later.' : undefined} className="sm:col-span-2">
        <Textarea id={fid('address')} rows={isBulk ? 5 : 2} autoComplete={isBulk ? 'off' : 'street-address'} {...register('address')} />
      </Field>
      {!isBulk && <Field label="Postcode" htmlFor={fid('postcode')} required error={errors.postcode?.message}><Input id={fid('postcode')} autoComplete="postal-code" {...register('postcode')} /></Field>}
      {/* a portfolio skips step 2, so its notes come here */}
      {isBulk && <Field label="Access notes or other instructions" htmlFor={fid('notes')} hint="Optional. Access, parking or anything about the properties." error={errors.notes?.message} className="sm:col-span-2">
        <Textarea id={fid('notes')} rows={2} {...register('notes')} />
      </Field>}
    </div>
  </>

  const sendFields = <>
    <label className="flex min-h-[48px] cursor-pointer items-start gap-3 py-2 text-base">
      <input id={fid('consent')} type="checkbox" required aria-invalid={!!errors.consent} aria-describedby={errors.consent ? fid('consent-error') : undefined} className="mt-1 h-5 w-5 shrink-0 accent-primary-700" {...register('consent')} />
      <span>I agree to be contacted about my enquiry. We only use your details for this request. Read our <a href="/privacy-policy" className="underline">privacy policy</a>.</span>
    </label>
    {errors.consent && <p id={fid('consent-error')} role="alert" className="text-sm text-red-700">{errors.consent.message}</p>}
    {FORM_DRAFT ? <p className="bf__draft">Draft preview: the security check is skipped and nothing is sent.</p> : (
      <div id={fid('security-check')} tabIndex={-1} aria-describedby={errors.turnstileToken ? fid('turnstileToken-error') : undefined}>
        <p className="mb-2 text-sm font-semibold">Security check</p>
        <div ref={turnstileRef} className="min-w-0" />
        {turnstileLoading && <p role="status" className="text-sm">Loading security check…</p>}
        {turnstileError && <div role="alert" className="text-sm text-red-700"><p>The security check could not complete. Check your connection and try again.</p><button type="button" className={`${controlClass} underline`} onClick={resetTurnstile}>Retry security check</button></div>}
        {errors.turnstileToken && <p id={fid('turnstileToken-error')} role="alert" className="text-sm text-red-700">{errors.turnstileToken.message}</p>}
      </div>
    )}
    {problem && <SendProblemNotice problem={problem} summary={enquirySummaryText(values)} />}
  </>

  const stepBody: ReactNode = step === 1 ? quoteStep
    : step === 2 ? <div className="bf__details">{timingFields}</div>
      : <div className="bf__details">{detailFields}{sendFields}</div>

  /* ------------------------------------------------------------- phones: the rail (C, approved 23/10/2026) */
  const railList = railOrder(isBulk)
  const railGuide = estimate.state === 'priced' && estimate.total !== null ? guidePrice(estimate, estimate.total) : ''
  const railQ = (text: string) => <h3 className="bf-q" tabIndex={-1} data-rail-q>{text}</h3>
  const railLegend = (text: string) => <legend className="bf-q" tabIndex={-1} data-rail-q>{text}</legend>
  const railGoButton = (from: RailId, label: string) => (
    <div className="bf-st__go"><button type="button" className="bf__go" onClick={() => void railAdvance(from)}>{label}<ArrowRight aria-hidden="true" className="h-4 w-4" /></button></div>
  )
  const speedOption = speedOptions.find(option => option.value === speed)
  const railValue = (id: RailId): string => {
    switch (id) {
      case 'who': return customerType || ''
      case 'service': return serviceTabLabels[selectedService] || serviceLabel(selectedService)
      case 'dwelling': return values.dwellingType || ''
      case 'size': return areaLabel(areaBand, floorArea)
      case 'price': return railGuide || (isBulk ? 'Quoted individually' : 'Price to be confirmed')
      case 'timing': return [isLodged ? speedOption?.name : '', values.preferredDate ? formatPreferredDate(values.preferredDate) : ''].filter(Boolean).join(' · ') || 'No date requested'
      default: return ''
    }
  }
  const railBody = (id: RailId): ReactNode => {
    switch (id) {
      case 'who': return (
        <Controller control={control} name="customerType" render={({ field }) => (
          <fieldset className="min-w-0" aria-invalid={!!errors.customerType} aria-describedby={errors.customerType ? fid('customerType-error') : undefined}>
            {railLegend('Which best describes you?')}
            <div className="bf-ruled">
              {customerTypeChoices(isBulk).map((option, index) => {
                const checked = field.value === option.value
                return (
                  <label key={option.value} className="bf-rr" data-checked={checked || undefined}>
                    <input type="radio" name="customerType" value={option.value} checked={checked} required className="bf-radio"
                      ref={index === 0 ? field.ref : undefined} aria-label={option.label} aria-describedby={fid(`customerType-d-${index}`)}
                      onChange={() => { field.onChange(option.value); whoChosen(option.value) }} onClick={() => railTap('who')} onKeyDown={railEnter('who')} />
                    <b>{option.label}</b><span id={fid(`customerType-d-${index}`)} className="bf-rr__d">{option.description}</span>
                    <span aria-hidden="true" className="bf-rr__ico"><Ico name={customerIcons[option.value] || 'house'} /></span>
                  </label>
                )
              })}
            </div>
            {errors.customerType && <p id={fid('customerType-error')} role="alert" className="bf-st__err">{errors.customerType.message}</p>}
          </fieldset>
        )} />
      )
      // the service has a default and descriptions to read, so it keeps a Continue
      case 'service': return (
        <fieldset className="min-w-0" aria-invalid={!!errors.services} aria-describedby={errors.services ? fid('services-error') : undefined}>
          {railLegend('Which service?')}
          <div className="bf-ruled">
            {serviceChoices.map((option, index) => {
              const checked = selectedService === option.value
              return (
                <label key={option.value} className="bf-rr" data-checked={checked || undefined}>
                  <input type="radio" name="services" value={option.value} checked={checked} required className="bf-radio"
                    aria-label={option.label} aria-describedby={checked ? fid(`services-d-${index}`) : undefined}
                    onChange={() => chooseService(option.value)} onKeyDown={railEnter('service')} />
                  <b>{serviceTabLabels[option.value] || option.label}</b>
                  {option.badge && <span className={cn('bf-rr__badge', option.badgeTone === 'green' ? 'is-save' : 'is-tag')}>{option.badge}</span>}
                  {checked && <span id={fid(`services-d-${index}`)} className="bf-rr__d">{option.description}</span>}
                </label>
              )
            })}
          </div>
          {errors.services && <p id={fid('services-error')} role="alert" className="bf-st__err">{errors.services.message}</p>}
          {railGoButton('service', 'Continue')}
        </fieldset>
      )
      case 'dwelling': return (
        <Controller control={control} name="dwellingType" render={({ field }) => (
          <fieldset className="min-w-0" aria-invalid={!!errors.dwellingType} aria-describedby={[fid('dwellingType-hint'), errors.dwellingType ? fid('dwellingType-error') : ''].filter(Boolean).join(' ')}>
            {railLegend('What type of property is it?')}
            <p id={fid('dwellingType-hint')} className="bf-st__sub">It helps us confirm your exact price.</p>
            <div className="bf-ruled bf-ruled--two">
              {dwellingChoices.map((option, index) => {
                const checked = field.value === option.value
                return (
                  <label key={option.value} className="bf-rr" data-checked={checked || undefined}>
                    <input type="radio" name="dwellingType" value={option.value} checked={checked} required className="bf-radio"
                      ref={index === 0 ? field.ref : undefined} aria-label={option.value} aria-describedby={fid(`dwellingType-d-${index}`)}
                      onChange={() => { field.onChange(option.value); rememberSelection() }} onClick={() => railTap('dwelling')} onKeyDown={railEnter('dwelling')} />
                    <b>{option.value}</b><span id={fid(`dwellingType-d-${index}`)} className="bf-rr__d">{option.description}</span>
                  </label>
                )
              })}
            </div>
            {errors.dwellingType && <p id={fid('dwellingType-error')} role="alert" className="bf-st__err">{errors.dwellingType.message}</p>}
          </fieldset>
        )} />
      )
      case 'size': return (
        <fieldset className="min-w-0" aria-invalid={!!errors.areaBand} aria-describedby={[fid('areaBand-hint'), errors.areaBand ? fid('areaBand-error') : ''].filter(Boolean).join(' ')}>
          {railLegend('How big is the property?')}
          <p id={fid('areaBand-hint')} className="bf-st__sub">Choose the approximate internal floor area. Bedrooms are only a rough guide. Not sure? We can confirm it from your property details.</p>
          <div className="bf-ruled">
            {areaBands.map((b, i) => {
              const checked = values.areaBand === b
              const row = baseTotal(b)
              const price = row.baseGuide !== null ? guidePrice(row, row.baseGuide) : ''
              return (
                <div key={b} className="contents">
                  <label className="bf-rr" data-checked={checked || undefined}>
                    <input type="radio" name="areaBand" value={b} checked={checked} required className="bf-radio"
                      aria-label={`${pricing[i].areaLabel}, ${pricing[i].typicalLabel}${price ? `, ${price}` : ''}`}
                      onChange={event => {
                        chooseArea(b)
                        // over 115 m² opens the floor-area field, with its own Continue
                        if (b === TOP_BAND) requestAnimationFrame(() => document.getElementById(fid('floorArea'))?.focus())
                        else keepRowInView(event.currentTarget)
                      }}
                      onClick={() => { if (b !== TOP_BAND) railTap('size') }} onKeyDown={railEnter('size')} />
                    <b>{pricing[i].areaLabel}</b><span className="bf-rr__d">{pricing[i].typicalLabel}</span>
                    {price && <span className="bf-rr__p">{row.isStartingPrice ? <><small>From</small>£{row.baseGuide}</> : price}</span>}
                  </label>
                  {b === TOP_BAND && showArea && <div className="bf-st__area">{areaField}{railGoButton('size', 'Continue')}</div>}
                </div>
              )
            })}
            <label className="bf-rr" data-checked={values.areaBand === 'unknown' || undefined}>
              <input type="radio" name="areaBand" value="unknown" checked={values.areaBand === 'unknown'} required className="bf-radio"
                aria-label="Not sure of floor area" onChange={event => { chooseArea('unknown'); keepRowInView(event.currentTarget) }} onClick={() => railTap('size')} onKeyDown={railEnter('size')} />
              <b>Not sure of the size?</b><span className="bf-rr__d">We&rsquo;ll confirm the size and price from your property details.</span>
            </label>
          </div>
          {!showArea && (
            <button type="button" className="bf__more"
              onClick={() => { setAreaOpen(true); requestAnimationFrame(() => document.getElementById(fid('floorArea'))?.focus()) }}>
              Know the exact size? Enter it in m²
            </button>
          )}
          {errors.areaBand && <p id={fid('areaBand-error')} role="alert" className="bf-st__err">{errors.areaBand.message}</p>}
        </fieldset>
      )
      case 'price': return <>
        {railQ('Your guide price')}
        <div className="bf__est bf__est--rail" data-estimate>
          {estHead}{estExtras}{estGet}{estFine}
          {values.customerType === 'Landlord (tenanted)' && <p className="bf__note bf__note--key"><KeyRound aria-hidden="true" className="bf__note-ico" />Please let your tenants know about the visit and include any access arrangements in the notes.</p>}
        </div>
        {railGoButton('price', isBulk ? 'Continue to your details' : 'Continue to timing')}
      </>
      case 'timing': return <>
        {isLodged ? <Controller control={control} name="speed" render={({ field }) => (
          <fieldset className="min-w-0" aria-invalid={!!errors.speed} aria-describedby={errors.speed ? fid('speed-error') : undefined}>
            {railLegend('How quickly do you need the certificate?')}
            <div className="bf-ruled">
              {speedOptions.map((option, index) => {
                const checked = field.value === option.value
                return (
                  <label key={option.value} className="bf-rr" data-checked={checked || undefined}>
                    <input type="radio" name="speed" value={option.value} checked={checked} required className="bf-radio"
                      ref={index === 0 ? field.ref : undefined} aria-label={option.label} aria-describedby={fid(`speed-description-${index}`)}
                      onChange={() => { field.onChange(option.value); speedChosen(option.value) }} onKeyDown={railEnter('timing')} />
                    <b>{option.name}</b><span id={fid(`speed-description-${index}`)} className="bf-rr__d">{option.description}</span>
                    {option.surcharge && <span className="bf-rr__p bf-rr__p--small">{option.surcharge}</span>}
                  </label>
                )
              })}
            </div>
            {errors.speed && <p id={fid('speed-error')} role="alert" className="bf-st__err">{errors.speed.message}</p>}
          </fieldset>
        )} /> : <>{railQ('When it’s ready')}<p className="bf-st__copy">{turnaroundCopy(productKind)}</p></>}
        <div className="bf-st__fields">{visitFields}</div>
        {railGoButton('timing', 'Continue to your details')}
      </>
      case 'details': return <>
        {railQ('Where should we send your exact price?')}
        <div className="bf__details bf-st__fields">{detailFields}{sendFields}</div>
        <div className="bf-st__go">
          <button key="send" type="submit" disabled={status === 'submitting' || (!FORM_DRAFT && !turnstileToken)} className="bf__go">{status === 'submitting' ? 'Sending…' : 'Send my quote request'}</button>
        </div>
        <p className="bf__reply"><b>Same working-day reply</b>, with your exact price and available times.</p>
        <p className="bf__promise"><b>Our promise:</b> £{promise.lateLodgement} off if your EPC isn’t on the register within 72 hours of the visit, £{promise.lateChange} off if we move your visit with less than 24 hours’ notice. <a href="/terms#our-promise">How it works</a></p>
      </>
    }
  }
  const railStep = (id: RailId, index: number) => {
    const isOpen = id === railOpen
    const isDone = !isOpen && railSeen.has(id)
    return (
      <li key={id} className={cn('bf-st', isOpen && 'is-open', isDone && 'is-done')} aria-current={isOpen ? 'step' : undefined}>
        <span className="bf-st__n" aria-hidden="true">{isDone ? <Check strokeWidth={2.25} className="h-4 w-4" /> : index + 1}</span>
        <div className="bf-st__body">
          {isOpen ? <div className="bf-st__open">{railBody(id)}</div>
            : isDone ? (
              <div className="bf-fold">
                <span className="bf-fold__k">{RAIL_LABELS[id]}</span>
                <span className={id === 'price' && railGuide ? 'bf-fold__price' : 'bf-fold__v'}>{railValue(id)}</span>
                <button type="button" className="bf-fold__change" aria-label={RAIL_CHANGE[id]} onClick={() => railGo(id)}>Change</button>
              </div>
            ) : <p className="bf-later">{RAIL_LABELS[id]}</p>}
        </div>
      </li>
    )
  }

  if (phone) return (
    <form ref={formRef} noValidate aria-label="Exact quote enquiry" aria-busy={status === 'submitting'}
      onChangeCapture={start} onPointerDownCapture={() => { tapped.current = true }} onKeyDownCapture={() => { tapped.current = false }}
      onKeyDown={event => {
        // Enter in a field of an open question moves on (the floor area, the visit date); this form has no submit
        // button until the details, so the browser would not submit it on Enter by itself
        if (event.key !== 'Enter' || event.defaultPrevented || step === LAST || !(event.target instanceof HTMLInputElement)) return
        event.preventDefault(); void railAdvance(railOpen)
      }}
      onSubmit={event => {
        // Enter in a field moves on (WCAG 3.2.2); only the details send
        if (step < LAST) { event.preventDefault(); void railAdvance(railOpen); return }
        void handleSubmit(onSubmit, invalid => { setShowErrors(true); requestAnimationFrame(() => railError(invalid)) })(event)
      }} className={cn(shell, 'bf--rail')} data-step={step} data-rail="">
      {/* Keep this node mounted and empty before the first estimate. Only its text changes. */}
      <p data-estimate-announcement className="sr-only" aria-live="polite" aria-atomic="true">{estimateText}</p>
      <div className="hidden" aria-hidden="true"><label>Website<input type="text" tabIndex={-1} autoComplete="off" {...register('website')} /></label></div>
      <div className="bf__rail-top">
        <p className="bf__rail-intro">Tap an answer and the next question opens. Your guide price shows after the size.</p>
        {railSeen.size > 0 && <button type="button" className="bf__restart" onClick={railStartOver}>Start again</button>}
      </div>
      <ol className="bf-rail">{railList.map(railStep)}</ol>
      <div className="bf__foot">
        <p>Questions first? <a href={formWhatsappHref(values, railGuide || undefined)} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>, and what you’ve chosen so far comes with it.</p>
      </div>
    </form>
  )

  return (
    <form ref={formRef} noValidate aria-label="Exact quote enquiry" aria-busy={status === 'submitting'}
      onChangeCapture={start} onSubmit={event => {
        if (step < LAST) { event.preventDefault(); void next(); return }
        void handleSubmit(onSubmit, () => { setShowErrors(true); setRefusals(n => n + 1) })(event)
      }} className={shell} data-step={step}>
      <div className="bf__head">
        <h2 ref={headingRef} tabIndex={-1} className="bf__h">{TITLES[step - 1]}</h2>
        <p className="bf__count">Step {stepAt} of {stepCount}</p>
      </div>
      <div aria-hidden="true" className="bf__progress"><div style={{ transform: `translateX(${(stepAt / stepCount - 1) * 100}%)` }} /></div>

      {/* Keep this node mounted and empty before the first estimate. Only its text changes. */}
      <p data-estimate-announcement className="sr-only" aria-live="polite" aria-atomic="true">{estimateText}</p>
      {step > 1 && estimateText && <div data-estimate-summary className="bf__summary">
        <p><b>{estimateText}</b></p>
        <p className="mt-0.5">{serviceLabel(selectedService)}{values.dwellingType && !isBulk ? ` · ${values.dwellingType}` : ''}{values.customerType ? ` · ${values.customerType}` : ''}{speed === SAME_DAY_LODGEMENT_SPEED ? ' · same-day lodgement' : speed === NEXT_DAY_VISIT_SPEED ? ' · next-day visit and lodgement' : ''}{estimate.improvementPlan ? ' · Improvement Plan' : ''}{estimate.energyReport ? ' · separate energy report' : ''}</p>
        <button type="button" className="bf__change" onClick={() => { moveFocus.current = true; setStep(1) }}>Change</button>
      </div>}

      <div className="hidden" aria-hidden="true"><label>Website<input type="text" tabIndex={-1} autoComplete="off" {...register('website')} /></label></div>

      <div className="bf__body" key={step}>{stepBody}</div>

      <div className="bf__nav">
        {step > 1 && <button type="button" disabled={status === 'submitting'} className={`${controlClass} gap-1.5 border border-secondary-400 text-secondary-900`} onClick={() => { moveFocus.current = true; setStep(step === LAST && isBulk ? 1 : step - 1) }}><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back</button>}
        {/* Distinct keys: the Continue button must not be reused as the Send button, or the
            click that advances to the last step also counts as a submit of the empty details. */}
        {step < LAST ? <button key={`continue-${step}`} type="button" onClick={() => void next()} className="bf__go">{step === LAST - 1 ? 'Continue to your details' : 'Continue'}<ArrowRight aria-hidden="true" className="h-4 w-4" /></button> :
          <button key="send" type="submit" disabled={status === 'submitting' || (!FORM_DRAFT && !turnstileToken)} className="bf__go">{status === 'submitting' ? 'Sending…' : 'Send my quote request'}</button>}
      </div>
      {/* who replies and how fast, under the send button (live wording) */}
      {step === LAST && <p className="bf__reply"><b>Same working-day reply</b>, with your exact price and available times.</p>}
      {step === LAST && <p className="bf__promise"><b>Our promise:</b> £{promise.lateLodgement} off if your EPC isn’t on the register within 72 hours of the visit, £{promise.lateChange} off if we move your visit with less than 24 hours’ notice. <a href="/terms#our-promise">How it works</a></p>}
      <div className="bf__foot">
        <p>Questions first? <a href={formWhatsappHref(values, estimate.state === 'priced' && estimate.total !== null ? guidePrice(estimate, estimate.total) : undefined)} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>, and what you’ve chosen so far comes with it.</p>
      </div>
    </form>
  )
}
