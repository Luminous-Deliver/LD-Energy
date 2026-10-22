// The design system's drawn icons (prototype v7.2 build.py `icon()`): 24 px grid, 1.75 stroke, square ends.
// Decorative: the link text carries the name.
function Icon({ size = 20, d, shift }: { size?: number; d: string; shift: string }) {
  return (
    <svg className="i" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="butt" strokeLinejoin="miter" aria-hidden="true" focusable="false">
      <g transform={shift}><path d={d} /></g>
    </svg>
  )
}

export function WhatsAppIcon({ size }: { size?: number }) {
  return <Icon size={size} shift="translate(0.25 0.375)" d="M3 4h18v12.75h-9.5L6.25 20.5v-3.75H3zM7.25 8.75h9.5M7.25 12h6" />
}

export function PhoneIcon({ size }: { size?: number }) {
  return <Icon size={size} shift="translate(0 -0.375)" d="M8.75 3.25H4.5c-.7 0-1.25.55-1.25 1.25C3.25 13.4 10.6 20.75 19.5 20.75c.7 0 1.25-.55 1.25-1.25v-4.25l-4.5-1.5-2.25 2.25c-2.6-1.25-4.75-3.4-6-6l2.25-2.25z" />
}

export function MailIcon({ size }: { size?: number }) {
  return <Icon size={size} shift="translate(0 0)" d="M2.75 5.25h18.5v13.5H2.75zM2.75 5.25 12 12.5l9.25-7.25" />
}

export function MenuIcon() {
  return <Icon size={24} shift="translate(0 0)" d="M3.5 7h17M3.5 12h17M3.5 17h17" />
}

export function CloseIcon() {
  return <Icon size={24} shift="translate(0 0)" d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
}
