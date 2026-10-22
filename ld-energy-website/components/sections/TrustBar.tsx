import { ShieldCheck, Landmark, CalendarCheck, MapPin, UserCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { insurance } from '@/lib/site'

const items = [
  { Icon: ShieldCheck, label: 'Elmhurst & Quidos Accredited' },
  { Icon: Landmark, label: 'Lodged on UK Gov Register' },
  { Icon: CalendarCheck, label: 'Valid for 10 years' },
  { Icon: MapPin, label: 'All 32 Boroughs Covered' },
  // DBS confirmed by the business as part of Elmhurst accreditation. Wording is
  // deliberately restrained — the check level and issue date are not verified.
  { Icon: UserCheck, label: insurance.short },
]

export function TrustBar() {
  return (
    <section className="bg-gradient-to-b from-white to-secondary-50 border-b border-secondary-100" aria-label="Trust signals">
      <Container className="py-6 md:py-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {items.map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 min-h-[44px] rounded-xl bg-white/60 ring-1 ring-secondary-900/5 px-3 py-3 hover:bg-white hover:shadow-premium transition-all duration-200"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white ring-1 ring-primary-700/10 shrink-0">
              <Icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-secondary-800">{label}</span>
          </div>
        ))}
      </Container>
    </section>
  )
}
