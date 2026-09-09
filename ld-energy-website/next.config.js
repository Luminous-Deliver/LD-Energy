/** @type {import('next').NextConfig} */
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
      {
        // Renamed 2026-09-09 when the £15 retrofit consultation became the £35
        // EPC Improvement Plan. Keep indefinitely — external links and search
        // results still point at the old path.
        source: '/services/retrofit-consultation',
        destination: '/services/epc-improvement-plan',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
