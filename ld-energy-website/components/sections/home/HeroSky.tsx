'use client'

import { useEffect, useRef } from 'react'

/**
 * The dusk hero's living layer (Abdul 23/10/2026: "maybe we could add some animations or effects like stars coming in
 * etc, experiment"). One canvas over the picture, in the picture's own coordinates (the 3120 x 1344 master), so it moves
 * with the plane's parallax and lines up at every width.
 *
 * Variants for the staging comparison, picked with ?fx= (default "lights"):
 *   stars   stars fade in one by one, then twinkle
 *   lights  stars, and the cut-open rooms light up floor by floor, as if someone just got home
 *   shoot   stars, the rooms lighting up, and now and then a shooting star
 *   none    the picture alone
 * Reduced motion: the finished frame, drawn once, with nothing moving.
 */

type Fx = 'stars' | 'lights' | 'shoot' | 'none'
const MASTER = { w: 3120, h: 1344 }
// the phone picture is a crop of the master (see public/home/hero-dusk-phone-*.webp)
const PHONE_CROP = { x: 1000, y: 0, w: 2100, h: 1300 }
// the rooms, top floor first, in master pixels (measured from the lit pixels of d1-clean.png): each fades from dark to lit
const FLOORS = [
  { x: 1990, y: 176, w: 480, h: 198 },
  { x: 1872, y: 388, w: 716, h: 238 },
  { x: 1872, y: 645, w: 716, h: 254 },
  { x: 1872, y: 921, w: 632, h: 250 },
]
const ROOM_DARK = 'rgba(21, 24, 44, 0.86)'

interface Star { x: number; y: number; r: number; delay: number; speed: number; phase: number }

/** Stars only where the picture is open sky: dark, flat, in the top half of the master. */
function findStars(img: HTMLImageElement, count: number): Star[] {
  const sw = 312, sh = 134
  const c = document.createElement('canvas'); c.width = sw; c.height = sh
  const g = c.getContext('2d', { willReadFrequently: true })
  if (!g) return []
  g.drawImage(img, 0, 0, sw, sh)
  const px = g.getImageData(0, 0, sw, sh).data
  const sky: [number, number][] = []
  // from 16 px down in the 312 px sample (150 master px), so no star sits among the nav links
  for (let y = 16; y < sh * 0.5; y++) for (let x = 2; x < sw - 2; x++) {
    const i = (y * sw + x) * 4
    const lum = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]
    const j = (y * sw + x + 2) * 4, k = ((y + 2) * sw + x) * 4
    const flat = Math.abs(px[i] - px[j]) + Math.abs(px[i] - px[k]) < 10
    if (lum < 48 && flat) sky.push([x, y])
  }
  // a fixed seed, so the sky is the same on every visit and in every screenshot
  let seed = 7
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  const stars: Star[] = []
  for (let n = 0; n < count && sky.length; n++) {
    const [x, y] = sky[Math.floor(rand() * sky.length)]
    stars.push({
      x: (x + rand()) * (MASTER.w / sw), y: (y + rand()) * (MASTER.h / sh),
      r: rand() < 0.12 ? 2.6 : 1.2 + rand() * 1.1, delay: 300 + rand() * 2200, speed: 0.6 + rand() * 1.4, phase: rand() * 6.28,
    })
  }
  return stars
}

export function HeroSky() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const plane = canvas?.parentElement
    const img = plane?.querySelector('img')
    if (!canvas || !plane || !img) return
    const param = new URLSearchParams(window.location.search).get('fx')
    const fx: Fx = param === 'stars' || param === 'shoot' || param === 'none' ? param : 'lights'
    if (fx === 'none') return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0, visible = true, t0 = 0, stars: Star[] = [], nextShoot = 6000
    let shot: { x: number; y: number; t: number } | null = null

    // where the master sits inside the plane: object-fit cover at 70% 100% from 760 px, the crop at full width on phones
    function frame() {
      const w = plane!.clientWidth, h = plane!.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (canvas!.width !== Math.round(w * dpr)) { canvas!.width = Math.round(w * dpr); canvas!.height = Math.round(h * dpr) }
      let s: number, ox: number, oy: number
      if (window.matchMedia('(max-width: 759px)').matches) {
        s = w / PHONE_CROP.w; ox = -PHONE_CROP.x * s; oy = -PHONE_CROP.y * s
      } else {
        s = Math.max(w / MASTER.w, h / MASTER.h); ox = (w - MASTER.w * s) * 0.7; oy = h - MASTER.h * s
      }
      return { w, h, dpr, s, ox, oy }
    }

    function draw(now: number) {
      const f = frame()
      const t = still ? 1e9 : now - t0
      ctx!.setTransform(f.dpr, 0, 0, f.dpr, 0, 0)
      ctx!.clearRect(0, 0, f.w, f.h)
      ctx!.setTransform(f.dpr * f.s, 0, 0, f.dpr * f.s, f.dpr * f.ox, f.dpr * f.oy)

      for (const st of stars) {
        const fade = Math.min(1, Math.max(0, (t - st.delay) / 900))
        if (!fade) continue
        const tw = still ? 0.85 : 0.62 + 0.38 * Math.sin(st.phase + (t / 1000) * st.speed)
        const r = st.r / Math.max(f.s, 0.2) * 0.55
        ctx!.globalAlpha = fade * tw
        ctx!.fillStyle = '#F4EEDC'
        ctx!.beginPath(); ctx!.arc(st.x, st.y, r, 0, 6.2832); ctx!.fill()
        if (st.r > 2.4) { ctx!.globalAlpha = fade * tw * 0.18; ctx!.beginPath(); ctx!.arc(st.x, st.y, r * 3.2, 0, 6.2832); ctx!.fill() }
      }

      if (fx !== 'stars') FLOORS.forEach((fl, i) => {
        // each floor waits its turn, flickers once like a real switch, then stays lit
        const start = 900 + i * 520
        const p = Math.min(1, Math.max(0, (t - start) / 700))
        const flick = p > 0.15 && p < 0.3 ? 0.55 : 0
        const dark = still ? 0 : (1 - p) + flick * (1 - p)
        if (dark <= 0.01) return
        ctx!.globalAlpha = Math.min(1, dark)
        ctx!.fillStyle = ROOM_DARK
        ctx!.fillRect(fl.x, fl.y, fl.w, fl.h)
      })

      if (fx === 'shoot' && !still) {
        if (!shot && t > nextShoot) { shot = { x: 400 + Math.random() * 900, y: 60 + Math.random() * 160, t }; nextShoot = t + 9000 + Math.random() * 7000 }
        if (shot) {
          const p = (t - shot.t) / 900
          if (p >= 1) shot = null
          else {
            const x = shot.x + p * 520, y = shot.y + p * 190
            const grad = ctx!.createLinearGradient(x - 160, y - 58, x, y)
            grad.addColorStop(0, 'rgba(244,238,220,0)'); grad.addColorStop(1, 'rgba(244,238,220,0.9)')
            ctx!.globalAlpha = Math.sin(p * Math.PI)
            ctx!.strokeStyle = grad; ctx!.lineWidth = 2.2 / Math.max(f.s, 0.2) * 0.5
            ctx!.beginPath(); ctx!.moveTo(x - 160, y - 58); ctx!.lineTo(x, y); ctx!.stroke()
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
      stars = findStars(img!, window.matchMedia('(max-width: 759px)').matches ? 46 : 70)
      if (still) { draw(0); return }
      raf = requestAnimationFrame(loop)
    }
    // the stars only stop drawing while the hero is out of view or the tab is hidden
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !still && stars.length) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop) }
    })
    io.observe(plane)
    const onVis = () => { if (!document.hidden && visible && !still && stars.length) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop) } }
    document.addEventListener('visibilitychange', onVis)
    const onResize = () => { if (still) draw(0) }
    window.addEventListener('resize', onResize)

    if (img.complete && img.naturalWidth) start()
    else img.addEventListener('load', start, { once: true })

    return () => {
      cancelAnimationFrame(raf); io.disconnect()
      document.removeEventListener('visibilitychange', onVis); window.removeEventListener('resize', onResize)
      img.removeEventListener('load', start)
    }
  }, [])

  return <canvas ref={ref} className="hero__sky" aria-hidden="true" />
}
