# Exact floor area beside the preset sizes

26 September 2026. Owner request: keep the floor-area sizes as presets, but let a customer type
the number when they know it. "121 m²+" alone told Abdul nothing about how large a big home is,
and that band is the one where the quote varies most.

## Behaviour

- The six size tiles and "Not sure of floor area" are unchanged and still required.
- Below them: "Know the exact floor area?" with an m² box. Optional.
- Typing a usable figure (10 to 2,000 m², "74.3" and "85 m2" accepted) selects the matching tile,
  so the guide estimate follows it. "Up to 37 m²" means 37 or less: 37.5 falls in 38–52.
- Choosing a tile the figure does not fit, or "Not sure", clears the figure. The two can never
  disagree, and the server refuses a request where they do.
- Over 300 m², a hint asks whether the figure is in square feet (agent floor plans often lead
  with sq ft).
- An unusable entry blocks Continue with a plain message. Portfolio enquiries ignore the box.
- The figure is not put in the URL. Only controlled selections go there.

## Where the figure appears

In-form estimate line, success summary, desktop quote summary, WhatsApp/email fallback text,
customer confirmation ("Floor area: 134 m²") and the internal notification:
`Internal floor area: 134 m² (customer's figure) · 121 m²+ band`. The row label is unchanged
for `/quote-reply`. The notification subject becomes `EPC booking: Name — 134 m² (postcode)`;
`booking-followup.py` only matches the prefix. The confirmation subject is untouched.

Pricing still comes from the band. The typed figure never changes the arithmetic.

## Verification

Evidence: `audits/website-growth-audit/ld-energy-exact-floor-area-2026-09-26/` in the parent repo.

- Typecheck, lint (existing OG-image warning only), Next production build.
- `node --require ./tests/register.cjs --test tests/*.test.cjs`: 15/15, including parsing, band
  edges from the pricing table, schema mismatch, bulk, both emails and the subject.
- `tests/exact-floor-area.cjs` at 390 and 1440px: typing selects and prices the band, tile
  changes clear or keep the figure, sq ft hint, invalid entry blocks Continue, submission carries
  `floorArea` with its band, success summary shows the figure.
- Existing suites pass: `browser-booking`, `booking-specialists`, `booking-navigation`,
  `review-fixes`, `review-layout`.

Rollback: revert this commit.
