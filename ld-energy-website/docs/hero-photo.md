# Homepage hero photo

Replaced the house/leaf pattern behind the homepage hero (24/09/2026) with a real London
residential street, so a first-time visitor sees the kind of home an EPC assessor visits.

## Source and licence

- **Photo:** "Victorian terrace, Leytonstone, London" by Martin Sepion, Unsplash
  `NP9VBSCzEuU` (image id `photo-1566515610329-94f02c3707d6`), published 22/08/2019.
  https://unsplash.com/photos/vehicles-on-road-NP9VBSCzEuU
- **Licence:** Unsplash License, free for commercial use, no attribution required. Checked on
  the photo page before use; it is not an Unsplash+ image.
- **Why this one:** a typical owner-occupier/landlord terrace about a mile from the Stratford
  E15 base, shot at golden hour. No people, no customer property, no solar, no thermal imaging,
  nothing the business does not do. A Georgian central-London terrace (Unsplash `G2l9ZfBU5dQ`)
  was the runner-up; its textured sky encoded about 3× larger.

## Edits

1. Overhead telephone wires removed from the sky (row-wise blend of the clean sky either side;
   only a few pixels remain at the gable apex).
2. Mirrored horizontally, so the nearest house sits on the right beside the assessor card and
   the sky sits behind the headline.
3. Cropped to source rows 0–1880, above the parked cars, so no number plate or bin is in
   frame. Wide crop: mirrored x 0–3600 (drops the tree over the nearest house). Portrait crop:
   mirrored x 2250–3950.
4. Graded: saturation 0.55, gamma 1.12, 45% split-tone from `#0D1B33` shadows to cool-white
   highlights, exposure 0.82. Positional darkening (text column, nav, bottom seam) is CSS in
   `HomeHero.tsx`, so it tracks the real layout.

## Files

`public/hero/terrace-{1280,1440,1920,2560}` (wide, 768px and up) and
`public/hero/terrace-portrait-{640,828,960}` (phones), each as AVIF (q34, sharp effort 7) and
WebP (q62). AVIF sizes: 20/23/34/48 KB wide, 11/16/19 KB portrait. At q34 the grade and scrims
hide any difference from q48 at 100% zoom.

## The glazing marks

From 1536px an SVG draws dimension marks on the nearest bay window in the margin beside the
assessor card. The path coordinates are pixels in the 3600×1880 wide crop; the SVG's
`viewBox` and `preserveAspectRatio="xMaxYMin slice"` match the image's
`object-cover object-right-top` box. **If the wide crop changes, re-measure those
coordinates.** Hidden above 2200px, where the label would fall below the hero.

## Verification (local production build, 24/09/2026)

- Typecheck, lint (only the existing `opengraph-image.tsx` warning), `next build` (79 pages)
  and the 13 unit tests pass.
- Lighthouse performance, median of 3 runs, before → after: desktop 74 → 73 (LCP 3.08s →
  3.24s), mobile 93 → 92–93 (LCP 3.09s → 3.09s). CLS unchanged (0.004 / 0.001). The photo is
  now the LCP element. Page weight +26 KB desktop, +19 KB mobile. Accessibility, best
  practices and SEO stay at 100 on both viewports.
- Worst-case WCAG contrast of every hero text element against the actual pixels behind it
  (95th-percentile background): 6.87:1 or better at 390, 768, 1024, 1280, 1440, 1536 and
  1920px.
- Page height unchanged (5,688px desktop, 8,005px mobile): the trust strip now overlaps the
  hero by 2.75rem and the hero's padding grows by the same amount.
