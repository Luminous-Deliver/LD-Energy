'use client'

import { emailDomainCompletions, emailTypoSuggestion } from '@/lib/email-check'

const chip: React.CSSProperties = {
  font: 'inherit', fontSize: 15, minHeight: 44, padding: '0 14px', borderRadius: 999, border: '1px solid currentColor',
  background: '#fff', color: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
}

/**
 * Under the email field (Abdul 29-30/10/2026). After "@", one-tap endings for the common providers; once a domain is
 * typed, "Did you mean …@gmail.com?" for the usual slips. Suggestions only: ignoring them still sends.
 */
export function EmailTypoHint({ email, id, className, onAccept }: { email: string; id: string; className?: string; onAccept: (fixed: string) => void }) {
  const completions = emailDomainCompletions(email || '')
  const suggestion = completions.length ? null : emailTypoSuggestion(email || '')
  return (
    <div id={id} className={className} aria-live="polite">
      {completions.length > 0 && (
        <div role="group" aria-label="Finish your email address" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {completions.map((full) => (
            <button key={full} type="button" style={chip} onClick={() => onAccept(full)} aria-label={`Use ${full}`}>
              @{full.slice(full.lastIndexOf('@') + 1)}
            </button>
          ))}
        </div>
      )}
      {suggestion && (
        <p style={{ margin: 0 }}>
          Did you mean{' '}
          <button type="button" onClick={() => onAccept(suggestion)} style={{ font: 'inherit', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 0, padding: 0, color: 'inherit', cursor: 'pointer', overflowWrap: 'anywhere' }}>
            {suggestion}
          </button>
          ?
        </p>
      )}
    </div>
  )
}
