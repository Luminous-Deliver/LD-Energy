/**
 * Which blocks of an inner page reveal on scroll (motion proposal 24/10/2026, Considered, §2.1), as selectors for
 * <RevealOnScroll>. The rules shared by every inner page live here once; a page adds only what is its own.
 *
 * Marked everywhere: each section's eyebrow, H2 and lede, prose paragraphs, the FAQ block and its side note, then Our
 * promise, Read next and the ending. Never marked: the hero, the price matrix and every price list or table, the
 * borough explorer and sortable table, the FAQ items' content (the block fades in as one; opening and closing is the
 * FAQ's own motion). Pages therefore leave their price sections out of `blocks` and `lists`.
 */
export function innerReveals(
  root: string,
  { blocks = [], lists = [], ending = 'a' }: { blocks?: string[]; lists?: string[]; ending?: 'a' | 'b' } = {},
) {
  const r = (sel: string) => `${root} ${sel}`
  return {
    blocks: [
      r('.in-sec h2.in-h2'),
      r('.in-sec .in-eyebrow:not(figcaption)'),
      r('.in-sec .in-lede'),
      r('.in-sec .in-prose > :not(.in-eyebrow):not(.in-h2):not(.in-lede)'),
      r('.in-sec .in-faq'),
      r('.in-sec [class*="faqside"]'),
      r('.op__in'),
      r('.in-rn h2'),
      r(`.in-end-${ending}__in`),
      ...blocks.map(r),
    ],
    lists: [r('.in-ncards'), ...lists.map(r)],
  }
}
