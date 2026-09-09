'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  BadgePoundSterling,
  Sparkles,
  ClipboardCheck,
  Phone,
  MessageCircle,
  Mail
} from 'lucide-react'
import { Field, Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MobilePriceBar } from '@/components/forms/MobilePriceBar'
import { cn } from '@/lib/cn'
import { pricing, site, EXPRESS_SURCHARGE } from '@/lib/site'
import { guideEstimate } from '@/lib/pricing-estimate'
import { useTurnstile } from '@/lib/useTurnstile'
import {
  contactSchema,
  propertyTypes,
  EXPRESS_SPEED,
  PRE_ASSESSMENT,
  type ContactInput,
} from '@/lib/validators'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const STEP_TITLES = [
  'Services & Size',
  'Speed & Date',
  'Contact Details'
]

export function ContactForm() {
  const pathname = usePathname()
  /**
   * The pinned mobile price bar belongs to the dedicated booking page only.
   *
   * This form is also embedded on the homepage and every borough page via
   * ContactSection, where it is a secondary conversion path a long way down
   * the page — a bar pinned from the top of the homepage would advertise a
   * price for a form nobody has reached, and would sit on top of MobileCallBar
   * at the same z-index.
   *
   * This condition is the exact complement of the one in MobileCallBar: the
   * price bar shows precisely where the call bar stands down. Change one and
   * you must change the other.
   */
  const showMobilePriceBar = pathname === '/contact'

  const [step, setStep] = useState(1)
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      postcode: '',
      services: ['EPC Certificate'], // default select
      propertyType: '2 Bedroom', // default select
      customerType: 'Homeowner', // default select
      improvementPlan: false,
      speed: 'Standard (72 hours)', // default select
      preferredDate: '',
      notes: '',
      website: '',
      turnstileToken: '',
    },
  })

  const {
    containerRef: turnstileRef,
    token: turnstileToken,
    isLoading: turnstileLoading,
    error: turnstileError,
    reset: resetTurnstile,
  } = useTurnstile({
    enabled: step === 3 && status !== 'success',
    onVerify: (token) => setValue('turnstileToken', token, { shouldValidate: true }),
    onExpire: () => setValue('turnstileToken', '', { shouldValidate: true }),
    onError: () => setValue('turnstileToken', '', { shouldValidate: true }),
  })

  // Watch form fields for the live pricing calculator
  const watchPropertyType = watch('propertyType')
  const watchServices = watch('services') || []
  const watchSpeed = watch('speed')
  const watchCustomerType = watch('customerType')
  const watchImprovementPlan = watch('improvementPlan')

  // Calculate live pricing. The arithmetic lives in one place — lib/pricing-estimate
  // — so the number here and the "Guide shown to customer" line in the booking
  // email can never disagree.
  const calculatePrice = () => {
    const e = guideEstimate({
      propertyType: watchPropertyType,
      services: watchServices,
      speed: watchSpeed,
      improvementPlan: watchImprovementPlan,
    })
    const wantsEpc =
      watchServices.includes('EPC Certificate') || watchServices.includes('Both (Bundle)')
    const wantsFloorPlan =
      watchServices.includes('Floor Plan') || watchServices.includes('Both (Bundle)')

    return {
      // The whole estimate, for anything that renders the breakdown itself
      // (the mobile bar) rather than picking individual figures out.
      estimate: e,
      epcPrice: e.epc,
      floorPlanPrice: e.floorPlan,
      discount: e.bundleDiscount,
      speedPrice: e.express,
      improvementPlanPrice: e.improvementPlan,
      preAssessmentPrice: e.preAssessment,
      planIncluded: e.planIncluded,
      canHavePlan: e.canHavePlan,
      isLodged: e.isLodged,
      total: e.total,
      wantsEpc,
      wantsFloorPlan,
      isExpress: e.express > 0,
      isBulk: e.isBulk,
    }
  }

  const {
    estimate,
    epcPrice,
    floorPlanPrice,
    discount,
    improvementPlanPrice,
    preAssessmentPrice,
    planIncluded,
    canHavePlan,
    isLodged,
    total,
    wantsEpc,
    wantsFloorPlan,
    isExpress,
    isBulk,
  } = calculatePrice()

  const onSubmit = async (data: ContactInput) => {
    setStatus('submitting')
    setServerError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Something went wrong. Please call us instead.')
      }
      setStatus('success')
      reset()
    } catch (err) {
      // Turnstile tokens are single-use. A failed request needs a fresh token
      // before the visitor can retry, regardless of where the request failed.
      resetTurnstile()
      setStatus('error')
      setServerError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleNext = async () => {
    let isValid = false
    if (step === 1) {
      isValid = await trigger(['propertyType', 'services', 'customerType'])
    } else if (step === 2) {
      isValid = await trigger(['speed'])
    }
    if (isValid) {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  if (status === 'success') {
    return (
      <div
        className="rounded-2xl border border-primary-200 bg-primary-50 p-6 md:p-8 shadow-premium"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-8 h-8 text-primary-700 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <h3 className="text-xl font-bold text-secondary-900">Booking Request Received!</h3>
            <p className="mt-3 text-secondary-700 leading-relaxed text-sm md:text-base">
              Thank you for choosing L&D Energy. We have received your request and will contact you within **2 hours** to confirm your booking slot (Mon–Sun, 8am–8pm).
            </p>
            <p className="mt-3 text-secondary-700 text-sm">
              If your request is urgent, please feel free to call or text us directly on{' '}
              <a href="tel:+447492575396" className="font-bold text-primary-700 hover:underline">
                07492 575 396
              </a>
              .
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus('idle')
                setStep(1)
              }}
              className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800"
            >
              Send another request
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    // pb-24 keeps the Next / Back / Submit controls clear of the fixed mobile
    // price bar; lg:pb-0 because the bar is lg:hidden, and no padding at all
    // where the bar is not rendered.
    <div
      className={cn(
        'max-w-5xl mx-auto grid gap-5 lg:grid-cols-12 items-start',
        showMobilePriceBar && 'pb-24 lg:pb-0',
      )}
    >
      {/* Form Steps Column */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="lg:col-span-7 rounded-2xl border border-secondary-200 bg-white p-4 md:p-5 shadow-premium"
        aria-describedby="form-help"
      >
        {/* Progress Tracker */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[11px] font-semibold text-secondary-500 uppercase tracking-wider mb-2">
            <span>Step {step} of 3</span>
            <span className="text-primary-700 font-bold">{STEP_TITLES[step - 1]}</span>
          </div>
          <div className="h-1.5 w-full bg-secondary-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Honeypot */}
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
          </label>
        </div>

        {/* Step 1: Services & Size */}
        {step === 1 && (
          <div className="space-y-3 animate-fade-in">
            <div>
              <h4 className="text-base font-bold text-secondary-900">What service do you need?</h4>
              <p className="text-xs text-secondary-500 mt-0.5">
                Choose one. Picking the EPC and floor plan together applies the bundle discount automatically.
              </p>

              <Controller
                control={control}
                name="services"
                render={({ field }) => {
                  const value = field.value ?? []
                  const isBundleSelected = value.includes('Both (Bundle)')
                  // The bundle tile also lights up when EPC + Floor Plan are both picked
                  const isSelected = (v: ContactInput['services'][number]) =>
                    v === 'Both (Bundle)'
                      ? isBundleSelected
                      : isBundleSelected
                        ? false
                        : value.includes(v)

                  return (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {([
                        { value: 'EPC Certificate', label: 'EPC only', desc: 'Official 10-year energy rating, lodged on the government register.', badge: undefined, wide: false },
                        { value: 'Both (Bundle)', label: 'EPC + Floor Plan', desc: 'Both for the same property in one visit — better value than booking separately.', badge: 'Better value', wide: false },
                        { value: 'Floor Plan', label: 'Floor plan only', desc: 'Laser-measured scale drawing showing layout and room sizes.', badge: undefined, wide: false },
                        { value: PRE_ASSESSMENT, label: 'EPC Pre-Assessment', desc: 'Find out your score without it going on the public register. Nothing is lodged.', badge: 'Private', wide: false },
                        // Structurally different from the four per-property
                        // options — no size, no per-property price — so it
                        // spans the row instead of orphaning a half-cell.
                        { value: 'Bulk / Agency Enquiry', label: 'Bulk / agency enquiry', desc: 'Multiple properties or ongoing instructions — we’ll quote volume rates.', badge: 'Agents', wide: true },
                      ] as const).map((s) => {
                        const checked = isSelected(s.value)
                        return (
                          <button
                            key={s.value}
                            type="button"
                            aria-pressed={checked}
                            onClick={() => {
                              field.onChange([s.value])
                              // "Homeowner" is the default and is not an option
                              // on a bulk enquiry, so it would otherwise submit
                              // invisibly with no card looking selected.
                              if (s.value === 'Bulk / Agency Enquiry') {
                                setValue('customerType', 'Estate agent', { shouldValidate: true })
                              } else if (isBulk) {
                                // Leaving bulk — `isBulk` is the pre-click
                                // state, so this only fires on the way out and
                                // never overrides a genuine agent's own choice.
                                setValue('customerType', 'Homeowner', { shouldValidate: true })
                              }
                            }}
                            className={cn(
                              'flex flex-col text-left p-2.5 rounded-lg border transition-all duration-200 hover:-translate-y-0.5 shadow-sm min-h-[60px]',
                              s.wide && 'sm:col-span-2',
                              checked
                                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                                : 'border-secondary-200 bg-white hover:border-secondary-300'
                            )}
                          >
                            <span className="flex items-center gap-1.5 font-bold text-sm text-secondary-900">
                              {s.label}
                              {s.badge && (
                                <span
                                  className={cn(
                                    'text-[10px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded text-white',
                                    s.value === 'Both (Bundle)' ? 'bg-accent-600' : 'bg-primary-600'
                                  )}
                                >
                                  {s.badge}
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-secondary-500 mt-1 leading-snug">{s.desc}</span>
                          </button>
                        )
                      })}
                    </div>
                  )
                }}
              />
              {errors.services && (
                <p className="mt-1.5 text-xs text-danger" role="alert">
                  {errors.services.message}
                </p>
              )}
            </div>

            {/* Bulk enquiries cover many properties, so a single size doesn't apply. */}
            {isBulk ? (
              <div className="rounded-lg border border-primary-200 bg-primary-50/60 p-3">
                <h4 className="text-sm font-bold text-secondary-900">Property size</h4>
                <p className="mt-1 text-sm text-secondary-700 leading-relaxed">
                  Not needed for a bulk enquiry — tell us roughly how many properties and the postcodes
                  in the notes on the next step, and we’ll come back with volume rates.
                </p>
              </div>
            ) : (
            <div>
              <h4 className="text-base font-bold text-secondary-900">Select Property Size</h4>
              <p className="text-xs text-secondary-500 mt-0.5">
                Pricing depends mainly on internal floor area. Bedroom count helps us estimate when
                the exact floor area isn&apos;t known — pick the closest match.
              </p>

              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {propertyTypes.map((p) => {
                  const active = watchPropertyType === p
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setValue('propertyType', p, { shouldValidate: true })}
                      className={cn(
                        'flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all duration-200 hover:-translate-y-0.5 shadow-sm',
                        active
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                          : 'border-secondary-200 bg-white hover:border-secondary-300'
                      )}
                    >
                      <span className="font-bold text-sm text-secondary-900">{p}</span>
                      <span className="mt-0.5 text-[10px] leading-tight text-secondary-500">
                        {pricing[propertyTypes.indexOf(p)]?.areaLabel}
                      </span>
                    </button>
                  )
                })}
              </div>
              {errors.propertyType && (
                <p className="mt-1.5 text-xs text-danger" role="alert">
                  {errors.propertyType.message}
                </p>
              )}
            </div>
            )}

            <div>
              <h4 className="text-base font-bold text-secondary-900">Who are you booking as?</h4>
              <p className="text-xs text-secondary-500 mt-0.5">
                {isBulk
                  ? 'Bulk instructions come from agencies, so we only ask which kind.'
                  : 'This tells us how to arrange access to the property.'}
              </p>

              <Controller
                control={control}
                name="customerType"
                render={({ field }) => (
                  <div className={cn('mt-2 grid gap-2', isBulk ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2')}>
                    {/* Nobody books a multi-property bulk enquiry as a
                        homeowner, and "Homeowner" is the default — so on a bulk
                        enquiry the two private options are dropped rather than
                        left as reachable nonsense. */}
                    {(isBulk
                      ? [
                          { value: 'Estate agent', desc: 'Instructing on behalf of sellers' },
                          { value: 'Letting agent / firm', desc: 'Managing lettings or a portfolio' },
                        ]
                      : [
                          { value: 'Homeowner', desc: 'I live in or own the property' },
                          { value: 'Landlord (tenanted)', desc: 'It’s rented out — tenants live there' },
                          { value: 'Estate agent', desc: 'Instructing on behalf of a seller' },
                          { value: 'Letting agent / firm', desc: 'Managing lettings or a portfolio' },
                        ]
                    ).map((c) => {
                      const active = field.value === c.value
                      return (
                        <button
                          key={c.value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => field.onChange(c.value)}
                          className={cn(
                            'flex flex-col text-left p-2 rounded-lg border transition-all duration-200 hover:-translate-y-0.5 shadow-sm',
                            active
                              ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                              : 'border-secondary-200 bg-white hover:border-secondary-300'
                          )}
                        >
                          <span className="font-bold text-sm text-secondary-900">{c.value}</span>
                          <span className="text-[11px] text-secondary-500 mt-0.5 leading-snug">{c.desc}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              />
              {errors.customerType && (
                <p className="mt-1.5 text-xs text-danger" role="alert">
                  {errors.customerType.message}
                </p>
              )}

              {/* Tenanted properties need notice — surface it as soon as it's relevant */}
              {watchCustomerType === 'Landlord (tenanted)' && (
                <p className="mt-2.5 rounded-lg bg-primary-50 ring-1 ring-primary-100 px-3 py-2 text-xs leading-relaxed text-secondary-700 animate-fade-in">
                  Please let your tenants know we’re coming so they can expect us. If it’s easier, share
                  their contact details in the notes and we’ll arrange access directly, giving proper notice.
                  Evening and weekend slots are available at no extra cost.
                </p>
              )}
            </div>

            {/* Already inside a Pre-Assessment: without a certificate the customer
                would otherwise get nothing actionable, so it is never sold again. */}
            {planIncluded && (
              <div className="flex items-start gap-3 rounded-lg border border-accent-500 bg-accent-50/60 p-2.5 shadow-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-accent-600 bg-accent-600">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </span>
                <span>
                  <span className="flex flex-wrap items-center gap-1.5 font-bold text-sm text-secondary-900">
                    Improvement Plan
                    <span className="text-xs uppercase tracking-wider bg-accent-600 text-white font-black px-1.5 py-0.5 rounded">
                      Included
                    </span>
                  </span>
                  <span className="block text-xs text-secondary-500 mt-1 leading-snug">
                    Nothing is lodged, so there is no certificate to read your recommendations
                    from. The Energy Report and your written plan are part of the price.
                  </span>
                </span>
              </div>
            )}

            {/* The plan is written from an assessment, so it is only offered
                when there is one. `canHavePlan` comes from the estimator so
                the control and the arithmetic cannot disagree. */}
            {canHavePlan && !planIncluded && (
            <Controller
              control={control}
              name="improvementPlan"
              render={({ field }) => (
                <button
                  type="button"
                  aria-pressed={!!field.value}
                  onClick={() => field.onChange(!field.value)}
                  className={cn(
                    'flex w-full items-start gap-3 text-left p-2.5 rounded-lg border transition-all duration-200 shadow-sm',
                    field.value
                      ? 'border-accent-500 bg-accent-50/60 ring-2 ring-accent-500'
                      : 'border-secondary-200 bg-white hover:border-secondary-300'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                      field.value ? 'border-accent-600 bg-accent-600' : 'border-secondary-300 bg-white'
                    )}
                    aria-hidden="true"
                  >
                    {field.value && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </span>
                  <span>
                    <span className="flex flex-wrap items-center gap-1.5 font-bold text-sm text-secondary-900">
                      Add the Improvement Plan
                      <span className="text-xs uppercase tracking-wider bg-accent-600 text-white font-black px-1.5 py-0.5 rounded">
                        +£{site.addOns.improvementPlan}
                      </span>
                    </span>
                    <span className="block text-xs text-secondary-500 mt-1 leading-snug">
                      Keeps the improvement recommendations on your certificate, and adds two things
                      sent after the visit: a full Energy Report showing where your money actually goes
                      and what each measure costs to install, plus a written plan ranking which ones are
                      worth doing on your building and in what order. Useful for MEES planning.
                    </span>
                  </span>
                </button>
              )}
            />
            )}
          </div>
        )}

        {/* Step 2: Speed & Date */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            {/* Express is a lodgement surcharge. Nothing here is lodged for a
                Pre-Assessment (by design) or a floor plan (never was), so the
                choice is withheld in both cases rather than promising a
                next-day lodgement that cannot happen. */}
            {!isLodged ? (
              <div className="rounded-lg border border-primary-200 bg-primary-50/60 p-3">
                <h4 className="text-sm font-bold text-secondary-900">Turnaround</h4>
                <p className="mt-1 text-sm text-secondary-700 leading-relaxed">
                  {planIncluded
                    ? 'Nothing is lodged on the government register, so there is no certificate to expedite and no next-day option. Your Energy Report and written plan are sent within 72 hours of the visit.'
                    : 'Floor plans are not lodged on the government register, so there is no next-day lodgement option. Your plans are supplied as JPG and PDF within 72 hours of the visit.'}
                </p>
              </div>
            ) : (
            <div>
              <h4 className="text-base font-bold text-secondary-900">Select Delivery Speed</h4>
              <p className="text-xs text-secondary-500 mt-0.5">Need your certificate quickly? Next-day service is available.</p>

              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                {([
                  { value: 'Standard (72 hours)', label: 'Standard Delivery', desc: 'Lodged on the GOV.UK register within 72 hours of the visit', priceBadge: 'Included' },
                  { value: EXPRESS_SPEED, label: `Express Delivery (+£${EXPRESS_SURCHARGE})`, desc: 'Lodged within 24 hours of the visit', priceBadge: `£${EXPRESS_SURCHARGE} extra` },
                ] as const).map((s) => {
                  const active = watchSpeed === s.value
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setValue('speed', s.value, { shouldValidate: true })}
                      className={cn(
                        'flex flex-col text-left p-3 rounded-lg border transition-all duration-200 hover:-translate-y-0.5 shadow-sm min-h-[74px]',
                        active
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                          : 'border-secondary-200 bg-white hover:border-secondary-300'
                      )}
                    >
                      <span className="flex justify-between items-center w-full font-bold text-sm text-secondary-900">
                        {s.label}
                        <span className={cn(
                          'text-[11px] font-bold px-2 py-0.5 rounded-full',
                          active ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600'
                        )}>
                          {s.priceBadge}
                        </span>
                      </span>
                      <span className="text-[11px] text-secondary-500 mt-1 leading-snug">{s.desc}</span>
                    </button>
                  )
                })}
              </div>
              {errors.speed && (
                <p className="mt-1.5 text-xs text-danger" role="alert">
                  {errors.speed.message}
                </p>
              )}
            </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Preferred Visit Date" htmlFor="preferredDate" hint="Select a date for the assessor's visit. Optional.">
                <div className="relative">
                  <Input id="preferredDate" type="date" {...register('preferredDate')} />
                </div>
              </Field>
              <Field label="Additional Instructions" htmlFor="notes" hint="e.g. key codes, parking info, property details. Optional.">
                <Input id="notes" placeholder="Notes for the assessor..." {...register('notes')} />
              </Field>
            </div>
          </div>
        )}

        {/* Step 3: Contact Details */}
        {step === 3 && (
          <div className="space-y-3 animate-fade-in">
            <div>
              <h4 className="text-base font-bold text-secondary-900">Enter Contact & Property Address</h4>
              <p className="text-xs text-secondary-500 mt-0.5">Provide the property details and where we should send the invoice and certificate.</p>
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <Field label="Full Name" htmlFor="name" required error={errors.name?.message}>
                <Input
                  id="name"
                  autoComplete="name"
                  hasError={!!errors.name}
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
              </Field>
              <Field label="Phone Number" htmlFor="phone" required error={errors.phone?.message}>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  hasError={!!errors.phone}
                  aria-invalid={!!errors.phone}
                  {...register('phone')}
                />
              </Field>
              <Field
                label="Email Address"
                htmlFor="email"
                required
                error={errors.email?.message}
                className="col-span-2"
              >
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  hasError={!!errors.email}
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
              </Field>
              <Field
                label="Full Property Address"
                htmlFor="address"
                required
                error={errors.address?.message}
                className="col-span-2"
              >
                <Textarea
                  id="address"
                  rows={2}
                  placeholder="Include street number, block name, and flat number..."
                  autoComplete="street-address"
                  hasError={!!errors.address}
                  aria-invalid={!!errors.address}
                  {...register('address')}
                />
              </Field>
              <Field label="Postcode" htmlFor="postcode" required error={errors.postcode?.message}>
                <Input
                  id="postcode"
                  autoComplete="postal-code"
                  placeholder="e.g. E15 3JZ"
                  hasError={!!errors.postcode}
                  aria-invalid={!!errors.postcode}
                  {...register('postcode')}
                />
              </Field>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-secondary-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  {...register('consent')}
                />
                <span>
                  I agree to be contacted about my enquiry. We only use your details for this booking request. Read our{' '}
                  <a href="/privacy-policy" className="text-primary-700 font-semibold hover:underline">
                    privacy policy
                  </a>
                  .
                </span>
              </label>
              {errors.consent && (
                <p className="mt-1.5 text-xs text-danger" role="alert">
                  {errors.consent.message}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary-400">
                Quick security check
              </p>
              {/* Turnstile's "flexible" size needs an unconstrained width to lay
                  out correctly — the old max-w-[300px] + padding box left it
                  under 300px, which caused the widget to overflow its own
                  border. w-full lets it size itself against the step column. */}
              <div className="w-full flex justify-center" ref={turnstileRef} />
              {turnstileLoading && (
                <p className="text-xs text-secondary-500" role="status">
                  Loading security check...
                </p>
              )}
              {turnstileError && (
                <div className="text-center" role="alert">
                  <p className="text-xs text-danger">
                    The security check could not complete. Check your connection and try again.
                  </p>
                  <button
                    type="button"
                    onClick={resetTurnstile}
                    className="mt-1 min-h-[44px] px-3 text-xs font-bold text-primary-700 hover:text-primary-800 hover:underline"
                  >
                    Retry security check
                  </button>
                </div>
              )}
              {errors.turnstileToken && (
                <p className="text-xs text-danger" role="alert">
                  {errors.turnstileToken.message}
                </p>
              )}
            </div>

            {status === 'error' && serverError && (
              <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-2.5 text-xs text-danger animate-fade-in" role="alert">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <p>{serverError}</p>
              </div>
            )}
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-5 pt-4 border-t border-secondary-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 min-h-[44px] font-bold text-sm text-secondary-700 hover:text-secondary-900 px-4 rounded-xl border border-secondary-200 hover:bg-secondary-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 min-h-[44px] font-bold text-sm bg-primary-600 text-white hover:bg-primary-700 px-5 rounded-xl shadow-sm hover:shadow-md transition-all ml-auto"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <Button
              type="submit"
              variant="accent"
              size="md"
              className="ml-auto"
              disabled={status === 'submitting' || !turnstileToken}
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Sending...
                </>
              ) : (
                'Submit Booking Request'
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Live Quote Summary Sidebar */}
      <div className="lg:col-span-5 rounded-2xl border border-secondary-200 bg-glass p-4 md:p-5 shadow-premium lg:sticky lg:top-24 lg:mt-0 mt-4">
        <h4 className="text-sm font-bold text-secondary-900 tracking-wider uppercase flex items-center gap-1.5 border-b border-secondary-100 pb-2.5 mb-3">
          <BadgePoundSterling className="w-4 h-4 text-primary-600" />
          Live Price Estimate
        </h4>

        <div className="space-y-3 text-xs text-secondary-700">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold block text-secondary-900">Services:</span>
              <span className="text-xs text-secondary-500 mt-0.5 block leading-relaxed">
                {isBulk
                  ? 'Bulk / agency enquiry'
                  : planIncluded
                    ? 'EPC Pre-Assessment — not lodged'
                    : wantsEpc && wantsFloorPlan
                      ? 'EPC + Floor Plan Bundle (same property)'
                      : wantsEpc
                        ? 'Domestic EPC Only'
                        : wantsFloorPlan
                          ? 'Floor Plan Only'
                          : 'No service selected'}
              </span>
            </div>
            {!isBulk &&
              (planIncluded ? (
                <span className="font-bold text-secondary-900">{`£${preAssessmentPrice}`}</span>
              ) : wantsEpc && wantsFloorPlan ? (
                <div className="text-right">
                  <span className="text-secondary-600 line-through">{`£${epcPrice + floorPlanPrice}`}</span>
                  <span className="font-bold text-secondary-900 block">{`£${epcPrice + floorPlanPrice - discount}`}</span>
                </div>
              ) : (
                <span className="font-bold text-secondary-900">{`£${epcPrice + floorPlanPrice}`}</span>
              ))}
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Booking as:</span>
            <span className="font-bold text-secondary-900 text-right">{watchCustomerType}</span>
          </div>

          {!isBulk && (
            <div className="flex justify-between">
              <span className="font-semibold">Property Size:</span>
              <span className="font-bold text-secondary-900">{watchPropertyType}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="font-semibold">{isLodged ? 'Delivery Speed:' : 'Sent within:'}</span>
            <span className="font-bold text-secondary-900">
              {isLodged ? watchSpeed?.split(' (')[0] : '72 hours'}
            </span>
          </div>

          {isExpress && !isBulk && (
            <div className="flex justify-between text-xs text-secondary-900">
              <span>Express Delivery Surcharge:</span>
              <span className="font-bold">+{`£${EXPRESS_SURCHARGE}`}</span>
            </div>
          )}

          {improvementPlanPrice > 0 && !isBulk && (
            <div className="flex justify-between text-xs text-secondary-900">
              <span>Improvement Plan:</span>
              <span className="font-bold">+{`£${improvementPlanPrice}`}</span>
            </div>
          )}

          {planIncluded && (
            <div className="flex justify-between text-xs text-secondary-900">
              <span>Improvement Plan:</span>
              <span className="font-bold text-accent-700">Included</span>
            </div>
          )}

          {discount > 0 && !isBulk && (
            <div className="flex justify-between text-xs text-success font-semibold bg-success/5 border border-success/20 p-2 rounded-lg items-center">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Bundle saving included:
              </span>
              <span>-{`£${discount}`}</span>
            </div>
          )}

          <div className="border-t border-secondary-100 pt-3 mt-3 flex justify-between items-baseline">
            <span className="text-sm font-bold text-secondary-900">Guide estimate:</span>
            {isBulk ? (
              <span className="text-sm font-bold text-primary-700 text-right">Quoted individually</span>
            ) : (
              <span className="text-right">
                <span className="block text-2xl font-black text-primary-700 font-display">{`£${total}`}</span>
                <span className="block text-[11px] font-medium text-secondary-500">Not a final quote</span>
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-secondary-500">
            A guide estimate based on the size you picked. We confirm your exact quote before
            anything is booked.
          </p>
        </div>

        <div className="mt-4 border-t border-secondary-100 pt-3 space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-secondary-500">What&apos;s Included:</h5>
          <ul className="space-y-1.5 text-xs text-secondary-600">
            {/* Only an EPC is lodged. Asserting a lodgement fee, a register
                listing or a certificate link against a Pre-Assessment or a
                floor plan is simply untrue, so each unlodged case states what
                it actually gets. */}
            {(isLodged
              ? [
                  'Elmhurst Lodgement Fee',
                  'Official Government Register Listing',
                  'No Travel/Call-out Surcharges',
                  'Certificate link sent once lodged',
                ]
              : planIncluded
                ? [
                    'Full survey by an accredited assessor',
                    'Nothing lodged — no entry on the public register',
                    'Energy Report + written Improvement Plan',
                    'No Travel/Call-out Surcharges',
                  ]
                : [
                    'Laser-measured on site by your assessor',
                    'Drawn to Rightmove and Zoopla specification',
                    'High-resolution JPG and PDF supplied',
                    'No Travel/Call-out Surcharges',
                  ]
            ).map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Direct channels — fills the space beside the taller form and gives
            anyone who'd rather not fill in a form a one-tap route out. */}
        <div className="mt-4 border-t border-secondary-100 pt-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-secondary-500">
            Prefer to talk?
          </h5>
          <div className="mt-2.5 space-y-2">
            <a
              href={site.phoneHref}
              className="flex items-center gap-2.5 rounded-lg border border-secondary-200 bg-white px-3 py-2.5 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Phone className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-secondary-900">Tap to call</span>
                <span className="block truncate text-xs text-secondary-500">{site.phone}</span>
              </span>
            </a>
            <a
              href={site.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg border border-secondary-200 bg-white px-3 py-2.5 transition-colors hover:border-[#25D366] hover:bg-[#25D366]/5"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-secondary-900">Open WhatsApp</span>
                <span className="block truncate text-xs text-secondary-500">
                  Great for photos &amp; details
                </span>
              </span>
            </a>
            <a
              href={site.emailHref}
              className="flex items-center gap-2.5 rounded-lg border border-secondary-200 bg-white px-3 py-2.5 transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary-700 text-white">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-secondary-900">Send email</span>
                <span className="block truncate text-xs text-secondary-500">
                  Reply during opening hours
                </span>
              </span>
            </a>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-secondary-500">
            No call-out fees · Free quote · Exact price confirmed before booking
          </p>
        </div>
      </div>

      {/* Mobile only: the sidebar above sits below the whole form on a phone,
          so the running total needs its own pinned home. */}
      {showMobilePriceBar && <MobilePriceBar estimate={estimate} />}
    </div>
  )
}
