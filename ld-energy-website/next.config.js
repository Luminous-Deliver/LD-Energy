/** @type {import('next').NextConfig} */
/**
 * /blog moved to /guides on 04/11/2026 (plan PLAN-AREAS-GUIDES-2026-10-22 §12). Every old URL answers with a
 * single permanent redirect to its final address: merged posts and category pages are listed before the
 * `/blog/:slug` pattern because Next uses the first rule that matches, so none of them chains through it.
 * Keep indefinitely.
 */
const GUIDE_MERGES = {
  'what-happens-during-epc-assessment': 'prepare-for-epc-assessment',
  'mees-regulations-2026': 'epc-for-landlords-2026',
  'mees-timeline-2026-2030': 'epc-c-by-2030',
  'epc-improvements-by-budget': 'cheapest-ways-improve-epc',
}
const CATEGORY_GROUPS = {
  'epc-basics': 'understand-your-epc',
  'for-landlords': 'letting-and-mees',
  regulations: 'letting-and-mees',
  improvements: 'improving-your-rating',
  'for-sellers': 'selling-buying-and-floor-plans',
}
const guideRedirects = [
  ...Object.entries(CATEGORY_GROUPS).map(([cat, group]) => ({
    source: `/blog/category/${cat}`,
    destination: `/guides#${group}`,
    permanent: true,
  })),
  { source: '/blog/category', destination: '/guides', permanent: true },
  ...Object.entries(GUIDE_MERGES).flatMap(([from, to]) => [
    { source: `/blog/${from}`, destination: `/guides/${to}`, permanent: true },
    { source: `/guides/${from}`, destination: `/guides/${to}`, permanent: true },
  ]),
  { source: '/blog', destination: '/guides', permanent: true },
  { source: '/blog/:slug', destination: '/guides/:slug', permanent: true },
]

const nextConfig = {
  reactStrictMode: true,
  images: {
    // The @cloudflare/next-on-pages runtime doesn't support Next's built-in
    // image optimizer (it targets Vercel's infra) — /_next/image silently
    // returns the original file with an incorrect Content-Type on every
    // request, regardless of the requested width. Serving the original
    // files directly is strictly better: correct headers, real edge
    // caching, and no wasted resize/reformat work that was never happening.
    unoptimized: true,
  },
  /**
   * Redirects MUST live here, not in `public/_redirects`.
   *
   * Cloudflare Pages only consults `_redirects` when it is serving static
   * assets itself. `@cloudflare/next-on-pages` compiles the site into a Worker
   * that owns routing, so the file is never read and Next's own 404 matches
   * first. That was verified in production on 2026-09-09: with `_redirects` in
   * place, /services/retrofit-consultation returned `404` with
   * `x-matched-path: /404`, not a redirect.
   *
   * Next's `redirects()` is compiled into the build output that next-on-pages
   * translates, so it survives the Worker. `permanent: true` emits a 308,
   * which search engines treat as a 301 and which preserves the request method.
   */
  async redirects() {
    return [
      ...guideRedirects,
      {
        // Renamed 2026-09-09 when the £15 retrofit consultation became the £35
        // EPC Improvement Plan. Keep indefinitely — external links and search
        // results still point at the old path.
        source: '/services/retrofit-consultation',
        destination: '/services/epc-improvement-plan',
        permanent: true,
      },
      {
        // Old slug of the preparation page; still earning impressions in Search Console on 28/10/2026.
        source: '/preparing-for-epc-assessment',
        destination: '/preparing-for-your-epc',
        permanent: true,
      },
      // 23/10/2026: the quote form moved from /contact to /quote. Old quote links carry their choices in the query
      // (service, area, speed, plan, source, cta), which Next carries over to /quote. Temporary (307), because
      // /contact itself stays. A bare `/contact#booking-form` never reaches the server; LegacyQuoteRedirect on
      // /contact handles that one in the browser.
      ...['service', 'area', 'speed', 'plan', 'source', 'cta'].map((key) => ({
        source: '/contact',
        has: [{ type: 'query', key }],
        destination: '/quote',
        permanent: false,
      })),
    ]
  },
}

module.exports = nextConfig
