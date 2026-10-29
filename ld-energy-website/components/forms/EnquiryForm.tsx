'use client'

import { useRef, useState } from 'react'
import { landingContext } from '@/lib/landing'
import { EmailTypoHint } from './EmailTypoHint'
import { EMAIL_UNREACHABLE_MESSAGE } from '@/lib/email-check'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Mail, MessageCircle, Phone } from 'lucide-react'
import { site } from '@/lib/site'
import { quoteHref } from '@/lib/quote-context'
import { enquirySchema, enquiryTypes, QUOTE_ENQUIRY_TYPE, type EnquiryInput } from '@/lib/validators'
import { useTurnstile } from '@/lib/useTurnstile'
import { FORM_DRAFT } from '@/lib/form-layout'

/**
 * The general enquiry form on /contact (Abdul 23/10/2026): secondary to the quote, and says what it is for. Choosing
 * "Quote for a property" swaps the fields for a way into the quote journey, so nobody prices a property through a
 * general form. Same safeguards as the booking form: zod on both sides, a honeypot, Turnstile, and the draft switch
 * that stops real sends on this branch.
 */
export function EnquiryForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [problem, setProblem] = useState('')
  const [sentName, setSentName] = useState('')
  const doneRef = useRef<HTMLDivElement>(null)
  const { register, handleSubmit, watch, setValue, setFocus, setError, formState: { errors } } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      kind: 'enquiry', enquiryType: '' as EnquiryInput['enquiryType'], name: '', email: '', phone: '', message: '',
      consent: false, website: '', turnstileToken: FORM_DRAFT ? 'draft-preview' : '',
    },
  })
  const type = watch('enquiryType') as string
  const wantsQuote = type === QUOTE_ENQUIRY_TYPE
  const { containerRef, token, isLoading, error: turnstileError, reset: resetTurnstile } = useTurnstile({
    enabled: !FORM_DRAFT && !wantsQuote && status !== 'success',
    onVerify: (value) => setValue('turnstileToken', value, { shouldValidate: true }),
    onExpire: () => setValue('turnstileToken', ''),
    onError: () => setValue('turnstileToken', ''),
  })

  async function onSubmit(data: EnquiryInput) {
    const done = () => { setSentName(data.name.trim().split(/\s+/)[0]); setStatus('success'); requestAnimationFrame(() => doneRef.current?.focus()) }
    if (FORM_DRAFT) { done(); return }
    setStatus('submitting'); setProblem('')
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, ...landingContext() }) })
      const body: { ok?: boolean; delivered?: boolean; code?: string } = await response.json().catch(() => ({}))
      if (response.ok && body.ok && body.delivered) { done(); return }
      if (body.code === 'email') { setStatus('idle'); setError('email', { type: 'server', message: EMAIL_UNREACHABLE_MESSAGE }); setFocus('email'); return }
      resetTurnstile(); setStatus('error')
      setProblem(body.code === 'security' ? 'The security check expired. Tick it again, then send. Your message is still here.' : 'We couldn’t send this online. Your message is still here, or reach us another way below.')
    } catch {
      resetTurnstile(); setStatus('error')
      setProblem(navigator.onLine === false ? 'You seem to be offline. Check your connection, then send again.' : 'We couldn’t send this online. Your message is still here, or reach us another way below.')
    }
  }

  if (status === 'success') return (
    <div ref={doneRef} tabIndex={-1} className="eq eq--done" aria-labelledby="eq-done-h">
      {FORM_DRAFT && <p className="eq__draft">Draft preview: nothing was sent. On the live site this is where the customer lands.</p>}
      <h3 id="eq-done-h" className="eq__done-h">Thanks, {sentName}. Your message is with us.</h3>
      <p>We reply by email during opening hours, {site.hours.replace('Monday–Sunday', 'Monday to Sunday').replace('–', ' to ')}. Need us sooner? Call or WhatsApp {site.phone}.</p>
    </div>
  )

  return (
    <form className="eq" noValidate aria-label="General enquiry" aria-busy={status === 'submitting'}
      onSubmit={handleSubmit(onSubmit, (invalid) => { const first = Object.keys(invalid)[0] as keyof EnquiryInput | undefined; if (first && first !== 'turnstileToken') setFocus(first) })}>
      <div className="eq__field">
        <label htmlFor="eq-type">What is it about? <span aria-hidden="true">*</span></label>
        <select id="eq-type" className="eq__control" aria-invalid={!!errors.enquiryType} aria-describedby={errors.enquiryType ? 'eq-type-error' : undefined} {...register('enquiryType')}>
          <option value="" disabled>Choose one</option>
          {enquiryTypes.map((option) => <option key={option} value={option}>{option}</option>)}
          <option value={QUOTE_ENQUIRY_TYPE}>{QUOTE_ENQUIRY_TYPE}</option>
        </select>
        {errors.enquiryType && <p id="eq-type-error" className="eq__error" role="alert">{errors.enquiryType.message}</p>}
      </div>

      {wantsQuote ? (
        <div className="eq__route" role="status">
          <p>Prices have their own short form, so we get the property details we need to quote it properly.</p>
          <a className="ld-btn ld-btn--primary" href={quoteHref({ sourcePage: 'contact', ctaId: 'inline' })}>Start my quote <ArrowRight aria-hidden="true" width={18} height={18} /></a>
        </div>
      ) : (
        <>
          <div className="eq__grid">
            <div className="eq__field">
              <label htmlFor="eq-name">Full name <span aria-hidden="true">*</span></label>
              <input id="eq-name" className="eq__control" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'eq-name-error' : undefined} {...register('name')} />
              {errors.name && <p id="eq-name-error" className="eq__error" role="alert">{errors.name.message}</p>}
            </div>
            <div className="eq__field">
              <label htmlFor="eq-email">Email address <span aria-hidden="true">*</span></label>
              <input id="eq-email" type="email" inputMode="email" autoComplete="email" className="eq__control" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'eq-email-error' : undefined} {...register('email')} />
              {errors.email && <p id="eq-email-error" className="eq__error" role="alert">{errors.email.message}</p>}
              <EmailTypoHint id="eq-email-typo" className="eq__hint" email={watch('email')} onAccept={fixed => setValue('email', fixed, { shouldValidate: true })} />
            </div>
            <div className="eq__field">
              <label htmlFor="eq-phone">Phone number <span className="eq__opt">Optional</span></label>
              <input id="eq-phone" type="tel" inputMode="tel" autoComplete="tel" className="eq__control" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'eq-phone-error' : undefined} {...register('phone')} />
              {errors.phone && <p id="eq-phone-error" className="eq__error" role="alert">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="eq__field">
            <label htmlFor="eq-message">Your message <span aria-hidden="true">*</span></label>
            <textarea id="eq-message" rows={5} className="eq__control" aria-invalid={!!errors.message} aria-describedby={['eq-message-hint', errors.message ? 'eq-message-error' : ''].filter(Boolean).join(' ')} {...register('message')} />
            <p id="eq-message-hint" className="eq__hint">For a booking, include the address or the date of the visit.</p>
            {errors.message && <p id="eq-message-error" className="eq__error" role="alert">{errors.message.message}</p>}
          </div>
          <div className="hidden" aria-hidden="true"><label>Website<input type="text" tabIndex={-1} autoComplete="off" {...register('website')} /></label></div>
          <label className="eq__consent">
            <input id="eq-consent" type="checkbox" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'eq-consent-error' : undefined} {...register('consent')} />
            <span>I agree to be contacted about my message. We only use your details to reply. Read our <a href="/privacy-policy">privacy policy</a>.</span>
          </label>
          {errors.consent && <p id="eq-consent-error" className="eq__error" role="alert">{errors.consent.message}</p>}
          {FORM_DRAFT ? <p className="eq__draft">Draft preview: the security check is skipped and nothing is sent.</p> : (
            <div>
              <div ref={containerRef} className="min-w-0" />
              {isLoading && <p role="status" className="eq__hint">Loading security check…</p>}
              {turnstileError && <p role="alert" className="eq__error">The security check could not complete. <button type="button" className="eq__retry" onClick={resetTurnstile}>Try again</button></p>}
              {errors.turnstileToken && <p className="eq__error" role="alert">{errors.turnstileToken.message}</p>}
            </div>
          )}
          {problem && (
            <div role="alert" className="eq__problem">
              <p>{problem}</p>
              <p className="eq__alt">
                <a href={site.phoneHref}><Phone aria-hidden="true" width={16} height={16} /> {site.phone}</a>
                <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" width={16} height={16} /> WhatsApp</a>
                <a href={site.emailHref}><Mail aria-hidden="true" width={16} height={16} /> Email</a>
              </p>
            </div>
          )}
          <div className="eq__send">
            <button type="submit" className="ld-btn ld-btn--line" disabled={status === 'submitting' || (!FORM_DRAFT && !token)}>
              {status === 'submitting' ? 'Sending…' : 'Send my message'}
            </button>
            <p className="eq__hint">We reply by email, usually the same working day.</p>
          </div>
        </>
      )}
    </form>
  )
}
