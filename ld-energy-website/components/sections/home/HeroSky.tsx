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
// Abdul 23/10/2026 (second pass): the first room switched on too late (about 2.3 s), make it about 0.5 s; more stars,
// brighter. The stars now arrive alongside the first floors instead of before them.
const STARS_START = 0, STARS_SPREAD = 1400
const LIGHTS_START = 500, LIGHTS_GAP = 520

// Abdul 23/10/2026 (third pass): brighter, better designed stars, spread out, and on phones filling the empty night
// beside the headline. Three kinds: pinpricks, soft-glow stars, and a few bright ones with a faint four-point sparkle,
// each slightly warm, white or cool. Drawn from pre-rendered sprites, so a frame is drawImage calls, not gradients.
type Kind = 0 | 1 | 2
interface Star { x: number; y: number; r: number; kind: Kind; tint: number; delay: number; speed: number; phase: number }
/** A shooting star's run, in the stage's screen pixels: start, unit direction, tail length, distance the head travels. */
interface ShotPath { x: number; y: number; ux: number; uy: number; L: number; D: number }
const SHOT_MS = 1150

/** The streak: a soft wide glow, a tapered bright core, a glowing head. Grows in, runs, burns out. */
function drawShot(ctx: CanvasRenderingContext2D, s: ShotPath, p: number) {
  const e = 1 - (1 - p) ** 3
  const hx = s.x + s.ux * s.D * e, hy = s.y + s.uy * s.D * e
  const len = s.L * Math.min(1, p * 3) * (1 - 0.4 * Math.max(0, (p - 0.6) / 0.4))
  const tx = hx - s.ux * len, ty = hy - s.uy * len, nx = -s.uy, ny = s.ux
  ctx.globalAlpha = p < 0.1 ? p / 0.1 : p > 0.7 ? (1 - p) / 0.3 : 1
  const glow = ctx.createLinearGradient(tx, ty, hx, hy)
  glow.addColorStop(0, 'rgba(176,192,255,0)'); glow.addColorStop(1, 'rgba(200,214,255,0.3)')
  ctx.strokeStyle = glow; ctx.lineWidth = 7; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke()
  const core = ctx.createLinearGradient(tx, ty, hx, hy)
  core.addColorStop(0, 'rgba(255,248,230,0)'); core.addColorStop(0.7, 'rgba(255,248,230,0.55)'); core.addColorStop(1, 'rgba(255,253,244,1)')
  ctx.fillStyle = core
  ctx.beginPath(); ctx.moveTo(hx + nx * 1.7, hy + ny * 1.7); ctx.lineTo(tx, ty); ctx.lineTo(hx - nx * 1.7, hy - ny * 1.7); ctx.closePath(); ctx.fill()
  const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, 12)
  halo.addColorStop(0, 'rgba(255,251,238,0.95)'); halo.addColorStop(0.3, 'rgba(214,224,255,0.35)'); halo.addColorStop(1, 'rgba(214,224,255,0)')
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(hx, hy, 12, 0, 6.2832); ctx.fill()
  ctx.fillStyle = '#FFFDF6'
  ctx.beginPath(); ctx.arc(hx, hy, 2, 0, 6.2832); ctx.fill()
  ctx.globalAlpha = 1
}
const TINTS = ['255,249,236', '228,236,255', '255,236,204']
const SPRITE_CSS = [8, 18, 46]          // sprite box per kind, in screen px at r = SPRITE_R
const SPRITE_R = [1, 1.6, 2.1]
const SPRITE_RES = 4
let sprites: HTMLCanvasElement[][] | null = null

function starSprites(): HTMLCanvasElement[][] {
  if (sprites) return sprites
  sprites = ([0, 1, 2] as Kind[]).map(kind => TINTS.map(c => {
    const n = SPRITE_CSS[kind] * SPRITE_RES, m = n / 2, R = SPRITE_R[kind] * SPRITE_RES
    const cv = document.createElement('canvas'); cv.width = cv.height = n
    const g = cv.getContext('2d')!
    const glow = Math.min(m, [2.4, 4.6, 6.5][kind] * R)
    const rg = g.createRadialGradient(m, m, 0, m, m, glow)
    rg.addColorStop(0, 'rgba(255,255,255,1)')
    rg.addColorStop(R / glow * 0.7, `rgba(${c},1)`)
    rg.addColorStop(R / glow * 1.5, `rgba(${c},${kind ? 0.5 : 0.45})`)
    rg.addColorStop(Math.min(0.99, R / glow * 3.2), `rgba(${c},${kind ? 0.12 : 0.05})`)
    rg.addColorStop(1, `rgba(${c},0)`)
    g.fillStyle = rg; g.beginPath(); g.arc(m, m, glow, 0, 6.2832); g.fill()
    if (kind === 2) {
      // the sparkle: two thin rays, brightest at the centre, gone well inside the sprite's edge
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        const lg = g.createLinearGradient(m - dx * m, m - dy * m, m + dx * m, m + dy * m)
        lg.addColorStop(0, `rgba(${c},0)`); lg.addColorStop(0.5, `rgba(${c},0.75)`); lg.addColorStop(1, `rgba(${c},0)`)
        g.strokeStyle = lg; g.lineWidth = 0.9 * SPRITE_RES
        g.beginPath(); g.moveTo(m - dx * m * 0.95, m - dy * m * 0.95); g.lineTo(m + dx * m * 0.95, m + dy * m * 0.95); g.stroke()
      }
    }
    return cv
  }))
  return sprites
}

/** One star at (x, y); u is one screen pixel in the current units. */
function drawStar(ctx: CanvasRenderingContext2D, st: Star, alpha: number, u: number) {
  const box = SPRITE_CSS[st.kind] * (st.r / SPRITE_R[st.kind]) * u
  ctx.globalAlpha = Math.min(1, alpha)
  ctx.drawImage(starSprites()[st.kind][st.tint], st.x - box / 2, st.y - box / 2, box, box)
}

/** A star's look, from one random draw: mostly pinpricks, a fifth soft-glow, one in fourteen a bright sparkle. */
function starLook(rand: () => number): Omit<Star, 'x' | 'y'> {
  const roll = rand()
  const kind: Kind = roll < 0.07 ? 2 : roll < 0.28 ? 1 : 0
  const r = kind === 2 ? 2 + rand() * 0.5 : kind === 1 ? 1.6 + rand() * 0.6 : 1.1 + rand() * 0.6
  const t = rand()
  return { r, kind, tint: t < 0.62 ? 0 : t < 0.84 ? 1 : 2, delay: STARS_START + rand() * STARS_SPREAD, speed: 0.5 + rand() * 1.2, phase: rand() * 6.28 }
}

/** Twinkle: pinpricks shimmer gently, the bright ones breathe a little deeper. */
function twinkle(st: Star, t: number, still: boolean): number {
  if (still) return 1
  const depth = st.kind === 2 ? 0.28 : 0.18
  return 1 - depth + depth * Math.sin(st.phase + (t / 1000) * st.speed)
}

/** The rectangles the headline, intro and buttons actually cover, line by line, padded, relative to `origin`. */
function textBoxes(scope: Element, origin: DOMRect, pad: number): DOMRect[] {
  const out: DOMRect[] = []
  const add = (r: DOMRect) => out.push(new DOMRect(r.left - origin.left - pad, r.top - origin.top - pad, r.width + pad * 2, r.height + pad * 2))
  const range = document.createRange()
  scope.querySelectorAll('.hero__head .eyebrow, .hero__title, .hero__sub, .hero__cta .link').forEach(el => {
    range.selectNodeContents(el)
    Array.from(range.getClientRects()).forEach(add)
  })
  scope.querySelectorAll('.hero__cta .btn').forEach(el => add(el.getBoundingClientRect()))
  return out
}
const inBox = (x: number, y: number, boxes: DOMRect[]) => boxes.some(b => x >= b.left && x <= b.right && y >= b.top && y <= b.bottom)

const seeded = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
interface Region { x: number; y: number; w: number; h: number }

/** Which part of the master the loaded picture shows: the phone crop is narrower than the master's 2.32 : 1. */
function regionOf(img: HTMLImageElement): Region {
  return img.naturalWidth / img.naturalHeight < 2 ? PHONE_CROP : { x: 0, y: 0, ...MASTER }
}

/** Stars only where the picture is open sky: dark, flat, in the top half of the master. */
function findStars(img: HTMLImageElement, count: number): { stars: Star[]; roof: (mx: number) => number } {
  const reg = regionOf(img)
  const sw = 312, sh = Math.round(312 * reg.h / reg.w)
  const c = document.createElement('canvas'); c.width = sw; c.height = sh
  const g = c.getContext('2d', { willReadFrequently: true })
  if (!g) return { stars: [], roof: () => 0 }
  g.drawImage(img, 0, 0, sw, sh)
  const px = g.getImageData(0, 0, sw, sh).data
  const k = reg.w / sw
  const sky: [number, number][] = []
  // Open sky only: each column is walked down from the top and closes at the first roof, chimney or wall. Dark, flat brick in shadow passed the old
  // per-pixel test, which put stars on the right-hand houses (Abdul 24/10, "fix the stars").
  const isSky = (x: number, y: number) => {
    const i = (y * sw + x) * 4
    const lum = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]
    const j = (y * sw + x + 2) * 4, l = ((y + 2) * sw + x) * 4
    const flat = Math.abs(px[i] - px[j]) + Math.abs(px[i] - px[l]) < 10
    return lum < 48 && flat
  }
  // where each column's open sky ends (its first roof, chimney or wall pixel). The first non-sky pixel closes it: a
  // roofline is a thin stroke and the dark slate roof below it is as flat as the sky.
  const close: number[] = []
  for (let x = 0; x < sw; x++) {
    let y = 2
    while (y < sh - 2 && reg.y + y * k <= MASTER.h * 0.5 && isSky(Math.min(sw - 3, Math.max(2, x)), y)) y++
    close.push(y)
  }
  // a star needs open sky 5 px either side and 8 px below it (about 50 and 80 master px), so none sits against a wall,
  // a chimney, a roof or the frame's edge
  const R = 5
  for (let x = R + 2; x < sw - R - 2; x++) {
    let top = Infinity
    for (let d = -R; d <= R; d++) top = Math.min(top, close[x + d])
    for (let y = 2; y < top - 8; y++) if (reg.y + y * k >= 150) sky.push([x, y])
  }
  // a fixed seed, so the sky is the same on every visit and in every screenshot
  const rand = seeded(7)
  const stars: Star[] = []
  // spread out: a pick too close to an earlier star is redrawn (a few tries), so the sky never clumps
  // never closer than 80 master px, and no fallback that drops the gap: with the sky now ending at the roofline the old
  // last-resort picks piled the stars into clumps just above the roofs (Abdul 24/10)
  const gap = Math.max(60, Math.sqrt((sky.length * k * k) / Math.max(1, count)) * 0.55)
  for (let n = 0, tries = 0; n < count && sky.length && tries < count * 12; tries++) {
    const [x, y] = sky[Math.floor(rand() * sky.length)]
    const sx = reg.x + (x + rand()) * k, sy = reg.y + (y + rand()) * k
    if (stars.some(o => (o.x - sx) ** 2 + (o.y - sy) ** 2 < gap * gap)) continue
    stars.push({ x: sx, y: sy, ...starLook(rand) })
    n++
  }
  // the roofline in master pixels, for the shooting star's path
  const roof = (mx: number) => {
    const x = Math.round((mx - reg.x) / k)
    return x < 0 || x >= sw ? 0 : reg.y + close[x] * k
  }
  return { stars, roof }
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
    let src = '', t0Set = false, nextShoot = LIGHTS_START + (FLOORS.length - 1) * LIGHTS_GAP + 610 + 500 /* 0.5 s after the last floor is fully lit (darkness() takes 610 ms; Abdul 24/10) */
    let roof: (mx: number) => number = () => 0, lit = false
    let boxes: DOMRect[] = [], boxW = -1, boxH = -1

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
      if (w !== boxW || h !== boxH) {
        const stage = plane!.closest('.hero__stage')
        boxes = stage ? textBoxes(stage, plane!.getBoundingClientRect(), 6) : []
        boxW = w; boxH = h
      }
      return { w, h, dpr, s, ox, oy, boxes }
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
        const found = findStars(copy, regionOf(copy) === PHONE_CROP ? 55 : 320)
        stars = fx === 'lights' ? [] : found.stars
        roof = found.roof
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

      // no star behind a word: a dot inside a letter reads as a speck, not a star
      for (const st of stars) {
        const fade = Math.min(1, Math.max(0, (t - st.delay) / 800))
        if (!fade) continue
        if (f.boxes.length && inBox(f.ox + st.x * f.s, f.oy + st.y * f.s, f.boxes)) continue
        drawStar(ctx!, st, fade * twinkle(st, t, still), px)
      }
      ctx!.fillStyle = '#F7F1E0'

      if (!still) shades.forEach((shade, i) => {
        if (!shade) return
        const a = darkness(t - (fx === 'lights' ? 600 : LIGHTS_START) - i * LIGHTS_GAP)
        if (a <= 0.01) return
        const fl = FLOORS[i]
        ctx!.globalAlpha = a
        ctx!.drawImage(shade, fl.x, fl.y, fl.w, fl.h)
      })

      // the rooms are all on: the plane's warm bloom fades in (CSS, .pl--mid[data-lit])
      if (!lit && shades.length && (still || t > LIGHTS_START + (FLOORS.length - 1) * LIGHTS_GAP + 300)) {
        lit = true; plane!.dataset.lit = 'true'
      }

      // Abdul 24/10 ("make shooting star bigger better"): it was drawn here, inside the plane whose top fades into the
      // night, so it flew at half strength, and its fixed band could pass the headline. This layer picks a clear path;
      // HeroNight, unmasked and in screen pixels, draws it.
      // once the sky is read (the phone crop can have no picture stars of its own, so not stars.length)
      if (fx === 'all' && !still && t > nextShoot && t0Set) {
        const path = shootPath(f)
        // no clear run this time (a narrow window, the headline in the way): look again shortly
        nextShoot = t + (path ? 7000 + Math.random() * 6000 : 1500)
        plane!.dataset.shot = path ? 'ok' : 'miss' // for the tests
        if (path) plane!.dispatchEvent(new CustomEvent('hero:shoot', { bubbles: true, detail: path }))
      }
      ctx!.globalAlpha = 1
    }

    // a straight path through open sky, in the stage's screen pixels: never across a word or button, never below the
    // roofline (30 px clear of it), never under the menu
    function shootPath(f: { s: number; ox: number; oy: number; w: number }): ShotPath | null {
      const stage = plane!.closest('.hero__stage')
      if (!stage) return null
      const o = stage.getBoundingClientRect(), pr = plane!.getBoundingClientRect()
      const W = o.width, phone = W < 760
      const words = textBoxes(stage, o, phone ? 10 : 18)
      const head = document.querySelector('header')?.getBoundingClientRect()
      const top = Math.max(0, (head ? head.bottom - o.top : 0) + 14)
      // a phone's open sky is one pocket, about 124 x 90 px beside the button and above the roofs at 360 wide (measured
      // 24/10), so its streak is short and steeper
      const L = phone ? 90 : Math.min(440, Math.max(300, W * 0.2))
      const D = L * (phone ? 1.2 : 1.25)
      const px0 = pr.left - o.left + f.ox, py0 = pr.top - o.top + f.oy
      const clear = (x: number, y: number) => {
        if (x < 8 || x > W - 8 || y < top || inBox(x, y, words)) return false
        const r = roof((x - px0) / f.s)
        return !r || y < py0 + r * f.s - 30
      }
      // over the house the open sky is only the band under the menu (measured 24/10: the roofline is 146-350 px down at
      // 1856 wide), so shallow runs are allowed, either way across
      for (let i = 0; i < 160; i++) {
        const a = (phone ? 15 + Math.random() * 25 : 5 + Math.random() * 19) * Math.PI / 180, ux = Math.cos(a) * (Math.random() < 0.7 ? 1 : -1), uy = Math.sin(a)
        const x = W * (0.06 + Math.random() * 0.88)
        const y = top + Math.random() * Math.max(40, pr.top - o.top + pr.height * 0.45 - top)
        let ok = true
        // the head runs D from the start and the tail only trails it, so the run (and a little before it) must be clear
        for (let k = 0; k <= 16 && ok; k++) { const d = -L * 0.2 + (D + L * 0.2) * (k / 16); ok = clear(x + ux * d, y + uy * d) }
        if (ok) return { x, y, ux, uy, L, D }
      }
      return null
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

/**
 * Phones only: the plain night above the picture, where the headline sits. Stars scattered evenly through the open
 * space (beside the headline, between the lines, down to where the picture fades in), never behind a word or button,
 * on the same clock and in the same style as the picture's stars. Screen coordinates, so it is simply the stage's box.
 */
export function HeroNight() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const stage = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !stage || !ctx) return
    if (new URLSearchParams(window.location.search).get('fx') === 'none') return
    const phone = window.matchMedia('(max-width: 759px)')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let stars: Star[] = [], raf = 0, t0 = 0, visible = true, laidW = -1
    let shot: (ShotPath & { t: number }) | null = null

    function layout() {
      const w = stage!.clientWidth, h = stage!.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(w * dpr); canvas!.height = Math.round(h * dpr)
      laidW = w
      stars = []
      // phones since 23/10; desktop too since 24/10, when the picture stopped filling the stage's full height
      const o = stage!.getBoundingClientRect()
      const boxes = textBoxes(stage!, o, phone.matches ? 10 : 28)
      const pic = stage!.querySelector('.pl--mid')?.getBoundingClientRect()
      const head = document.querySelector('header')?.getBoundingClientRect()
      // from under the logo and menu to a third of the way into the picture, where its top edge has faded in
      const top = Math.max(0, (head ? head.bottom - o.top : 0) + 8)
      // down to just inside the picture's faded top edge, never as far as its roofs (Abdul 24/10)
      const bottom = pic ? pic.top - o.top + pic.height * 0.1 : h * 0.55
      const rand = seeded(11)
      // a wide screen has five times a phone's open sky: phone density read as noise there, 15000 too bare (Abdul 24/10: "not
      // enough proper stars"), 8500 between
      const count = Math.round((w * (bottom - top)) / (phone.matches ? 4200 : 8500))
      const gap = Math.sqrt((w * (bottom - top)) / Math.max(1, count)) * 0.62
      for (let tries = 0; stars.length < count && tries < count * 40; tries++) {
        const x = 6 + rand() * (w - 12), y = top + rand() * (bottom - top)
        if (inBox(x, y, boxes)) continue
        if (stars.some(s => (s.x - x) ** 2 + (s.y - y) ** 2 < gap * gap)) continue
        // thinner towards the picture, so the two layers meet without a seam
        if (pic && y > pic.top - o.top && rand() > 0.45) continue
        stars.push({ x, y, ...starLook(rand) })
      }
    }

    function draw(now: number) {
      if (stage!.clientWidth !== laidW) layout()
      const dpr = canvas!.width / Math.max(1, stage!.clientWidth)
      const t = still ? 1e9 : now - t0
      ctx!.setTransform(1, 0, 0, 1, 0, 0)
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      // the picture rises with the scroll (parallax) while this layer stays put, so a star the picture's roofs move up
      // to fades out over 40 px instead of sitting on a building
      const o = stage!.getBoundingClientRect(), pic = stage!.querySelector('.pl--mid')?.getBoundingClientRect()
      const limit = pic ? pic.top - o.top + pic.height * 0.1 : Infinity
      for (const st of stars) {
        const fade = Math.min(1, Math.max(0, (t - st.delay) / 800)) * Math.min(1, Math.max(0, (limit - st.y) / 40))
        if (fade) drawStar(ctx!, st, fade * twinkle(st, t, still), 1)
      }
      ctx!.globalAlpha = 1
      if (shot) {
        const p = (now - shot.t) / SHOT_MS
        if (p >= 1) shot = null
        else drawShot(ctx!, shot, Math.max(0, p))
      }
    }

    function loop(now: number) {
      if (!t0) t0 = now
      draw(now)
      if (visible && !document.hidden && (stars.length || shot)) raf = requestAnimationFrame(loop)
    }
    const kick = () => { cancelAnimationFrame(raf); laidW = -1; if (still) draw(0); else raf = requestAnimationFrame(loop) }

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !still) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop) } })
    io.observe(stage)
    // HeroSky picks the moment and the path (it knows the roofline); this layer draws it, unmasked
    const onShoot = (ev: Event) => {
      if (still || !visible) return
      shot = { ...(ev as CustomEvent<ShotPath>).detail, t: performance.now() }
      cancelAnimationFrame(raf); raf = requestAnimationFrame(loop)
    }
    stage.addEventListener('hero:shoot', onShoot)
    const onVis = () => { if (!document.hidden && visible && !still) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop) } }
    document.addEventListener('visibilitychange', onVis)
    phone.addEventListener('change', kick)
    window.addEventListener('resize', kick)
    // the webfonts change where the words break, so lay out again once they are in
    document.fonts?.ready.then(kick)
    kick()

    return () => {
      cancelAnimationFrame(raf); io.disconnect()
      stage.removeEventListener('hero:shoot', onShoot)
      document.removeEventListener('visibilitychange', onVis); phone.removeEventListener('change', kick); window.removeEventListener('resize', kick)
    }
  }, [])

  return <canvas ref={ref} className="hero__night" aria-hidden="true" />
}
