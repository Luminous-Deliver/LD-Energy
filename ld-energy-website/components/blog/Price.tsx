import { isGuidePriceKey, priceText } from '@/lib/guide-prices'

/** An L&D price inside guide body text, read from lib/site.ts: `<Price item="epcFrom" />` renders "£65". */
export function Price({ item }: { item: string }) {
  if (!isGuidePriceKey(item)) throw new Error(`Unknown guide price "${item}"`)
  return <span className="whitespace-nowrap">{priceText(item)}</span>
}
