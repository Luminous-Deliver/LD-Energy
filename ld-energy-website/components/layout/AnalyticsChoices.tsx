'use client'

import { useEffect, useState } from 'react'
import { analyticsAllowed, analyticsPreferenceKey } from '@/lib/analytics-preference'

export function AnalyticsChoices() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => { setEnabled(analyticsAllowed()) }, [])

  function choose(value: boolean) {
    try {
      localStorage.setItem(analyticsPreferenceKey, value ? 'on' : 'off')
      const allowed = analyticsAllowed()
      setEnabled(allowed)
      setMessage(value && !allowed
        ? 'Your browser privacy signal keeps analytics off.'
        : `Preference saved. Analytics will be ${allowed ? 'on' : 'off'} when you open another page.`)
    } catch {
      setEnabled(false)
      setMessage('Your browser cannot save this preference. Analytics stays off while storage is unavailable.')
    }
  }

  return (
    <div id="analytics-choices" className="scroll-mt-32 my-6 rounded-xl border border-secondary-200 p-5 not-prose">
      <h3 className="text-lg font-semibold text-secondary-900">Your analytics choice</h3>
      <p className="mt-2 text-base leading-relaxed text-secondary-700">Aggregate usage and speed statistics help us improve this website. You can switch them off for this browser, free of charge. Enquiries, Call and WhatsApp still work. Analytics does not run on this privacy page.</p>
      <p className="mt-3 text-base text-secondary-900">{enabled === null ? 'Checking your preference…' : `Analytics is ${enabled ? 'on' : 'off'} for other pages.`}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" onClick={() => choose(false)} aria-pressed={enabled === false} className="min-h-12 rounded-lg border border-secondary-600 px-4 py-2 text-base font-semibold text-secondary-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Switch analytics off</button>
        <button type="button" onClick={() => choose(true)} aria-pressed={enabled === true} className="min-h-12 rounded-lg border border-secondary-600 px-4 py-2 text-base font-semibold text-secondary-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Switch analytics on</button>
      </div>
      <p role="status" aria-live="polite" className="mt-3 text-sm leading-relaxed text-secondary-700">{message}</p>
    </div>
  )
}
