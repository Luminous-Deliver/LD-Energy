'use client'

import { emailTypoSuggestion } from '@/lib/email-check'

/** "Did you mean fazmin@gmail.com?" under the email field. A suggestion only: one tap takes it, ignoring it still sends. */
export function EmailTypoHint({ email, id, className, onAccept }: { email: string; id: string; className?: string; onAccept: (fixed: string) => void }) {
  const suggestion = emailTypoSuggestion(email || '')
  return (
    <p id={id} className={className} aria-live="polite">
      {suggestion && (
        <>
          Did you mean{' '}
          <button type="button" onClick={() => onAccept(suggestion)} style={{ font: 'inherit', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 0, padding: 0, color: 'inherit', cursor: 'pointer', overflowWrap: 'anywhere' }}>
            {suggestion}
          </button>
          ?
        </>
      )}
    </p>
  )
}
