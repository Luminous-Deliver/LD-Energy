# Stage 5: accessibility and measured resource use

Parent: entity/schema `cbdb603`.

## Changes and acceptance

- Removed the header's clipping boundary after a real hit-test showed the desktop Services dropdown was invisible below the floating pill. The dropdown now accepts pointer and keyboard interaction. Focus within the header keeps it visible while scrolling.
- The mobile menu scrolls as one panel, with its close control retained at the top. Resizing to desktop releases its modal state. Larger text and wrapped support actions remain usable. WhatsApp uses the same legible secondary treatment as Call, preserving the form's emphasis.
- Emergency text wrapping allows long words and grid/flex minimum widths to reflow. The first heading-only adjustment was insufficient: paragraph/card/list min-content widths still overflowed at 320px and 200% text. Applying inherited emergency wrapping to main content resolved that measured failure without hiding overflow or shrinking type.
- Removed Plus Jakarta Sans, used only by the mobile menu identity, and the unused Fraunces SOFT axis. Inter and optical-size Fraunces remain. Observed mobile font transfer: 197,328 → 116,420 bytes including response overhead (about 193 → 114KiB); two font files instead of three.
- Reused the existing 16,720-byte SVG logo asset in place of the 30,962-byte WebP; the SVG contains the existing raster logo, not a newly drawn design. Only the header logo is prioritised. This is a smaller existing source, not a claim that a new responsive image pipeline was built.
- Disabled demonstrated speculative prefetches on navigation and shared action links. Initial homepage RSC prefetches fell from 5–12 to zero in the captured runs. Contact and Domestic EPC retain one supporting prefetch. Links and client navigation still work.
- The previously added reduced-motion rule already disables smooth scrolling and almost all transition duration. Verified it rather than adding another motion system. No framework, dependency, consent, form or pricing change.

## Evidence

Parent roadmap audit `stage5-before/` and `stage5/` contain screenshots, network/200%-text observations and keyboard results.

- Typecheck/lint/Next production build passed, 79 generated pages.
- Home, Contact and Domestic EPC: 320/390/768/1440 normal and 200% text, no horizontal document overflow in the final pass. Actual screenshots reviewed. Desktop dropdown hit-test changed false → true.
- Keyboard: skip link, modal focus cycle, Escape return, desktop dropdown, resize dismissal, and form selections/Back/step focus at 320/360/375/390/412/430/768/1440 passed. Generic customer type stays empty. No enquiry submitted.
- A test attempted a role-based lookup of a deliberately hidden mobile trigger after resizing to desktop. Corrected the harness to inspect its DOM state; this was not an application failure.

| Local Lighthouse Performance | Before desktop/mobile | After desktop/mobile |
|---|---|---|
| Home | 95 / 98 | 92 / 99 |
| Contact | 85 / 99 | 95 / 96 |
| Domestic EPC | 95 / 98 | 94 / 96 |

Accessibility, Best Practices and SEO stayed 100 in these six after-runs. Performance scores fluctuate and some are lower; no universal speed improvement is claimed. The independently measured font-byte and prefetch reductions are the acceptance evidence for those changes. Original Stage 1b homepage scores were 66 desktop / 78 mobile, before the Stage 3 compression. Field INP/Core Web Vitals and a full screen-reader conformance audit remain unverified; Lighthouse 100 is not WCAG conformance.

Review focus: dropdown clipping/focus, modal resize/scroll, enlarged-text reflow, no lost link intent, visual font/logo fidelity. Revert this stage as a separate rollback boundary. Production deployment and verification are recorded in the roadmap register.
