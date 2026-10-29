import Link from 'next/link'
import { Reveal } from '@/components/layout/Reveal'
import { signature } from '@/lib/signature-font'
import { site } from '@/lib/site'

/* The sign-off above the footer on every page (Abdul 29/10/2026, round 2 P1; replaces the skyline drawing). Who comes
   to the home, as visible text with both accreditation numbers, and "Abdul M Taher" writing itself in once it scrolls
   into view. The script face stands in until Abdul's own signature is traced. */
export function SignOff() {
  const [elmhurst, quidos] = site.assessor.accreditations
  return (
    <section className="signoff bg-stone-50 py-16 lg:py-24" aria-labelledby="signoff-h">
      <div className="mx-auto grid max-w-[1216px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:px-8">
        <div>
          <p className="font-sans text-label font-medium uppercase text-sage-700">Who comes to your home</p>
          <h2 id="signoff-h" className="mt-4 max-w-[26ch] font-serif text-[1.9rem] font-normal leading-[1.15] text-stone-900 lg:text-[2.6rem]">
            Your visit is with me, Abdul Motaleb Taher.
          </h2>
          <p className="mt-4 max-w-[52ch] text-[16px] leading-7 text-stone-700">
            I&rsquo;m an accredited Domestic Energy Assessor based in Stratford. I measure the home, record what&rsquo;s there and
            lodge the EPC on the government register, usually within 72 hours.
          </p>
          <Link prefetch={false} href="/about" className="mt-4 inline-flex min-h-11 items-center text-[15px] font-semibold text-sage-700 underline-offset-4 hover:underline">More about me →</Link>
        </div>
        <div className="lg:justify-self-end">
          {/* the wrapper is observed: an element clipped to nothing never counts as on screen, so it would never start */}
          <Reveal className="signoff__wrap" hidden>
            <span className={`signoff__name ${signature.className}`}>Abdul M Taher</span>
          </Reveal>
          <p className="mt-2 text-[14px] text-stone-600">Abdul Motaleb Taher · {elmhurst.short} {elmhurst.number} · {quidos.short} {quidos.number}</p>
        </div>
      </div>
    </section>
  )
}
