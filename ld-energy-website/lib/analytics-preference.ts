export const analyticsPreferenceKey = 'ld-energy-analytics'

/** One preference, not a visitor identifier. Honour an earlier rejection. */
export function analyticsAllowed(): boolean {
  try {
    if (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return false
    const choice = localStorage.getItem(analyticsPreferenceKey)
    if (choice === 'off') return false
    if (choice === 'on') return true
    return localStorage.getItem('cookie-consent') !== 'declined'
  } catch {
    // Restricted storage must not prevent enquiries or bypass an objection.
    return false
  }
}
