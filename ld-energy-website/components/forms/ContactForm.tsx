'use client'

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { usePathname } from 'next/navigation'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft, ArrowRight, Building2, Check, ClipboardList, HelpCircle, House, KeyRound, Mail, MessageCircle,
  Phone, ShieldAlert, Signpost, WifiOff, type LucideIcon,
} from 'lucide-react'
import { Field, Input, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { pricing, site, maxBundleSaving, formatPrice, EXPRESS_SURCHARGE } from '@/lib/site'
import { areaBands, areaLabel, bandForArea, parseExactArea, TOP_BAND } from '@/lib/floor-area'
import { guideEstimate, guideEstimateRows, guidePrice, PLAN_LABEL, ENERGY_REPORT_LABEL } from '@/lib/pricing-estimate'
import {
  turnaroundCopy, includedList, contactStepIntro, serviceChoices, serviceLabel, customerTypeChoices, nextSteps,
  hasPrepChecklist, PREP_PATH, formatPreferredDate, enquirySummaryText, type BadgeTone,
} from '@/lib/booking-copy'
import { parseQuoteContext, quoteContextFromForm, quoteHref, quoteServices } from '@/lib/quote-context'
import { conversionEvent } from '@/lib/conversion-events'
import { ctaIds, customerTypeForSource, sourcePageForPath, type SourcePage, type CtaId } from '@/lib/enquiry-attribution'
import { restoredCustomerType, rememberCustomerType } from '@/lib/customer-type-history'
import { useTurnstile } from '@/lib/useTurnstile'
import { usePublishQuote } from '@/components/forms/QuoteSummary'
import { useOptionalHomeQuote } from '@/components/sections/home/HomeQuoteContext'
import { contactSchema, BULK, PRE_ASSESSMENT, EXPRESS_SPEED, type ContactInput } from '@/lib/validators'
import { FORM_DRAFT } from '@/lib/form-layout'

/**
 * Which fields each step validates before moving on: the taps and price, then timing and
 * access. The final step (details) is validated by the whole schema on submit.
 */
const QUOTE_FIELDS: (keyof ContactInput)[] = ['customerType', 'services', 'areaBand', 'floorArea', 'floorAreaUnknown', 'improvementPlan', 'energyReport']
const TITLES = ['Your guide price', 'Timing and access', 'Your details']
const GATES: (keyof ContactInput)[][] = [QUOTE_FIELDS, ['speed', 'preferredDate', 'notes']]
const LAST = TITLES.length

const controlClass = 'inline-flex min-h-[48px] items-center justify-center rounded-lg px-4 py-3 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:opacity-60'
const badgeClass: Record<BadgeTone, string> = { green: 'bg-accent-600', navy: 'bg-primary-700' }
const customerIcons: Record<string, LucideIcon> = {
  'Homeowner': House, 'Landlord (tenanted)': KeyRound, 'Estate agent': Signpost, 'Letting agent / firm': Building2,
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
}

/**
 * Native radio group drawn as cards. The radio covers its card invisibly, so keyboard,
 * screen-reader and click behaviour stay native while the dot itself is not drawn.
 */
function Choices({ name, legend, value, onChange, options, error, hint, inputRef }: ChoiceProps) {
  const hintId = hint ? `${name}-hint` : ''
  const errorId = error ? `${name}-error` : ''
  return (
    <fieldset className="min-w-0" aria-invalid={!!error} aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}>
      <legend className="bf__legend">{legend}</legend>
      {hint && <p id={hintId} className="bf__sub">{hint}</p>}
      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
        {options.map((option, index) => {
          const selected = value === option.value
          return (
            <label key={option.value} className={cn('bf-tile bf-tile--row', option.fullRow && 'col-span-full')} data-checked={selected || undefined}>
              <input type="radio" name={name} value={option.value} checked={selected}
                id={`${name}-${index}`} ref={index === 0 ? inputRef : undefined}
                onChange={() => onChange(option.value)} required
                aria-label={option.label} aria-describedby={[hintId, option.description ? `${name}-description-${index}` : '', errorId].filter(Boolean).join(' ') || undefined}
                className="bf-radio" />
              {selected && <Check aria-hidden="true" strokeWidth={3} className="bf-tile__check" />}
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 pr-4 text-[15px] font-semibold leading-snug text-secondary-900">
                {option.label}
                {option.badge && <span className={cn('rounded px-1.5 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-white', badgeClass[option.badgeTone || 'green'])}>{option.badge}</span>}
              </span>
              {option.description && <span id={`${name}-description-${index}`} className="mt-0.5 block text-sm leading-snug text-secondary-600">{option.description}</span>}
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

function RequestSent({ data, confirmationSent, focusRef, onReset }: {
  data: ContactInput; confirmationSent: boolean; focusRef: RefObject<HTMLDivElement | null>; onReset: () => void
}) {
  const estimate = guideEstimate(data)
  const kind = estimate.productKind
  const firstName = data.name.trim().split(/\s+/)[0]
  const rows: [string, string][] = [
    ['Service', data.services.map(serviceLabel).join(' + ')],
    estimate.isBulk ? ['Properties', data.propertyCount || 'To be confirmed'] : ['Floor area', areaLabel(data.areaBand, data.floorArea)],
    ...(estimate.improvementPlan ? [[PLAN_LABEL, `+£${estimate.improvementPlan}`] as [string, string]] : []),
    ...(estimate.energyReport ? [[ENERGY_REPORT_LABEL, 'Included at no extra charge'] as [string, string]] : []),
    ['Guide estimate', estimate.state === 'priced' && estimate.total !== null ? guidePrice(estimate, estimate.total) : estimate.isBulk ? 'Quoted individually' : 'Price to be confirmed'],
    ...(data.preferredDate ? [['Preferred date', formatPreferredDate(data.preferredDate)] as [string, string]] : []),
  ]
  return (
    <div ref={focusRef} tabIndex={-1} aria-labelledby="request-sent-heading" className="bf__sent">
      {FORM_DRAFT && <p className="bf__draft">Draft preview: nothing was sent. On the live site this is where the customer lands.</p>}
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white">
          <Check aria-hidden="true" strokeWidth={3} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 id="request-sent-heading" className="text-2xl font-bold leading-tight text-secondary-900">Request sent. Thanks, {firstName}.</h2>
          {confirmationSent && <p className="mt-1.5 text-base text-secondary-700">We’ve emailed a copy to <strong className="font-semibold text-secondary-900">{data.email}</strong>.</p>}
        </div>
      </div>

      <h3 className="mt-6 text-lg font-semibold">What happens next</h3>
      <ol className="mt-3 space-y-3">
        {nextSteps(kind, data.speed, estimate.energyReport).map((step, index) => (
          <li key={step} className="flex gap-3 text-base leading-relaxed text-secondary-700">
            <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-900 text-xs font-bold text-white">{index + 1}</span>
            <span className="min-w-0">{step}</span>
          </li>
        ))}
      </ol>

      <dl className="mt-6 divide-y divide-secondary-100 rounded-lg border border-secondary-200 px-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-sm">
            <dt className="text-secondary-600">{label}</dt>
            <dd className="text-right font-semibold text-secondary-900">{value}</dd>
          </div>
        ))}
      </dl>

      {hasPrepChecklist(kind) && (
        <a href={PREP_PATH} className="group mt-4 flex items-center gap-3 rounded-lg border border-accent-200 bg-accent-50 p-4 text-secondary-900 hover:border-accent-400">
          <ClipboardList aria-hidden="true" className="h-6 w-6 shrink-0 text-accent-700" />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Before your visit</span>
            <span className="block text-sm text-secondary-700">What to have ready, so nothing needs a second visit.</span>
          </span>
          <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-accent-700 lg:transition-transform lg:group-hover:translate-x-0.5" />
        </a>
      )}
      {!estimate.isBulk && data.customerType === 'Landlord (tenanted)' && (
        <p className="mt-4 text-sm text-secondary-700"><strong className="font-semibold text-secondary-900">Tenanted property?</strong> Please let your tenants know about the visit.</p>
      )}

      <div className="mt-6 border-t border-secondary-200 pt-5">
        <p className="text-sm font-semibold text-secondary-900">Need anything sooner?</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a href={site.phoneHref} className={`${controlClass} gap-2 border border-secondary-300 text-secondary-900`}>
            <Phone aria-hidden="true" className="h-5 w-5 text-accent-700" />Call {site.phone}
          </a>
          <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className={`${controlClass} gap-2 border border-secondary-300 text-secondary-900`}>
            <MessageCircle aria-hidden="true" className="h-5 w-5 text-accent-700" />WhatsApp
          </a>
        </div>
        <button type="button" className="mt-3 inline-flex min-h-[44px] items-center text-sm font-semibold text-primary-800 underline underline-offset-4" onClick={onReset}>Send another request</button>
      </div>
    </div>
  )
}

/** Focus with an offset measured from the actual floating header, including when enlarged. */
function focusBookingElement(element: HTMLElement | null) {
  if (!element) return
  const header = document.querySelector('header')
  const offset = (header?.getBoundingClientRect().height || 80) + 16
  element.style.scrollMarginTop = `${offset}px`
  element.focus({ preventScroll: true })
  element.scrollIntoView({ block: 'start', behavior: 'instant' })
}

export type FormVariant = 'hero' | 'page' | 'area'

export function ContactForm({ areaPage, sourcePage, variant = 'page' }: { areaPage?: string; sourcePage?: SourcePage; variant?: FormVariant }) {
  const pathname = usePathname()
  const dedicated = pathname === '/contact'
  const home = useOptionalHomeQuote()
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [problem, setProblem] = useState<SendProblem | null>(null)
  const [sent, setSent] = useState<{ data: ContactInput; confirmationSent: boolean } | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  // The shared floor-area field. "Over 115 m²" opens it; any other band opens it on request. Once
  // the customer types, it stays open even when their figure moves them to a smaller band.
  const [areaOpen, setAreaOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const started = useRef(false)
  const submitting = useRef(false)
  const moveFocus = useRef(false)
  const initialised = useRef(false)
  const serviceTouched = useRef(false)
  const quietReset = useRef(false)
  const defaultCta: CtaId = variant === 'hero' ? 'hero-form' : dedicated ? 'direct' : 'embedded'
  const { register, handleSubmit, control, reset, watch, getValues, setValue, trigger, clearErrors, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    shouldFocusError: false,
    defaultValues: {
      name: '', phone: '', email: '', address: '', postcode: '', services: ['EPC Certificate'],
      areaBand: '', floorArea: '', floorAreaUnknown: false, customerType: '', improvementPlan: false, energyReport: false, speed: 'Standard (72 hours)',
      areaPage, sourcePage: sourcePage || sourcePageForPath(pathname), ctaId: defaultCta,
      propertyCount: '', preferredDate: '', notes: '', website: '', turnstileToken: FORM_DRAFT ? 'draft-preview' : '', consent: false,
    },
  })

  useEffect(() => {
    if (initialised.current) return
    initialised.current = true
    let initialSource = sourcePage || sourcePageForPath(pathname)
    if (dedicated) {
      const context = parseQuoteContext(new URLSearchParams(window.location.search))
      setValue('services', [quoteServices[context.service || 'epc']])
      if (context.service) serviceTouched.current = true
      setValue('areaBand', context.area || '')
      setValue('speed', context.speed === 'express' ? EXPRESS_SPEED : 'Standard (72 hours)')
      setValue('improvementPlan', !!context.plan)
      initialSource = context.sourcePage || initialSource
      setValue('sourcePage', initialSource)
      setValue('ctaId', context.ctaId || 'direct')
    }
    const customerType = restoredCustomerType(window.history.state) ?? customerTypeForSource(initialSource)
    // Homeowner is not offered on a portfolio enquiry, so it must not arrive pre-selected either.
    setValue('customerType', getValues('services').includes(BULK) && customerType === 'Homeowner' ? '' : customerType)
    if (dedicated && window.location.hash === '#booking-form') focusBookingElement(document.getElementById('booking-form'))
    // URL context seeds a new form only. Browser history must never overwrite edits.
  }, [dedicated, pathname, sourcePage, setValue, getValues])

  // A "See my price" button further down the homepage picks a service in this card.
  const request = home?.request
  useEffect(() => {
    if (!request || variant !== 'hero') return
    serviceTouched.current = true
    setValue('services', [quoteServices[request.service]])
    // The same rules as choosing a tab: no hidden add-on survives a change of service.
    if (request.service !== 'epc' && request.service !== 'bundle') { setValue('speed', 'Standard (72 hours)'); setValue('improvementPlan', false) }
    setValue('energyReport', false)   // the homepage's buttons never pick the Pre-Assessment
    if (status !== 'success') { moveFocus.current = true; setStep(1) }
  }, [request, variant, setValue, status])

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

  const { containerRef: turnstileRef, token: turnstileToken, isLoading: turnstileLoading, error: turnstileError, reset: resetTurnstile } = useTurnstile({
    enabled: !FORM_DRAFT && step === LAST && status !== 'success',
    onVerify: token => setValue('turnstileToken', token, { shouldValidate: true }),
    onExpire: () => setValue('turnstileToken', '', { shouldValidate: !quietReset.current }),
    onError: () => setValue('turnstileToken', '', { shouldValidate: true }),
  })
  const values = watch()
  const estimate = guideEstimate(values)
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

  function focusError(errorFields: FieldErrors<ContactInput>) {
    // Follow visible DOM order; the schema's object-key order is not the user's reading order.
    const names = new Set(Object.keys(errorFields))
    const input = Array.from(formRef.current?.querySelectorAll<HTMLElement>('input, textarea, button') || [])
      .find(element => names.has(element.getAttribute('name') || '') && element.getClientRects().length > 0)
    focusBookingElement(input || document.getElementById('security-check'))
  }

  async function next() {
    start()
    if (await trigger(GATES[step - 1])) {
      conversionEvent('form_step_complete', { ...quoteContextFromForm(getValues()), step })
      moveFocus.current = true; setStep(step + 1)
    } else {
      requestAnimationFrame(() => {
        const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
        focusBookingElement(invalid?.querySelector<HTMLElement>('input') || invalid || headingRef.current)
      })
    }
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
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
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

  const shell = cn('bf', variant === 'hero' ? 'bf--hero' : 'bf--page')

  if (status === 'success' && sent) return (
    <div className={shell}>
      <RequestSent data={sent.data} confirmationSent={sent.confirmationSent} focusRef={successRef} onReset={() => {
        reset(); started.current = false; serviceTouched.current = false; setAreaOpen(false); setSent(null); setStatus('idle'); moveFocus.current = true; setStep(1)
        rememberCustomerType('', window.history)
        if (dedicated) window.history.replaceState(window.history.state, '', quoteHref())
      }} />
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
    // A typed figure stays only while it agrees with the chosen size, so picking another size clears it.
    const typed = getValues('floorArea'), exact = parseExactArea(typed)
    if (typed && (exact === undefined || bandForArea(exact) !== value)) { setValue('floorArea', ''); clearErrors('floorArea') }
    if (value !== TOP_BAND) setValue('floorAreaUnknown', false)
    else clearErrors('floorArea')
    rememberSelection(); conversionEvent('estimator_use', quoteContextFromForm(getValues()))
  }
  const sizeNote = errors.floorArea?.message || ((parseExactArea(floorArea) ?? 0) > 300 ? 'That is a very large home. If your figure is in square feet, divide it by 10.76 to get m².' : '')
  const baseTotal = (band: string) => guideEstimate({ services: values.services, areaBand: band })
  const bandIndex = areaBands.indexOf(values.areaBand as (typeof areaBands)[number])
  const band = bandIndex >= 0 ? pricing[bandIndex] : undefined
  const onTopBand = values.areaBand === TOP_BAND
  const showArea = areaOpen || onTopBand || !!floorArea

  const planChoice = canHavePlan && !planIncluded && (
    <label className="bf-check bf-check--offer">
      <input type="checkbox" className="bf-check__box" {...register('improvementPlan', { onChange: rememberSelection })} />
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
  const areaField = (
    <div className="bf__area">
      <label htmlFor="floorArea" className="bf__area-label">{onTopBand ? 'Approximate internal floor area' : 'Internal floor area'}</label>
      <p id="floorArea-help" className="bf__sub">{onTopBand ? 'Include all floors. An estimate is fine.' : 'Enter the size if known. An estimate is fine.'}</p>
      <div className="bf__area-row">
        <div className="relative w-36">
          <Input id="floorArea" inputMode="decimal" autoComplete="off" maxLength={10} placeholder={onTopBand ? 'e.g. 145' : 'e.g. 84'}
            aria-invalid={!!errors.floorArea} aria-describedby={['floorArea-help', sizeNote ? 'floorArea-note' : ''].filter(Boolean).join(' ')} hasError={!!errors.floorArea} className="pr-10"
            {...register('floorArea', {
              onChange: event => {
                setAreaOpen(true)
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
      {sizeNote && <p id="floorArea-note" role={errors.floorArea ? 'alert' : undefined} className={cn('mt-1.5 text-sm', errors.floorArea ? 'text-red-700' : 'text-secondary-600')}>{sizeNote}</p>}
    </div>
  )

  const quoteStep = (
    <div className="bf__quote">
      <Controller control={control} name="customerType" render={({ field }) => (
        <fieldset className="min-w-0" aria-invalid={!!errors.customerType} aria-describedby={errors.customerType ? 'customerType-error' : undefined}>
          <legend className="bf__legend">Which best describes you?</legend>
          <div className="bf__who">
            {customerTypeChoices(isBulk).map((option, index) => {
              const Icon = customerIcons[option.value] || House
              const checked = field.value === option.value
              return (
                <label key={option.value} className="bf-tile bf-tile--who" data-checked={checked || undefined}>
                  <input type="radio" name="customerType" value={option.value} checked={checked} required className="bf-radio"
                    ref={index === 0 ? field.ref : undefined} aria-label={option.label} aria-describedby={`customerType-d-${index}`}
                    onChange={() => {
                      field.onChange(option.value)
                      rememberCustomerType(option.value as ContactInput['customerType'], window.history)
                      // An agent instructing on a sale usually needs the floor plan too; only a default.
                      if (!serviceTouched.current && option.value === 'Estate agent') chooseService('Both (Bundle)')
                    }} />
                  <span aria-hidden="true" className="bf-tile__ico"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0"><b>{option.label}</b><span id={`customerType-d-${index}`} className="bf-tile__d">{option.description}</span></span>
                  {checked && <Check aria-hidden="true" strokeWidth={3} className="bf-tile__check" />}
                </label>
              )
            })}
          </div>
          {errors.customerType && <p id="customerType-error" role="alert" className="mt-2 text-sm text-red-700">{errors.customerType.message}</p>}
        </fieldset>
      )} />

      <fieldset className="min-w-0" aria-invalid={!!errors.services} aria-describedby={errors.services ? 'services-error' : undefined}>
        <legend className="bf__legend">Which service?</legend>
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
              </label>
            )
          })}
        </div>
        <p className="bf__sub">{serviceChoices.find(choice => choice.value === selectedService)?.description}</p>
        {errors.services && <p id="services-error" role="alert" className="mt-2 text-sm text-red-700">{errors.services.message}</p>}
      </fieldset>

      <div className="bf__calc">
        <div className="min-w-0">
          {isBulk ? (
            <p className="bf__note">A single floor area does not apply to several properties. We&rsquo;ll ask roughly how many on the next step, and quote them individually.</p>
          ) : (
            <fieldset className="min-w-0" aria-invalid={!!errors.areaBand} aria-describedby={['areaBand-hint', errors.areaBand ? 'areaBand-error' : ''].filter(Boolean).join(' ')}>
              <legend className="bf__legend">How big is the property?</legend>
              <p id="areaBand-hint" className="bf__sub">Choose the approximate internal floor area. Not sure? We can confirm it from your property details.</p>
              <div className="bf__sizes">
                {areaBands.map((b, i) => {
                  const checked = values.areaBand === b
                  const row = baseTotal(b)
                  const price = row.baseGuide !== null ? guidePrice(row, row.baseGuide) : ''
                  return (
                    <div key={b} className="contents">
                      <label className="bf-tile bf-tile--size" data-checked={checked || undefined}>
                        <input type="radio" name="areaBand" value={b} checked={checked} required className="bf-radio"
                          aria-label={`${pricing[i].areaLabel}${price ? `, ${price}` : ''}`}
                          onChange={() => chooseArea(b)} />
                        <span className="bf-size__top"><b>{pricing[i].areaLabel}</b>{price && <span className="tabular-nums">{price}</span>}</span>
                      </label>
                      {b === TOP_BAND && showArea && areaField}
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
              {!showArea && (
                <button type="button" className="bf__more"
                  onClick={() => { setAreaOpen(true); requestAnimationFrame(() => document.getElementById('floorArea')?.focus()) }}>
                  Know the exact size? Enter it in m²
                </button>
              )}
              {errors.areaBand && <p id="areaBand-error" role="alert" className="mt-2 text-sm text-red-700">{errors.areaBand.message}</p>}
            </fieldset>
          )}
        </div>

        <div className="bf__est" data-estimate>
          <p className="bf__est-label">Estimated guide price</p>
          {isBulk ? (
            <><p className="bf__price"><b>Quote</b></p><p className="bf__for">Several properties are quoted individually.</p></>
          ) : estimate.state === 'priced' && band && estimate.total !== null ? (
            <>
              <p className="bf__price">{estimate.isStartingPrice && <small>From</small>}<b data-price className="tabular-nums">£{formatPrice(estimate.total)}</b><span>{isLodged || productKind === 'preAssessment' ? 'inc. assessment' : 'inc. on-site measuring'}{isLodged ? ' and GOV.UK lodgement' : ''}</span></p>
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
            <><p className="bf__price"><small>From</small><b data-price className="tabular-nums">£{formatPrice(estimate.fromTotal ?? 0)}</b></p><p className="bf__for">Pick a size for your guide price.</p></>
          )}
          {(planChoice || reportChoice) && <div className="bf__extras">
            {planChoice}
            {reportChoice}
          </div>}
          {planIncluded && estimate.state === 'awaiting-area' && <p className="bf__note mt-3">Your personalised written improvement plan is included in the price.</p>}
          <p className="bf__fine"><Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[#386B59]" />No upfront payment. You pay once the assessment is done.</p>
          <p className="bf__fine bf__fine--quiet">Exact price and appointment confirmed before booking.</p>
        </div>
      </div>
      {values.customerType === 'Landlord (tenanted)' && <p className="bf__note">Please let your tenants know about the visit and include any access arrangements in the notes.</p>}
    </div>
  )

  /* ------------------------------------------------------------- timing and details */
  const timingFields = <>
    {isLodged ? <Controller control={control} name="speed" render={({ field }) => <Choices name="speed" legend="Lodgement speed"
      value={field.value} inputRef={field.ref} error={errors.speed?.message} onChange={value => { field.onChange(value); rememberSelection() }} options={[
        { value: 'Standard (72 hours)', label: 'Standard lodgement', description: 'Lodged on the GOV.UK register within 72 hours of the visit.' },
        { value: EXPRESS_SPEED, label: `Next-day lodgement (+£${EXPRESS_SURCHARGE})`, description: 'Lodged within 24 hours of the visit.' },
      ]} />} /> : <p className="text-base text-secondary-700">{turnaroundCopy(productKind)}</p>}
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
      {!isBulk && <Field label="Preferred visit date" htmlFor="preferredDate" hint="Optional. Next-day appointments are available. A requested date is not a confirmed appointment." error={errors.preferredDate?.message}>
        <Input id="preferredDate" type="date" {...register('preferredDate')} />
      </Field>}
      <Field label="Access notes or other instructions" htmlFor="notes" hint="Optional. Access, parking or anything about the property." error={errors.notes?.message} className={isBulk ? 'sm:col-span-2' : undefined}>
        <Textarea id="notes" rows={2} {...register('notes')} />
      </Field>
    </div>
  </>

  const detailFields = <>
    <p className="text-base text-secondary-700">{contactStepIntro(productKind)}</p>
    <p className="text-sm text-secondary-700">Fields marked * are required.</p>
    {showErrors && Object.keys(errors).length > 0 && <div role="alert" className="rounded-lg border border-danger p-3 text-sm text-red-700">
      <p className="font-semibold">Please check the following:</p>
      <ul>{Object.entries(errors).map(([name, error]) => <li key={name}><a href={`#${name === 'turnstileToken' ? 'security-check' : name}`} className="inline-block py-2 underline" onClick={event => {
        event.preventDefault(); focusBookingElement(document.getElementById(name === 'turnstileToken' ? 'security-check' : name))
      }}>{error?.message}</a></li>)}</ul>
    </div>}
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Full name" htmlFor="name" required error={errors.name?.message}><Input id="name" autoComplete="name" {...register('name')} /></Field>
      <Field label="Phone number" htmlFor="phone" required error={errors.phone?.message}><Input id="phone" type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} /></Field>
      <Field label="Email address" htmlFor="email" required error={errors.email?.message} className="sm:col-span-2"><Input id="email" type="email" inputMode="email" autoComplete="email" {...register('email')} /></Field>
      {isBulk && <Field label="How many properties?" htmlFor="propertyCount" required error={errors.propertyCount?.message} hint="A rough number is fine." className="sm:col-span-2"><Input id="propertyCount" placeholder="e.g. 12, or 20+" {...register('propertyCount')} /></Field>}
      <Field label={isBulk ? 'Properties and postcodes' : 'Property address'} htmlFor="address" required={!isBulk} error={errors.address?.message}
        hint={isBulk ? 'Optional. Paste a list if you have one, or supply it later.' : undefined} className="sm:col-span-2">
        <Textarea id="address" rows={isBulk ? 5 : 2} autoComplete={isBulk ? 'off' : 'street-address'} {...register('address')} />
      </Field>
      {!isBulk && <Field label="Postcode" htmlFor="postcode" required error={errors.postcode?.message}><Input id="postcode" autoComplete="postal-code" {...register('postcode')} /></Field>}
    </div>
  </>

  const sendFields = <>
    <label className="flex min-h-[48px] cursor-pointer items-start gap-3 py-2 text-base">
      <input id="consent" type="checkbox" required aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-error' : undefined} className="mt-1 h-5 w-5 shrink-0 accent-primary-700" {...register('consent')} />
      <span>I agree to be contacted about my enquiry. We only use your details for this request. Read our <a href="/privacy-policy" className="underline">privacy policy</a>.</span>
    </label>
    {errors.consent && <p id="consent-error" role="alert" className="text-sm text-red-700">{errors.consent.message}</p>}
    {FORM_DRAFT ? <p className="bf__draft">Draft preview: the security check is skipped and nothing is sent.</p> : (
      <div id="security-check" tabIndex={-1} aria-describedby={errors.turnstileToken ? 'turnstileToken-error' : undefined}>
        <p className="mb-2 text-sm font-semibold">Security check</p>
        <div ref={turnstileRef} className="min-w-0" />
        {turnstileLoading && <p role="status" className="text-sm">Loading security check…</p>}
        {turnstileError && <div role="alert" className="text-sm text-red-700"><p>The security check could not complete. Check your connection and try again.</p><button type="button" className={`${controlClass} underline`} onClick={resetTurnstile}>Retry security check</button></div>}
        {errors.turnstileToken && <p id="turnstileToken-error" role="alert" className="text-sm text-red-700">{errors.turnstileToken.message}</p>}
      </div>
    )}
    {problem && <SendProblemNotice problem={problem} summary={enquirySummaryText(values)} />}
  </>

  const stepBody: ReactNode = step === 1 ? quoteStep
    : step === 2 ? <div className="bf__details">{timingFields}</div>
      : <div className="bf__details">{detailFields}{sendFields}</div>

  return (
    <form ref={formRef} noValidate aria-label="Exact quote enquiry" aria-busy={status === 'submitting'}
      onChangeCapture={start} onSubmit={event => {
        if (step < LAST) { event.preventDefault(); void next(); return }
        void handleSubmit(onSubmit, invalid => { setShowErrors(true); requestAnimationFrame(() => focusError(invalid)) })(event)
      }} className={shell} data-step={step}>
      <div className="bf__head">
        <h2 ref={headingRef} tabIndex={-1} className="bf__h">{TITLES[step - 1]}</h2>
        <p className="bf__count">Step {step} of {LAST}</p>
      </div>
      <div aria-hidden="true" className="bf__progress"><div style={{ transform: `translateX(${(step / LAST - 1) * 100}%)` }} /></div>

      {/* Keep this node mounted and empty before the first estimate. Only its text changes. */}
      <p data-estimate-announcement className="sr-only" aria-live="polite" aria-atomic="true">{estimateText}</p>
      {step > 1 && estimateText && <div data-estimate-summary className="bf__summary">
        <p><b>{estimateText}</b></p>
        <p className="mt-0.5">{serviceLabel(selectedService)}{values.customerType ? ` · ${values.customerType}` : ''}{speed === EXPRESS_SPEED ? ' · next-day lodgement' : ''}{estimate.improvementPlan ? ' · Improvement Plan' : ''}{estimate.energyReport ? ' · separate energy report' : ''}</p>
        <button type="button" className="bf__change" onClick={() => { moveFocus.current = true; setStep(1) }}>Change</button>
      </div>}

      <div className="hidden" aria-hidden="true"><label>Website<input type="text" tabIndex={-1} autoComplete="off" {...register('website')} /></label></div>

      <div className="bf__body">{stepBody}</div>

      <div className="bf__nav">
        {step > 1 && <button type="button" disabled={status === 'submitting'} className={`${controlClass} gap-1.5 border border-secondary-400 text-secondary-900`} onClick={() => { moveFocus.current = true; setStep(step - 1) }}><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back</button>}
        {/* Distinct keys: the Continue button must not be reused as the Send button, or the
            click that advances to the last step also counts as a submit of the empty details. */}
        {step < LAST ? <button key={`continue-${step}`} type="button" onClick={() => void next()} className="bf__go">{step === LAST - 1 ? 'Continue to your details' : 'Continue'}<ArrowRight aria-hidden="true" className="h-4 w-4" /></button> :
          <button key="send" type="submit" disabled={status === 'submitting' || (!FORM_DRAFT && !turnstileToken)} className="bf__go">{status === 'submitting' ? 'Sending…' : 'Send my quote request'}</button>}
      </div>
      <div className="bf__foot">
        <details className="min-w-0"><summary className="cursor-pointer py-3 font-semibold">What’s included</summary><ul className="mb-2 list-disc space-y-2 pl-5">{includedList(productKind).map(item => <li key={item}>{item}</li>)}</ul></details>
        <p>Need help? <a href={site.phoneHref} className="inline-flex min-h-[44px] items-center px-2 underline lg:px-0">Call</a> or <a href={site.whatsappHref} className="inline-flex min-h-[44px] items-center px-2 underline lg:px-0">WhatsApp</a>.</p>
      </div>
    </form>
  )
}
