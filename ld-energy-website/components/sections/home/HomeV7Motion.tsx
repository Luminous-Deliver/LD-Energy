'use client'

import { useEffect } from 'react'

/** The example report's recommendations, as they land: POTENTIAL steps F 34, E 44, E 48, E 52, D 58 (illustrative). */
const STEPS = [
  { score: 34, band: 'F', row: 5, text: 'Below the E minimum for letting.' },
  { score: 44, band: 'E', row: 4, text: 'With the loft done, it meets the E minimum for letting.' },
  { score: 48, band: 'E', row: 4, text: 'Two improvements in. Still E, now 48.' },
  { score: 52, band: 'E', row: 4, text: 'Three in. Top of E.' },
  { score: 58, band: 'D', row: 3, text: 'D with all four improvements.' },
]
/** Pinned progress at which each recommendation lands. */
const LANDS = [0.6, 0.68, 0.76, 0.84]

const clamp = (t: number) => Math.min(1, Math.max(0, t))
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => 1 - Math.pow(1 - t, 2)   // out-quad: the camera settles instead of stopping

/**
 * The homepage's two moving parts, ported from prototype v7.2's page script: the hero's camera and climb, and the
 * How it works measuring line. One scroll-driven frame writes transforms and opacity only, at most once per frame.
 *
 * Hero: desktop pins (CSS) where the whole sheet fits under the bar with 56 px of scene above it; otherwise it adds
 * .is-static and runs in flow, as phones and reduced motion do. Pinned, the sky moves least, the roofs about three times
 * as far, the near ridge furthest; the copy rides with the roofs and clears before the rising sheet reaches the
 * button; then the plan draws and the four recommendations land. In flow, each lands as its row passes 70% of the
 * screen. Reduced motion shows the finished report: D 58, the plan drawn, every step of the line lit.
 */
export function HomeV7Motion() {
  useEffect(() => {
    const hero = document.getElementById('top')
    const tl = document.getElementById('tl')
    if (!hero || !tl) return
    const $ = (sel: string, root: ParentNode = hero) => root.querySelector<HTMLElement>(sel)!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const phone = window.matchMedia('(max-width: 759px)')
    const stage = $('.hero__stage'), report = $('.report'), strip = $('.strip'), reportBody = $('.report__body')
    const head = document.querySelector<HTMLElement>('header.sh')
    const headH = () => (head ? head.getBoundingClientRect().height : 0)
    const reportH = () => strip.offsetHeight + reportBody.offsetHeight
    const wantPin = () => !reduce && !phone.matches && reportH() + headH() + 56 <= window.innerHeight
    const pinned = () => !reduce && !phone.matches && !hero.classList.contains('is-static')

    let restTop = 0, stripH = 0, ctaBase = 0
    function layout() {
      hero!.classList.toggle('is-static', !wantPin())
      stripH = strip.offsetHeight
      restTop = window.innerHeight - reportH()
      // the button's bottom with the copy at rest, measured without the copy's current transform
      const copyEl = $('.hero__copy'), was = copyEl.style.transform
      copyEl.style.transform = 'none'
      ctaBase = $('#hero-quote').getBoundingClientRect().bottom - stage.getBoundingClientRect().top
      copyEl.style.transform = was
    }

    /* rolling digits: each digit is a column that slides to its value */
    function odo(el: HTMLElement, text: string, animate: boolean) {
      const chars = text.split('')
      const shape = chars.map((c) => (/\d/.test(c) ? 'd' : c)).join('')
      if (el.dataset.shape !== shape) {
        el.innerHTML = chars.map((c) => /\d/.test(c)
          ? '<span class="c"><span class="s">' + '0123456789'.split('').map((d) => '<span>' + d + '</span>').join('') + '</span></span>'
          : '<span>' + c + '</span>').join('')
        el.dataset.shape = shape
        animate = false
      }
      const cols = el.querySelectorAll<HTMLElement>('.s')
      let k = 0
      chars.forEach((c) => {
        if (!/\d/.test(c)) return
        const s = cols[k++]
        if (!animate || reduce) { s.style.transition = 'none'; void s.offsetHeight }
        s.style.transform = `translateY(${-Number(c)}em)`
        if (!animate || reduce) { void s.offsetHeight; s.style.transition = '' }
      })
    }

    /* the example report: the recommendations land, POTENTIAL steps F, E, D */
    const rows = hero.querySelectorAll<HTMLElement>('.measures li')
    const pot = $('[data-pot]'), potScore = $('[data-pot-score]'), verdict = $('.verdict')
    const plan = hero.querySelector<SVGSVGElement>('.hplan')!
    let shown = -1
    function setStep(n: number) {
      if (n === shown) return
      const first = shown < 0
      shown = n
      const s = STEPS[n]
      pot.dataset.band = s.band
      pot.style.setProperty('--row', String(s.row))
      odo(potScore, String(s.score), !first)
      verdict.textContent = s.text
      rows.forEach((r, i) => r.classList.toggle('is-on', i < n))
      stage.dataset.step = String(n)
    }
    let lastDraw = -1
    function setDraw(v: number) {
      v = Math.round(v * 200) / 200
      if (v !== lastDraw) { lastDraw = v; plan.style.setProperty('--draw', String(v)) }
    }

    /* how it works: the measuring line draws with the scroll */
    const rail = $('.tl__rail', tl), fill = $('.tl__fill', tl), dot = $('.tl__head', tl)
    const nums = tl.querySelectorAll<HTMLElement>('.tl__n'), steps = tl.querySelectorAll<HTMLElement>('.tl__step')
    let tlTop = 0, tlLen = 0, marks: number[] = [], tlD = -1
    function tlLayout() {
      // from 12 px under the first numeral to 12 px above the last, measured so it holds at every width and font load
      const base = tl!.getBoundingClientRect().top, a = nums[0].getBoundingClientRect(), z = nums[nums.length - 1].getBoundingClientRect()
      tlTop = Math.round(a.bottom - base + 12)
      tlLen = Math.max(Math.round(z.top - base - 12) - tlTop, 0)
      rail.style.top = tlTop + 'px'; rail.style.bottom = 'auto'; rail.style.height = tlLen + 'px'
      marks = Array.from(nums, (n) => n.getBoundingClientRect().top - base - tlTop)
      tlD = -1
    }
    function tlFrame(all: boolean) {
      const r = tl!.getBoundingClientRect()
      if (!all && (r.bottom < -200 || r.top > window.innerHeight + 200)) return
      // the reading line sits at 60% of the screen; a step lights once the line reaches its numeral
      const read = all ? Infinity : window.innerHeight * 0.6 - r.top - tlTop
      steps.forEach((s, i) => s.classList.toggle('is-on', read >= marks[i]))
      const d = Math.round(Math.min(Math.max(read, 0), tlLen))
      if (d === tlD) return
      tlD = d
      fill.style.transform = `scaleY(${(tlLen ? d / tlLen : 1).toFixed(4)})`
      dot.style.transform = `translate3d(0,${d}px,0)`
    }

    /* the camera: one scroll-driven frame writes every plane */
    const P: Record<string, HTMLElement | null> = {
      far: $('.pl--far'), glow: $('.pl--glow'), mid: $('.pl--mid'), mist: $('.pl--mist'), near: hero.querySelector('.pl--near'),
      copy: $('.hero__copy'), scrim: $('.hero__scrim'),
    }
    const sceneWrap = $('.scene-wrap')
    let last: Record<string, string | number> = {}
    const put = (k: string, v: string) => { const el = P[k]; if (el && last[k] !== v) { last[k] = v; el.style.transform = v } }
    const fade = (k: string, v: number) => {
      const el = P[k], key = k + ':o'
      v = Math.round(v * 100) / 100
      if (el && last[key] !== v) { last[key] = v; el.style.opacity = String(v) }
    }
    function heroProgress() {
      // pinned: the pin's own progress, from layout; in flow: the scene's own exit, from resting to scrolled off
      if (pinned()) { const r = hero!.getBoundingClientRect(); return clamp(-r.top / Math.max(r.height - window.innerHeight, 1)) }
      const r = sceneWrap.getBoundingClientRect()
      return r.height ? clamp(-r.top / r.height) : 0
    }
    function rowStep() {
      let n = 0
      const lim = window.innerHeight * 0.7
      rows.forEach((r, i) => { if (r.getBoundingClientRect().top < lim) n = i + 1 })
      return n
    }
    function frame() {
      const p = heroProgress(), H = window.innerHeight, pin = pinned()
      const t = ease(pin ? span(p, 0, 0.55) : p)
      // pinned, two phases: a small push while only the strip is up, then the camera tilts down as the sheet rises
      const a = pin ? ease(span(p, 0, 0.25)) : t, b = pin ? ease(span(p, 0.22, 0.55)) : 0, k = pin ? 1 : 0.3
      const y = (early: number, late: number) => ((-(early * a + late * b)) * k * H).toFixed(1)
      const zoom = pin ? span(p, 0, 0.55) : t
      put('far', `translate3d(-50%,${y(0.02, 0.08)}px,0) scale(${lerp(1.05, 1, zoom).toFixed(4)})`)
      put('glow', `translate3d(-50%,${y(0.03, 0.11)}px,0)`)
      put('mid', `translate3d(-50%,${y(0.05, 0.25)}px,0) scale(${lerp(1, 1.06, zoom).toFixed(4)})`)
      put('mist', `translate3d(${lerp(-52, -47, pin ? p : t).toFixed(2)}%,${y(0.03, 0.15)}px,0)`)
      fade('mist', lerp(1, 0.55, zoom))
      fade('glow', lerp(0.5, 1, pin ? span(p, 0.2, 0.9) : t))
      put('near', `translate3d(0,${(62 - 14 * a - 50 * b).toFixed(2)}%,0)`)
      const copyY = pin ? +y(0.05, 0.3) : -0.08 * t * H
      put('copy', `translate3d(0,${copyY.toFixed(1)}px,0)`)
      let copyO = 1
      if (pin) {
        // fades with the travel, and in any case before the rising sheet reaches the button
        const sheetTop = restTop + (H - restTop - stripH) * (1 - ease(span(p, 0.25, 0.52)))
        copyO = Math.min(1 - span(p, 0.36, 0.5), clamp((sheetTop - (ctaBase + copyY) - 24) / 120))
      }
      fade('copy', copyO)
      fade('scrim', copyO)
      let n = 0
      if (pin) {
        // the sheet rises from its strip to its resting place, then the plan draws and the rating climbs
        const rise = ease(span(p, 0.25, 0.52)), from = H - restTop - stripH
        const ry = lerp(from, 0, rise).toFixed(1)
        if (last.report !== ry) { last.report = ry; report.style.transform = `translate3d(0,${ry}px,0)` }
        setDraw(span(p, 0.32, 0.62))
        LANDS.forEach((at, i) => { if (p >= at) n = i + 1 })
      } else {
        if (last.report !== 'none') { last.report = 'none'; report.style.transform = '' }
        const pr = plan.getBoundingClientRect()
        setDraw(span(H * 0.95 - pr.top, 0, pr.height * 0.9))
        n = rowStep()
      }
      setStep(n)
      tlFrame(false)
    }

    let queued = false
    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => { queued = false; frame() })
    }
    const refresh = () => {
      layout(); tlLayout(); last = {}
      if (reduce) tlFrame(true); else frame()
    }
    let resizeT = 0
    const onResize = () => { window.clearTimeout(resizeT); resizeT = window.setTimeout(refresh, 150) }

    layout(); tlLayout()
    if (reduce) { setStep(4); setDraw(1); tlFrame(true) }
    else { setStep(0); window.addEventListener('scroll', onScroll, { passive: true }); frame() }
    window.addEventListener('resize', onResize)
    let live = true
    document.fonts?.ready.then(() => { if (live) refresh() })
    return () => {
      live = false
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeT)
    }
  }, [])
  return null
}
