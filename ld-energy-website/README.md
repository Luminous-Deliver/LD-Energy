# L&D Energy

Production website for L&D Energy — Elmhurst-accredited Domestic EPC assessor covering London.

- **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS
- **Deployment:** Cloudflare Pages via `@cloudflare/next-on-pages`
- **Production URL:** https://epc.luminousanddeliver.co.uk

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run build        # full Next.js production build
```

## Cloudflare Pages

```bash
npm run pages:build  # builds .vercel/output for the Pages adapter
npm run preview      # local edge preview with wrangler
npm run deploy       # deploy to Cloudflare Pages
```

The site runs on the Cloudflare edge. All API routes export `runtime = 'edge'`, and `/opengraph-image` is generated at the edge via `next/og`.

## Environment variables

Set these in the Cloudflare Pages dashboard (Settings → Environment variables) and locally in `.env.local` if needed:

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend REST API key for transactional email |
| `RESEND_FROM` | `"L&D Energy <bookings@epc.luminousanddeliver.co.uk>"` |
| `RESEND_TO` | Email address that receives contact-form submissions |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public Turnstile widget key, embedded at build time |
| `TURNSTILE_SECRET_KEY` | Secret used by `/api/contact` to validate Turnstile tokens |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Optional. Cloudflare Web Analytics site token. If unset, the beacon is omitted. |

## Project structure

```
app/
  layout.tsx               # Root layout, sitewide LocalBusiness JSON-LD
  page.tsx                 # Homepage (Organization + WebSite + FAQPage schemas)
  opengraph-image.tsx      # Edge-rendered OG image (1200×630)
  sitemap.ts               # Dynamic sitemap.xml (12 static + 34 borough routes)
  services/                # Domestic EPC + Floor plans
  landlords/               # Audience page
  sellers/                 # Audience page
  areas/                   # /areas hub + /areas/[borough] (34 SSG pages)
  pricing/ faq/ about/ contact/ privacy-policy/ terms/
  api/contact/route.ts     # Edge runtime, Resend transactional send
components/
  layout/                  # Header, Footer, MobileCallBar
  sections/                # Page sections (Hero, Pricing, Faq, etc.)
  forms/                   # ContactForm (RHF + Zod)
  ui/                      # Button, Accordion, BreadcrumbNav, etc.
lib/
  site.ts                  # NAP, nav, pricing, borough slugs
  boroughs.ts              # Per-borough copy + neighbours
  faq.ts                   # Homepage and full-FAQ data
  validators.ts            # Zod schemas (contact form)
public/
  robots.txt               # AI-crawler allowlists
  favicon.svg
```

`app/llms.txt/route.ts` generates `/llms.txt` at request time from `lib/site.ts`, rather than
shipping a static file that can drift out of sync.

## SEO / schema

- LocalBusiness JSON-LD on every page (root layout)
- Organization + WebSite + FAQPage on the homepage (no `SearchAction`: the Sitelinks Search Box
  it targeted was retired in 2024)
- Service schema on `/services/*`
- BreadcrumbList on every inner page
- LocalBusiness with `areaServed` + FAQPage on every `/areas/[borough]` page
- `public/robots.txt` allows GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended, Bingbot, CCBot
- `/llms.txt` for LLM crawlers (generated, see Project structure above)

## Build phases

- [x] Phase 1 — Foundation (config, tokens, layout, core UI)
- [x] Phase 2 — Homepage
- [x] Phase 3 — Service pages
- [x] Phase 4 — Audience pages (Landlords, Sellers)
- [x] Phase 5 — Borough pages
- [x] Phase 6 — Supporting pages (about, contact, faq, privacy, terms)
- [x] Phase 7 — SEO & schema (sitemap, robots, llms, JSON-LD)
- [x] Phase 8 — Polish & deploy
