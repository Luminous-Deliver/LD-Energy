'use client'

import { useEffect, useRef } from 'react'

/**
 * The dusk hero's living layer. One canvas over the picture, in the picture's own coordinates (the 3120 x 1344
 * master), so it moves with the plane's parallax and lines up at every width.
 *
 * Abdul 23/10/2026 picked the sequence: the stars come in, then each floor switches on from the top with one small
 * flicker like a real light switch, then now and then a shooting star. More stars, a bit brighter, and the rooms must
 * light up smoothly inside their own walls (the first build darkened plain rectangles, which showed as black boxes).
 *
 * So the dark state of each floor is made from the picture itself: only the warm, bright pixels inside the floor's
 * bounds are darkened, weighted by how lit they are, so the shade hugs the windows and rooms exactly.
 *
 * ?fx=stars|lights|none still isolates one layer for comparison; the default is the full sequence.
 * Reduced motion: the finished frame, drawn once, with nothing moving.
 */

type Fx = 'all' | 'stars' | 'lights' | 'none'
const MASTER = { w: 3120, h: 1344 }
// the phone picture is a crop of the master (see public/home/hero-dusk-phone-*.webp)
const PHONE_CROP = { x: 1000, y: 0, w: 2100, h: 1300 }
// the rooms, top floor first, in master pixels (measured from the lit pixels of d1-clean.png), with a margin: the
// mask below decides what actually darkens, so the bounds only need to contain each floor
const FLOORS = [
  { x: 1852, y: 130, w: 756, h: 252 },
  { x: 1852, y: 380, w: 756, h: 254 },
  { x: 1852, y: 636, w: 756, h: 272 },
  { x: 1852, y: 912, w: 672, h: 268 },
]
const STARS_START = 200, STARS_SPREAD = 1800
const LIGHTS_START = 2300, LIGHTS_GAP = 650

interface Star { x: number; y: number; r: number; delay: number; speed: number; phase: number }
interface Region { x: number; y: number; w: number; h: number }

/** Which part of the master the loaded picture shows: the phone crop is narrower than the master's 2.32 : 1. */
function regionOf(img: HTMLImageElement): Region {
  return img.naturalWidth / img.naturalHeight < 2 ? PHONE_CROP : { x: 0, y: 0, ...MASTER }
}

/** Stars only where the picture is open sky: dark, flat, in the top half of the master. */
function findStars(img: HTMLImageElement, count: number): Star[] {
  const reg = regionOf(img)
  const sw = 312, sh = Math.round(312 * reg.h / reg.w)
  const c = document.createElement('canvas'); c.width = sw; c.height = sh
  const g = c.getContext('2d', { willReadFrequently: true })
  if (!g) return []
  g.drawImage(img, 0, 0, sw, sh)
  const px = g.getImageData(0, 0, sw, sh).data
  const k = reg.w / sw
  const sky: [number, number][] = []
  for (let y = 2; y < sh - 2; y++) for (let x = 2; x < sw - 2; x++) {
    const my = reg.y + y * k
    // from 150 master px down, so no star sits among the nav links; top half only
    if (my < 150 || my > MASTER.h * 0.5) continue
    const i = (y * sw + x) * 4
    const lum = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]
    const j = (y * sw + x + 2) * 4, l = ((y + 2) * sw + x) * 4
    const flat = Math.abs(px[i] - px[j]) + Math.abs(px[i] - px[l]) < 10
    if (lum < 48 && flat) sky.push([x, y])
  }
  // a fixed seed, so the sky is the same on every visit and in every screenshot
  let seed = 7
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  const stars: Star[] = []
  for (let n = 0; n < count && sky.length; n++) {
    const [x, y] = sky[Math.floor(rand() * sky.length)]
    const big = rand()
    stars.push({
      x: reg.x + (x + rand()) * k, y: reg.y + (y + rand()) * k,
      r: big < 0.16 ? 3 : 1.5 + rand() * 1.2, delay: STARS_START + rand() * STARS_SPREAD, speed: 0.5 + rand() * 1.2, phase: rand() * 6.28,
    })
  }
  return stars
}

/** Each floor's dark state, cut from the picture: lit pixels pulled down to night, everything else left clear. */
function floorShades(img: HTMLImageElement): (HTMLCanvasElement | null)[] {
  const reg = regionOf(img)
  const k = img.naturalWidth / reg.w
  return FLOORS.map(fl => {
    const sx = Math.max(0, (fl.x - reg.x) * k), sy = Math.max(0, (fl.y - reg.y) * k)
    const sw = Math.min(img.naturalWidth - sx, fl.w * k), sh = Math.min(img.naturalHeight - sy, fl.h * k)
    if (sw <= 0 || sh <= 0) return null
    const c = document.createElement('canvas'); c.width = Math.round(sw); c.height = Math.round(sh)
    const g = c.getContext('2d', { willReadFrequently: true })
    if (!g) return null
    g.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height)
    const d = g.getImageData(0, 0, c.width, c.height)
    const p = d.data, W = c.width, H = c.height
    // lamplight is bright and warm; dusk walls and sky are dim or blue
    let lit = new Float32Array(W * H)
    for (let i = 0, n = 0; i < p.length; i += 4, n++) {
      const r = p[i], gr = p[i + 1], b = p[i + 2]
      const lum = 0.2126 * r + 0.7152 * gr + 0.0722 * b
      lit[n] = Math.min(1, Math.max(0, (lum - 70) / 90)) * Math.min(1, Math.max(0, (r - b) / 50))
    }
    // spread it a few pixels (two box passes each way), so the furniture and the wall edges inside a lit room go
    // dark with it instead of glowing as outlines; the bleed lands on the dark wall lines, where it cannot show
    const rad = Math.max(2, Math.round(W / 120))
    for (let pass = 0; pass < 2; pass++) {
      const h = new Float32Array(W * H), v = new Float32Array(W * H)
      for (let y = 0; y < H; y++) { let acc = 0; for (let x = -rad; x < W; x++) {
        if (x + rad < W) acc += lit[y * W + x + rad]; if (x - rad - 1 >= 0) acc -= lit[y * W + x - rad - 1]
        if (x >= 0) h[y * W + x] = acc / (2 * rad + 1) } }
      for (let x = 0; x < W; x++) { let acc = 0; for (let y = -rad; y < H; y++) {
        if (y + rad < H) acc += h[(y + rad) * W + x]; if (y - rad - 1 >= 0) acc -= h[(y - rad - 1) * W + x]
        if (y >= 0) v[y * W + x] = acc / (2 * rad + 1) } }
      lit = v
    }
    for (let i = 0, n = 0; i < p.length; i += 4, n++) {
      const r = p[i], gr = p[i + 1], b = p[i + 2]
      p[i] = 15 + r * 0.08; p[i + 1] = 18 + gr * 0.08; p[i + 2] = 34 + b * 0.1
      p[i + 3] = Math.round(255 * Math.min(1, lit[n] * 2.2))
    }
    g.putImageData(d, 0, 0)
    return c
  })
}

/** How dark a floor is at time t since its switch: one short flicker, then a quick warm settle. */
function darkness(t: number): number {
  if (t < 0) return 1
  if (t < 70) return 0.15            // on
  if (t < 190) return 0.85           // the flicker: off again for a beat
  const p = Math.min(1, (t - 190) / 420)
  return 1 - (1 - (1 - p) * (1 - p)) // ease out to fully lit
}

export function HeroSky() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const plane = canvas?.parentElement
    const img = plane?.querySelector('img')
    if (!canvas || !plane || !img) return
    const param = new URLSearchParams(window.location.search).get('fx')
    const fx: Fx = param === 'stars' || param === 'lights' || param === 'none' ? param : 'all'
    if (fx === 'none') return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0, visible = true, t0 = 0, stars: Star[] = [], shades: (HTMLCanvasElement | null)[] = []
    let src = '', t0Set = false, nextShoot = LIGHTS_START + FLOORS.length * LIGHTS_GAP + 1800
    let shot: { x: number; y: number; t: number; len: number } | null = null

    // where the master sits inside the plane: object-fit cover at 70% 100% from 760 px, the crop at full width on phones
    function frame() {
      const w = plane!.clientWidth, h = plane!.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (canvas!.width !== Math.round(w * dpr) || canvas!.height !== Math.round(h * dpr)) {
        canvas!.width = Math.round(w * dpr); canvas!.height = Math.round(h * dpr)
      }
      let s: number, ox: number, oy: number
      if (window.matchMedia('(max-width: 759px)').matches) {
        s = w / PHONE_CROP.w; ox = -PHONE_CROP.x * s; oy = -PHONE_CROP.y * s
      } else {
        s = Math.max(w / MASTER.w, h / MASTER.h); ox = (w - MASTER.w * s) * 0.7; oy = h - MASTER.h * s
      }
      return { w, h, dpr, s, ox, oy }
    }

    // The picture swaps between the phone crop and the master at 760 px, so the stars and shades follow it. They are
    // cut from a plain copy of the current file: a srcset image reports a density-corrected naturalWidth (1440 for
    // the 1600 px file at 1440 wide) while drawImage reads bitmap pixels, which put every shade about 11% off.
    function prepare() {
      if (!img!.naturalWidth || img!.currentSrc === src) return
      src = img!.currentSrc
      const copy = new Image()
      copy.decoding = 'async'
      copy.onload = () => {
        if (copy.src !== src) return
        stars = fx === 'lights' ? [] : findStars(copy, regionOf(copy) === PHONE_CROP ? 70 : 120)
        shades = fx === 'stars' ? [] : floorShades(copy)
        // the sequence starts once the shades exist, so the rooms never show lit before they switch on
        if (!t0Set) { t0 = 0; t0Set = true }
        if (still) draw(0)
      }
      copy.src = src
    }

    function draw(now: number) {
      prepare()
      const f = frame()
      const t = still ? 1e9 : now - t0
      ctx!.setTransform(f.dpr, 0, 0, f.dpr, 0, 0)
      ctx!.clearRect(0, 0, f.w, f.h)
      ctx!.setTransform(f.dpr * f.s, 0, 0, f.dpr * f.s, f.dpr * f.ox, f.dpr * f.oy)
      const px = 1 / Math.max(f.s, 0.2) // one screen pixel, in master pixels

      ctx!.fillStyle = '#F7F1E0'
      for (const st of stars) {
        const fade = Math.min(1, Math.max(0, (t - st.delay) / 1100))
        if (!fade) continue
        const tw = still ? 0.92 : 0.74 + 0.26 * Math.sin(st.phase + (t / 1000) * st.speed)
        const r = st.r * px * 0.6
        ctx!.globalAlpha = fade * fade * tw
        ctx!.beginPath(); ctx!.arc(st.x, st.y, r, 0, 6.2832); ctx!.fill()
        if (st.r > 2.6) { ctx!.globalAlpha = fade * tw * 0.22; ctx!.beginPath(); ctx!.arc(st.x, st.y, r * 3.4, 0, 6.2832); ctx!.fill() }
      }

      if (!still) shades.forEach((shade, i) => {
        if (!shade) return
        const a = darkness(t - (fx === 'lights' ? 600 : LIGHTS_START) - i * LIGHTS_GAP)
        if (a <= 0.01) return
        const fl = FLOORS[i]
        ctx!.globalAlpha = a
        ctx!.drawImage(shade, fl.x, fl.y, fl.w, fl.h)
      })

      if (fx === 'all' && !still) {
        if (!shot && t > nextShoot && stars.length) {
          const reg = regionOf(img!)
          // the open sky band between the nav and the headline, left of the house, on whichever picture is showing;
          // a shallow path (below) so it never crosses the words
          const left = Math.max(reg.x + 80, 600)
          shot = { x: left + Math.random() * Math.max(200, 1500 - left), y: 165 + Math.random() * 45, t, len: 200 + Math.random() * 90 }
          nextShoot = t + 8000 + Math.random() * 7000
        }
        if (shot) {
          const p = (t - shot.t) / 1000
          if (p >= 1) shot = null
          else {
            const e = 1 - (1 - p) * (1 - p)
            const x = shot.x + e * 520, y = shot.y + e * 80
            const dx = shot.len, dy = shot.len * 0.154
            const grad = ctx!.createLinearGradient(x - dx, y - dy, x, y)
            grad.addColorStop(0, 'rgba(247,241,224,0)'); grad.addColorStop(1, 'rgba(247,241,224,0.95)')
            ctx!.globalAlpha = Math.sin(p * Math.PI)
            ctx!.strokeStyle = grad; ctx!.lineWidth = 1.6 * px; ctx!.lineCap = 'round'
            ctx!.beginPath(); ctx!.moveTo(x - dx, y - dy); ctx!.lineTo(x, y); ctx!.stroke()
            ctx!.beginPath(); ctx!.arc(x, y, 1.4 * px, 0, 6.2832); ctx!.fillStyle = '#FFFBEF'; ctx!.fill()
            ctx!.fillStyle = '#F7F1E0'
          }
        }
      }
      ctx!.globalAlpha = 1
    }

    function loop(now: number) {
      if (!t0) t0 = now
      draw(now)
      if (visible && !document.hidden) raf = requestAnimationFrame(loop)
    }

    function start() {
      if (still) { draw(0); return }
      cancelAnimationFrame(raf); raf = requestAnimationFrame(loop)
    }
    // the sky only draws while the hero is in view and the tab is showing
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !still && src) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop) }
    })
    io.observe(plane)
    const onVis = () => { if (!document.hidden && visible && !still && src) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop) } }
    document.addEventListener('visibilitychange', onVis)
    const onResize = () => { if (still) draw(0) }
    window.addEventListener('resize', onResize)
    // load also fires when the picture swaps source at the breakpoint
    img.addEventListener('load', start)
    if (img.complete && img.naturalWidth) start()

    return () => {
      cancelAnimationFrame(raf); io.disconnect()
      document.removeEventListener('visibilitychange', onVis); window.removeEventListener('resize', onResize)
      img.removeEventListener('load', start)
    }
  }, [])

  return <canvas ref={ref} className="hero__sky" aria-hidden="true" />
}
