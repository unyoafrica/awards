const naira = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 })

/** ₦45,000 */
export const formatNaira = (n: number) => `₦${naira.format(Math.round(n))}`

/** ₦1.8M, ₦125.4K, ₦950 */
export const formatNairaCompact = (n: number) => (Math.abs(n) < 10_000 ? formatNaira(n) : `₦${compact.format(n)}`)

/** 82.4K, 1,284 */
export const formatCount = (n: number) => (Math.abs(n) < 10_000 ? naira.format(Math.round(n)) : compact.format(n))

export const formatRangeCount = ([lo, hi]: [number, number]) => `${formatCount(lo)} – ${formatCount(hi)}`

export const formatPercent = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`

/** 8x, 2.4x */
export const formatMultiple = (n: number) => `${n >= 10 ? Math.round(n) : Math.round(n * 10) / 10}x`

export const plural = (n: number, one: string, many = `${one}s`) => `${formatCount(n)} ${n === 1 ? one : many}`

/** "Instagram, Facebook + TikTok" */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} + ${items[items.length - 1]}`
}
