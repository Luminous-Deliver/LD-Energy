import { ICON_BODIES } from './v7-assets'

/** The design system's drawn icons (prototype build.py `icon()`): 24 px grid, 1.75 stroke, square ends, colour from CSS. Decorative. */
export function Ico({ name, size = 20 }: { name: keyof typeof ICON_BODIES | string; size?: number }) {
  return (
    <svg className="i" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="butt" strokeLinejoin="miter" aria-hidden="true" focusable="false"
      dangerouslySetInnerHTML={{ __html: ICON_BODIES[name] ?? '' }} />
  )
}
