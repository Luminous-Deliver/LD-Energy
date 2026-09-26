'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { usePathname } from 'next/navigation'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Check, ClipboardList, Mail, MessageCircle, Phone, ShieldAlert, WifiOff } from 'lucide-react'
import { Field, Input, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { pricing, site, EXPRESS_SURCHARGE } from '@/lib/site'
import { areaBands, areaLabel, bandForArea, parseExactArea } from '@/lib/floor-area'
import { guideEstimate, guideEstimateRows } from '@/lib/pricing-estimate'
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
import { contactSchema, BULK, EXPRESS_SPEED, type ContactInput } from '@/lib/validators'

const STEP_TITLES = ['Service and property', 'Timing and access', 'Your details']
const controlClass = 'inline-flex min-h-[48px] items-center justify-center rounded-lg px-4 py-3 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:opacity-60'
const badgeClass: Record<BadgeTone, string> = { green: 'bg-accent-600', navy: 'bg-primary-700' }

interface ChoiceOption {
  value: string; label: string; description?: string; badge?: string; badgeTone?: BadgeTone; fullRow?: boolean
}

interface ChoiceProps {
  name: string; legend: string; value: string; onChange: (value: string) => void
  options: ChoiceOption[]
  error?: string; hint?: string; inputRef?: (element: HTMLInputElement | null) => void
  /** Extra grid classes, e.g. floor-area columns. */
  gridClassName?: string
  /** Centred tiles for short, scannable values such as floor-area bands. */
  tiles?: boolean
}

/**
 * Native radio group drawn as cards. The radio covers its card invisibly, so keyboard,
 * screen-reader and click behaviour stay native while the dot itself is not drawn.
 */
function Choices({ name, legend, value, onChange, options, error, hint, inputRef, gridClassName, tiles }: ChoiceProps) {
  const hintId = hint ? `${name}-hint` : ''
  const errorId = error ? `${name}-error` : ''
  return (
    <fieldset className="min-w-0" aria-invalid={!!error} aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}>
      <legend className="font-serif text-lg font-semibold leading-snug text-secondary-900">{legend}</legend>
      {hint && <p id={hintId} className="mt-0.5 text-sm text-secondary-600">{hint}</p>}
      <div className={cn('mt-2.5 grid gap-2.5 sm:grid-cols-2', gridClassName)}>
        {options.map((option, index) => {
          const selected = value === option.value
          const inline = tiles && option.fullRow
          return (
            <label key={option.value} className={cn(
              'relative flex min-h-[48px] min-w-0 cursor-pointer flex-col justify-center rounded-lg border px-3.5 py-2.5',
              'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-700',
              tiles && 'items-center px-2 text-center',
              inline && 'sm:flex-row sm:flex-wrap sm:gap-x-2',
              option.fullRow && 'col-span-full',
              selected ? 'border-primary-700 bg-primary-50 ring-1 ring-primary-700' : 'border-secondary-300 bg-white lg:transition-colors lg:hover:border-primary-500',
            )}>
              <input type="radio" name={name} value={option.value} checked={selected}
                id={`${name}-${index}`} ref={index === 0 ? inputRef : undefined}
                onChange={() => onChange(option.value)} required
                aria-label={option.label} aria-describedby={[hintId, option.description ? `${name}-description-${index}` : '', errorId].filter(Boolean).join(' ') || undefined}
                className="absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-lg opacity-0" />
              {selected && <Check aria-hidden="true" strokeWidth={3} className="pointer-events-none absolute right-1.5 top-1.5 h-3.5 w-3.5 text-primary-700" />}
              <span className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold leading-snug text-secondary-900', tiles ? 'justify-center' : 'pr-4')}>
                {option.label}
                {option.badge && <span className={cn('rounded px-1.5 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-white', badgeClass[option.badgeTone || 'green'])}>{option.badge}</span>}
              </span>
              {option.description && <span id={`${name}-description-${index}`} className={cn('block text-sm leading-snug text-secondary-600', !inline && 'mt-0.5')}>{option.description}</span>}
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
    ['Guide estimate', estimate.state === 'priced' ? `£${estimate.total}` : estimate.isBulk ? 'Quoted individually' : 'Confirmed after review'],
    ...(data.preferredDate ? [['Preferred date', formatPreferredDate(data.preferredDate)] as [string, string]] : []),
  ]
  return (
    <div ref={focusRef} tabIndex={-1} aria-labelledby="request-sent-heading" className="min-w-0 rounded-xl border border-secondary-200 bg-white p-5 [overflow-wrap:anywhere] sm:p-6 lg:rounded-2xl lg:p-7 lg:shadow-premium">
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
        {nextSteps(kind, data.speed).map((step, index) => (
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

export function ContactForm({ areaPage, sourcePage }: { areaPage?: string; sourcePage?: SourcePage }) {
  const pathname = usePathname()
  const dedicated = pathname === '/contact'
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [problem, setProblem] = useState<SendProblem | null>(null)
  const [sent, setSent] = useState<{ data: ContactInput; confirmationSent: boolean } | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const started = useRef(false)
  const submitting = useRef(false)
  const moveFocus = useRef(false)
  const initialised = useRef(false)
  const estimateRef = useRef<HTMLDivElement>(null)
  const revealEstimate = useRef(false)
  const quietReset = useRef(false)
  const { register, handleSubmit, control, reset, watch, getValues, setValue, trigger, clearErrors, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    shouldFocusError: false,
    defaultValues: {
      name: '', phone: '', email: '', address: '', postcode: '', services: ['EPC Certificate'],
      areaBand: '', floorArea: '', customerType: '', improvementPlan: false, speed: 'Standard (72 hours)',
      areaPage, sourcePage: sourcePage || sourcePageForPath(pathname), ctaId: dedicated ? 'direct' : 'embedded',
      propertyCount: '', preferredDate: '', notes: '', website: '', turnstileToken: '', consent: false,
    },
  })

  useEffect(() => {
    if (initialised.current) return
    initialised.current = true
    let initialSource = sourcePage || sourcePageForPath(pathname)
    if (dedicated) {
      const context = parseQuoteContext(new URLSearchParams(window.location.search))
      setValue('services', [quoteServices[context.service || 'epc']])
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
    enabled: step === 3 && status !== 'success',
    onVerify: token => setValue('turnstileToken', token, { shouldValidate: true }),
    onExpire: () => setValue('turnstileToken', '', { shouldValidate: !quietReset.current }),
    onError: () => setValue('turnstileToken', '', { shouldValidate: true }),
  })
  const values = watch()
  const estimate = guideEstimate(values)
  const publishQuote = usePublishQuote()
  const [selectedService] = values.services
  const { areaBand, floorArea, customerType, speed, improvementPlan } = values
  useEffect(() => {
    // Desktop /contact summary only; selections, never customer details.
    publishQuote?.({ service: selectedService, areaBand: areaBand || '', floorArea: floorArea || '', customerType: customerType || '', speed, improvementPlan: !!improvementPlan })
  }, [publishQuote, selectedService, areaBand, floorArea, customerType, speed, improvementPlan])
  const { isBulk, isLodged, canHavePlan, planIncluded, productKind } = estimate
  const estimateText = estimate.state === 'awaiting-area' ? '' : estimate.state === 'priced'
    ? `Guide estimate: £${estimate.total} · ${areaLabel(values.areaBand, values.floorArea)}`
    : isBulk ? 'Your portfolio will be quoted individually.' : "We'll confirm your exact quote after reviewing your property details."
  const estimatePanel = estimateText && <div ref={estimateRef} data-estimate-summary className="rounded-lg bg-secondary-50 px-3 py-2.5 text-sm text-secondary-800">
    <p className="font-semibold">{estimateText}</p>
    {step > 1 && <>
      {estimate.state === 'priced' && <details className="mt-1"><summary className="cursor-pointer py-2 font-semibold">Estimate breakdown</summary>
        <dl>{guideEstimateRows(estimate).map(([label, amount]) => <div key={label} className="flex flex-wrap justify-between gap-2 py-1"><dt>{label}</dt><dd>{amount}</dd></div>)}</dl>
      </details>}
      <p className="mt-1">Your exact quote is confirmed before booking.</p>
    </>}
  </div>

  useEffect(() => {
    if (!revealEstimate.current || step !== 1) return
    revealEstimate.current = false
    const bottom = estimateRef.current?.getBoundingClientRect().bottom
    // The result follows the entire size group, so an early band can leave it
    // below the screen. Reveal it only after a choice, without moving focus or scrolling up.
    if (bottom && bottom > window.innerHeight - 16) {
      window.scrollBy({ top: bottom - window.innerHeight + 16, behavior: 'instant' })
    }
  }, [estimateText, step])

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
    const fields: (keyof ContactInput)[] = step === 1 ? ['areaBand', 'floorArea', 'services', 'customerType'] : ['speed', 'preferredDate', 'notes']
    if (await trigger(fields)) {
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

  if (status === 'success' && sent) return (
    <RequestSent data={sent.data} confirmationSent={sent.confirmationSent} focusRef={successRef} onReset={() => {
      reset(); started.current = false; setSent(null); setStatus('idle'); moveFocus.current = true; setStep(1)
      rememberCustomerType('', window.history)
      if (dedicated) window.history.replaceState(window.history.state, '', quoteHref())
    }} />
  )

  return (
    <form ref={formRef} noValidate aria-label="Exact quote enquiry" aria-busy={status === 'submitting'}
      onChangeCapture={start} onSubmit={event => {
        if (step < 3) { event.preventDefault(); void next(); return }
        void handleSubmit(onSubmit, invalid => { setShowErrors(true); requestAnimationFrame(() => focusError(invalid)) })(event)
      }} className="min-w-0 rounded-xl border border-secondary-200 bg-white p-4 [overflow-wrap:anywhere] sm:p-6 lg:rounded-2xl lg:p-7 lg:shadow-premium">
      <div className="flex items-baseline justify-between gap-3">
        <h2 ref={headingRef} tabIndex={-1} className="font-sans text-sm font-bold text-primary-800">{STEP_TITLES[step - 1]}</h2>
        <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-secondary-500">Step {step} of 3</p>
      </div>
      <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary-100">
        <div className="h-full rounded-full bg-primary-700" style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      {/* Keep this node mounted and empty before the first estimate. Only its text changes. */}
      <p data-estimate-announcement className="sr-only" aria-live="polite" aria-atomic="true">{estimateText}</p>
      {step > 1 && estimatePanel && <div className="mt-4">{estimatePanel}</div>}

      <div className="hidden" aria-hidden="true"><label>Website<input type="text" tabIndex={-1} autoComplete="off" {...register('website')} /></label></div>

      {step === 1 && <div className="mt-5 space-y-6">
        <Controller control={control} name="services" render={({ field }) => <Choices name="services" legend="What service do you need?"
          value={field.value[0]} inputRef={field.ref} error={errors.services?.message}
          onChange={value => {
            if (value === BULK) {
              revealEstimate.current = true
              if (getValues('customerType') === 'Homeowner') { setValue('customerType', ''); rememberCustomerType('', window.history) }
            }
            field.onChange([value]); const lodged = value === 'EPC Certificate' || value === 'Both (Bundle)'
            if (!lodged) { setValue('speed', 'Standard (72 hours)'); setValue('improvementPlan', false) }
            rememberSelection(); conversionEvent('service_selection', quoteContextFromForm(getValues()))
          }} options={serviceChoices} />} />

        {isBulk ? <p className="text-base text-secondary-700">A single floor area does not apply to a portfolio. We’ll ask for an approximate property count on the last step.</p> : <div>
          <Controller control={control} name="areaBand" render={({ field }) => <Choices name="areaBand" legend="Internal floor area" tiles gridClassName="grid-cols-2 sm:grid-cols-3"
            hint="Choose your internal floor area for a guide estimate."
            value={field.value || ''} inputRef={field.ref} error={errors.areaBand?.message}
            onChange={value => {
              revealEstimate.current = true; field.onChange(value)
              // A typed figure stays only while it agrees with the chosen size.
              const typed = getValues('floorArea'), exact = parseExactArea(typed)
              if (typed && (exact === undefined || bandForArea(exact) !== value)) { setValue('floorArea', ''); clearErrors('floorArea') }
              rememberSelection(); conversionEvent('estimator_use', quoteContextFromForm(getValues()))
            }}
            options={[...areaBands.map((band, index) => ({ value: band, label: pricing[index].areaLabel, description: pricing[index].label })), { value: 'unknown', label: 'Not sure of floor area', description: 'We will review the property details before quoting.', fullRow: true }]} />} />
          {/* Preset sizes first; a known figure selects its own size so the estimate follows it. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <label htmlFor="floorArea" className="text-[15px] font-semibold text-secondary-900">Know the exact floor area?</label>
            <div className="relative w-32">
              <Input id="floorArea" inputMode="decimal" autoComplete="off" maxLength={10} placeholder="e.g. 134"
                aria-invalid={!!errors.floorArea} aria-describedby={errors.floorArea ? 'floorArea-error' : 'floorArea-hint'} hasError={!!errors.floorArea} className="pr-11"
                {...register('floorArea', {
                  onChange: event => {
                    const exact = parseExactArea(event.target.value)
                    if (exact !== undefined && getValues('areaBand') !== bandForArea(exact)) {
                      setValue('areaBand', bandForArea(exact), { shouldValidate: !!errors.areaBand }); rememberSelection()
                    }
                    if (errors.floorArea) void trigger('floorArea')
                  },
                  onBlur: () => { if (parseExactArea(getValues('floorArea')) !== undefined) conversionEvent('estimator_use', quoteContextFromForm(getValues())) },
                })} />
              <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-secondary-600">m²</span>
            </div>
          </div>
          {errors.floorArea ? <p id="floorArea-error" role="alert" className="mt-1.5 text-sm text-red-700">{errors.floorArea.message}</p>
            : <p id="floorArea-hint" className="mt-1.5 text-sm text-secondary-600">{(parseExactArea(floorArea) ?? 0) > 300
              ? 'That is a very large home. If your figure is in square feet, divide it by 10.76 to get m².'
              : 'Optional. It is on a previous EPC or floor plan. We will pick the matching size.'}</p>}
        </div>}

        {estimatePanel}

        <Controller control={control} name="customerType" render={({ field }) => <Choices name="customerType" legend="Which best describes you?"
          hint="This tells us how to arrange access to the property."
          value={field.value} onChange={value => {
            field.onChange(value)
            rememberCustomerType(value as ContactInput['customerType'], window.history)
          }} inputRef={field.ref} error={errors.customerType?.message}
          options={customerTypeChoices(isBulk)} />} />

        {values.customerType === 'Landlord (tenanted)' && <p className="text-sm text-secondary-700">Please let your tenants know about the visit and include any access arrangements in the notes.</p>}
        {planIncluded && <p className="rounded-lg bg-primary-50 p-3 text-sm">The Energy Report and written Improvement Plan are included in your Pre-Assessment.</p>}
        {canHavePlan && !planIncluded && <label className="flex min-h-[48px] cursor-pointer items-start gap-3 rounded-lg border border-secondary-300 px-3.5 py-3 has-[:checked]:border-accent-600 has-[:checked]:bg-accent-50">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-accent-600" {...register('improvementPlan', { onChange: rememberSelection })} />
          <span className="min-w-0"><span className="block text-[15px] font-semibold leading-snug">Add the EPC Improvement Plan <span className="whitespace-nowrap">(+£{site.addOns.improvementPlan})</span></span>
            <span className="mt-0.5 block text-sm leading-snug text-secondary-600">Your full Energy Report plus Abdul&apos;s personalised plan explaining what&apos;s holding the rating back and which improvements to consider first. Your standard EPC recommendations are included either way.</span></span>
        </label>}
      </div>}

      {step === 2 && <div className="mt-5 space-y-6">
        {isLodged ? <Controller control={control} name="speed" render={({ field }) => <Choices name="speed" legend="Lodgement speed"
          value={field.value} inputRef={field.ref} error={errors.speed?.message} onChange={value => { field.onChange(value); rememberSelection() }} options={[
            { value: 'Standard (72 hours)', label: 'Standard lodgement', description: 'Lodged on the GOV.UK register within 72 hours of the visit.' },
            { value: EXPRESS_SPEED, label: `Next-day lodgement (+£${EXPRESS_SURCHARGE})`, description: 'Lodged within 24 hours of the visit.' },
          ]} />} /> : <p className="text-base text-secondary-700">{turnaroundCopy(productKind)}</p>}
        {!isBulk && <Field label="Preferred visit date" htmlFor="preferredDate" hint="Optional. A requested date is not a confirmed appointment." error={errors.preferredDate?.message}>
          <Input id="preferredDate" type="date" {...register('preferredDate')} />
        </Field>}
        <Field label="Access notes or other instructions" htmlFor="notes" hint="Optional. Tell us about access, parking or relevant property details." error={errors.notes?.message}>
          <Textarea id="notes" rows={3} {...register('notes')} />
        </Field>
      </div>}

      {step === 3 && <div className="mt-5 space-y-5">
        <p className="text-base text-secondary-700">{contactStepIntro(productKind)}</p>
        <p className="text-sm text-secondary-700">Fields marked * are required.</p>
        {showErrors && Object.keys(errors).length > 0 && <div role="alert" className="rounded-lg border border-danger p-3 text-sm text-red-700">
          <p className="font-semibold">Please check the following:</p>
          <ul>{Object.entries(errors).map(([name, error]) => <li key={name}><a href={`#${name === 'turnstileToken' ? 'security-check' : name}`} className="inline-block py-2 underline" onClick={event => {
            event.preventDefault(); focusBookingElement(document.getElementById(name === 'turnstileToken' ? 'security-check' : name))
          }}>{error.message}</a></li>)}</ul>
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
        <label className="flex min-h-[48px] cursor-pointer items-start gap-3 py-2 text-base">
          <input id="consent" type="checkbox" required aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-error' : undefined} className="mt-1 h-5 w-5 shrink-0 accent-primary-700" {...register('consent')} />
          <span>I agree to be contacted about my enquiry. We only use your details for this request. Read our <a href="/privacy-policy" className="underline">privacy policy</a>.</span>
        </label>
        {errors.consent && <p id="consent-error" role="alert" className="text-sm text-red-700">{errors.consent.message}</p>}
        <div id="security-check" tabIndex={-1} aria-describedby={errors.turnstileToken ? 'turnstileToken-error' : undefined}>
          <p className="mb-2 text-sm font-semibold">Security check</p>
          <div ref={turnstileRef} className="min-w-0" />
          {turnstileLoading && <p role="status" className="text-sm">Loading security check…</p>}
          {turnstileError && <div role="alert" className="text-sm text-red-700"><p>The security check could not complete. Check your connection and try again.</p><button type="button" className={`${controlClass} underline`} onClick={resetTurnstile}>Retry security check</button></div>}
          {errors.turnstileToken && <p id="turnstileToken-error" role="alert" className="text-sm text-red-700">{errors.turnstileToken.message}</p>}
        </div>
        {problem && <SendProblemNotice problem={problem} summary={enquirySummaryText(values)} />}
      </div>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-secondary-200 pt-4">
        {step > 1 && <button type="button" disabled={status === 'submitting'} className={`${controlClass} border border-secondary-400 text-secondary-900`} onClick={() => { moveFocus.current = true; setStep(step - 1) }}>Back</button>}
        {step < 3 ? <button type="button" onClick={() => void next()} className={`${controlClass} ml-auto gap-1.5 bg-primary-700 text-white hover:bg-primary-800`}>Continue<ArrowRight aria-hidden="true" className="h-4 w-4" /></button> :
          <button type="submit" disabled={status === 'submitting' || !turnstileToken} className={`${controlClass} ml-auto bg-primary-700 text-white hover:bg-primary-800`}>{status === 'submitting' ? 'Sending…' : 'Send my quote request'}</button>}
      </div>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-x-6 text-sm text-secondary-700">
        <details className="min-w-0"><summary className="cursor-pointer py-3 font-semibold">What’s included</summary><ul className="mb-2 list-disc space-y-2 pl-5">{includedList(productKind).map(item => <li key={item}>{item}</li>)}</ul></details>
        <p>Need help? <a href={site.phoneHref} className="inline-flex min-h-[44px] items-center px-2 underline lg:px-0">Call</a> or <a href={site.whatsappHref} className="inline-flex min-h-[44px] items-center px-2 underline lg:px-0">WhatsApp</a>.</p>
      </div>
    </form>
  )
}
