/**
 * One booking form runs everywhere: inside the homepage hero card, on /contact and on every
 * area page (Abdul, 16/10/2026: no answer is ever asked twice, no page switch mid-enquiry).
 *
 * The step count is still being chosen. Draft A asks taps first (who, service, size, extras,
 * price), then details: 2 steps. Draft B keeps timing as its own step: 3 steps.
 */
export type FormLayout = 'two-step' | 'three-step'
export const FORM_LAYOUT: FormLayout = 'three-step'

/**
 * Draft preview only: sending is stubbed and the security check is skipped, so a preview
 * can be tried end to end without a real enquiry reaching the inbox. Never true on main.
 */
export const FORM_DRAFT = true
