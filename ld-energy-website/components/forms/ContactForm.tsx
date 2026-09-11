'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Controller, useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, Input, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { pricing, site, EXPRESS_SURCHARGE } from '@/lib/site'
import { areaBands, areaLabel } from '@/lib/floor-area'
import { guideEstimate, guideEstimateRows } from '@/lib/pricing-estimate'
import { turnaroundCopy, includedList, contactStepIntro } from '@/lib/booking-copy'
import { parseQuoteContext, quoteContextFromForm, quoteHref, quoteServices } from '@/lib/quote-context'
import { conversionEvent } from '@/lib/conversion-events'
import { ctaIds, customerTypeForSource, sourcePageForPath, type SourcePage, type CtaId } from '@/lib/enquiry-attribution'
import { useTurnstile } from '@/lib/useTurnstile'
import { contactSchema, customerTypes, EXPRESS_SPEED, PRE_ASSESSMENT, type ContactInput } from '@/lib/validators'

const STEP_TITLES = ['Service and property', 'Timing and access', 'Your details']
const controlClass = 'inline-flex min-h-[48px] items-center justify-center rounded-lg px-4 py-3 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:opacity-60'

interface ChoiceProps {
  name: string; legend: string; value: string; onChange: (value: string) => void
  options: { value: string; label: string; description?: string }[]
  error?: string; hint?: string; inputRef?: (element: HTMLInputElement | null) => void
}

function Choices({ name, legend, value, onChange, options, error, hint, inputRef }: ChoiceProps) {
  return (
    <fieldset className="min-w-0" aria-invalid={!!error} aria-describedby={`${name}-hint${error ? ` ${name}-error` : ''}`}>
      <legend className="text-base font-semibold text-secondary-900">{legend}</legend>
      <p id={`${name}-hint`} className="mt-1 text-sm text-secondary-700">{hint || 'Choose one option.'}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option, index) => (
          <label key={option.value} className={cn('flex min-h-[48px] min-w-0 cursor-pointer items-start gap-3 rounded-lg border p-3', value === option.value ? 'border-primary-700 bg-primary-50 ring-1 ring-primary-700' : 'border-secondary-300 bg-white')}>
            <input type="radio" name={name} value={option.value} checked={value === option.value}
              id={`${name}-${index}`} ref={index === 0 ? inputRef : undefined}
              onChange={() => onChange(option.value)} required
              aria-label={option.label} aria-describedby={`${name}-hint ${name}-description-${index}${error ? ` ${name}-error` : ''}`}
              className="mt-1 h-5 w-5 shrink-0 accent-primary-700" />
            <span className="min-w-0">
              <span className="block text-base font-semibold text-secondary-900">{option.label}</span>
              <span id={`${name}-description-${index}`} className="mt-1 block text-sm text-secondary-700">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
      {error && <p id={`${name}-error`} className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
    </fieldset>
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
  const [serverError, setServerError] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const started = useRef(false)
  const submitting = useRef(false)
  const moveFocus = useRef(false)
  const initialised = useRef(false)
  const { register, handleSubmit, control, reset, watch, getValues, setValue, trigger, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    shouldFocusError: false,
    defaultValues: {
      name: '', phone: '', email: '', address: '', postcode: '', services: ['EPC Certificate'],
      areaBand: '', customerType: '', improvementPlan: false, speed: 'Standard (72 hours)',
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
    setValue('customerType', customerTypeForSource(initialSource))
    if (dedicated && window.location.hash === '#booking-form') focusBookingElement(document.getElementById('booking-form'))
    // URL context seeds a new form only. Browser history must never overwrite edits.
  }, [dedicated, pathname, sourcePage, setValue])

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
    onExpire: () => setValue('turnstileToken', '', { shouldValidate: true }),
    onError: () => setValue('turnstileToken', '', { shouldValidate: true }),
  })
  const values = watch()
  const estimate = guideEstimate(values)
  const { isBulk, isLodged, canHavePlan, planIncluded, productKind } = estimate

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
    const fields: (keyof ContactInput)[] = step === 1 ? ['areaBand', 'services', 'customerType'] : ['speed', 'preferredDate', 'notes']
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

  async function onSubmit(data: ContactInput) {
    if (submitting.current) return
    submitting.current = true
    setStatus('submitting'); setServerError('')
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const body = await response.json().catch(() => ({}))
      if (!response.ok || body.ok !== true || body.delivered !== true) throw new Error('Your request could not be received. Please try again, or use the support links below.')
      conversionEvent('enquiry_submitted', quoteContextFromForm(data))
      setStatus('success')
    } catch (error) {
      resetTurnstile(); setStatus('error')
      setServerError(error instanceof Error ? error.message : 'Please try again.')
    } finally { submitting.current = false }
  }

  if (status === 'success') return (
    <div ref={successRef} tabIndex={-1} className="rounded-xl border border-primary-200 bg-primary-50 p-6" role="status">
      <h2 className="text-2xl font-bold">Your quote request has been received</h2>
      <p className="mt-3 text-base leading-relaxed">Thanks. Abdul will confirm the exact price and an available appointment. Your visit is confirmed once you agree those details.</p>
      <button type="button" className={`${controlClass} mt-4 border border-primary-700 text-primary-800`} onClick={() => {
        reset(); started.current = false; setStatus('idle'); moveFocus.current = true; setStep(1)
        if (dedicated) window.history.replaceState(window.history.state, '', quoteHref())
      }}>Send another request</button>
    </div>
  )

  return (
    <form ref={formRef} noValidate aria-label="Exact quote enquiry" aria-busy={status === 'submitting'}
      onChangeCapture={start} onSubmit={event => {
        if (step < 3) { event.preventDefault(); void next(); return }
        void handleSubmit(onSubmit, invalid => { setShowErrors(true); requestAnimationFrame(() => focusError(invalid)) })(event)
      }} className="min-w-0 rounded-xl border border-secondary-200 bg-white p-4 [overflow-wrap:anywhere] sm:p-6">
      <p className="text-sm font-semibold text-primary-800">Step {step} of 3</p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-bold text-secondary-900">{STEP_TITLES[step - 1]}</h2>

      {estimate.state !== 'awaiting-area' && <div data-estimate-summary className="my-4 rounded-lg bg-secondary-50 p-3 text-sm text-secondary-800">
        <p aria-live="polite" aria-atomic="true">
          {estimate.state === 'priced' ? <><strong>Guide estimate: £{estimate.total}</strong> · {areaLabel(values.areaBand)}</> :
            <strong>{isBulk ? 'Your portfolio will be quoted individually.' : 'Exact quote after reviewing your property details.'}</strong>}
        </p>
        {estimate.state === 'priced' && <details className="mt-1"><summary className="cursor-pointer py-3 font-semibold">Estimate breakdown</summary>
          <dl>{guideEstimateRows(estimate).map(([label, amount]) => <div key={label} className="flex flex-wrap justify-between gap-2 py-1"><dt>{label}</dt><dd>{amount}</dd></div>)}</dl>
        </details>}
        <p className="mt-1">Your exact quote is confirmed before booking.</p>
      </div>}

      <div className="hidden" aria-hidden="true"><label>Website<input type="text" tabIndex={-1} autoComplete="off" {...register('website')} /></label></div>

      {step === 1 && <div className="mt-4 space-y-6">
        <Controller control={control} name="services" render={({ field }) => <Choices name="services" legend="What service do you need?"
          value={field.value[0]} inputRef={field.ref} error={errors.services?.message}
          onChange={value => {
            field.onChange([value]); const lodged = value === 'EPC Certificate' || value === 'Both (Bundle)'
            if (!lodged) { setValue('speed', 'Standard (72 hours)'); setValue('improvementPlan', false) }
            rememberSelection(); conversionEvent('service_selection', quoteContextFromForm(getValues()))
          }} options={[
            { value: 'EPC Certificate', label: 'Domestic EPC', description: 'On-site assessment and an EPC lodged on the government register.' },
            { value: 'Both (Bundle)', label: 'EPC + Floor Plan', description: 'Both services for the same property in one visit, with the bundle price.' },
            { value: 'Floor Plan', label: 'Floor Plan', description: 'Laser-measured drawing showing layout and room sizes.' },
            { value: PRE_ASSESSMENT, label: 'EPC Pre-Assessment', description: 'Find out your score privately. Nothing is lodged.' },
            { value: 'Bulk / Agency Enquiry', label: 'Agency / portfolio enquiry', description: 'Multiple properties or ongoing instructions, quoted individually.' },
          ]} />} />

        {isBulk ? <p className="text-base text-secondary-700">A single floor area does not apply to a portfolio. We’ll ask for an approximate property count on the last step.</p> :
          <Controller control={control} name="areaBand" render={({ field }) => <Choices name="areaBand" legend="Internal floor area"
            hint="Choose your internal floor area for a guide estimate. Floor area in m² is the main pricing factor. Bedroom counts are only a rough reference."
            value={field.value || ''} inputRef={field.ref} error={errors.areaBand?.message}
            onChange={value => { field.onChange(value); rememberSelection(); conversionEvent('estimator_use', quoteContextFromForm(getValues())) }}
            options={[...areaBands.map((band, index) => ({ value: band, label: pricing[index].areaLabel, description: pricing[index].typicalLabel })), { value: 'unknown', label: 'Not sure of floor area', description: 'Continue without an estimate. We will review the property details before quoting.' }]} />} />}

        <Controller control={control} name="customerType" render={({ field }) => <Choices name="customerType" legend="Which best describes you?"
          value={field.value} onChange={field.onChange} inputRef={field.ref} error={errors.customerType?.message}
          options={customerTypes.map(value => ({ value, label: value }))} />} />

        {values.customerType === 'Landlord (tenanted)' && <p className="text-sm text-secondary-700">Please let your tenants know about the visit and include any access arrangements in the notes.</p>}
        {planIncluded && <p className="rounded-lg bg-primary-50 p-3 text-base">The Energy Report and written Improvement Plan are included in your Pre-Assessment.</p>}
        {canHavePlan && !planIncluded && <label className="flex min-h-[48px] cursor-pointer items-start gap-3 rounded-lg border border-secondary-300 p-3">
          <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-primary-700" {...register('improvementPlan', { onChange: rememberSelection })} />
          <span className="min-w-0"><span className="block text-base font-semibold">Add the EPC Improvement Plan (+£{site.addOns.improvementPlan})</span>
            <span className="mt-1 block text-sm text-secondary-700">Your full Energy Report plus Abdul&apos;s personalised plan explaining what&apos;s holding the rating back and which improvements to consider first. Your standard EPC recommendations are included either way.</span></span>
        </label>}
      </div>}

      {step === 2 && <div className="space-y-6">
        {isLodged ? <Controller control={control} name="speed" render={({ field }) => <Choices name="speed" legend="Lodgement speed"
          value={field.value} inputRef={field.ref} error={errors.speed?.message} onChange={value => { field.onChange(value); rememberSelection() }} options={[
            { value: 'Standard (72 hours)', label: 'Standard lodgement', description: 'Lodged on the GOV.UK register within 72 hours of the visit.' },
            { value: EXPRESS_SPEED, label: `Next-day lodgement (+£${EXPRESS_SURCHARGE})`, description: 'Lodged within 24 hours of the visit.' },
          ]} />} /> : <p className="text-base text-secondary-700">{turnaroundCopy(productKind)}</p>}
        {!isBulk && <Field label="Preferred visit date" htmlFor="preferredDate" hint="Optional. A requested date is not a confirmed appointment." error={errors.preferredDate?.message}>
          <Input id="preferredDate" type="date" {...register('preferredDate')} />
        </Field>}
        <Field label="Access notes or other instructions" htmlFor="notes" hint="Optional. Tell us about access, parking or relevant property details." error={errors.notes?.message}>
          <Textarea id="notes" {...register('notes')} />
        </Field>
      </div>}

      {step === 3 && <div className="space-y-5">
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
        {serverError && <p role="alert" className="rounded-lg border border-danger p-3 text-base text-red-700">{serverError}</p>}
      </div>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-secondary-200 pt-4">
        {step > 1 && <button type="button" disabled={status === 'submitting'} className={`${controlClass} border border-secondary-400 text-secondary-900`} onClick={() => { moveFocus.current = true; setStep(step - 1) }}>Back</button>}
        {step < 3 ? <button type="button" onClick={() => void next()} className={`${controlClass} ml-auto bg-primary-700 text-white`}>Continue</button> :
          <button type="submit" disabled={status === 'submitting' || !turnstileToken} className={`${controlClass} ml-auto bg-primary-700 text-white`}>{status === 'submitting' ? 'Sending…' : 'Send my quote request'}</button>}
      </div>
      <details className="mt-4 text-sm text-secondary-700"><summary className="cursor-pointer py-3 font-semibold">What’s included</summary><ul className="list-disc space-y-2 pl-5">{includedList(productKind).map(item => <li key={item}>{item}</li>)}</ul></details>
      <p className="mt-3 text-sm text-secondary-700">Need help? <a href={site.phoneHref} className="inline-flex min-h-[44px] items-center px-2 underline">Call</a> or <a href={site.whatsappHref} className="inline-flex min-h-[44px] items-center px-2 underline">WhatsApp</a>.</p>
    </form>
  )
}
