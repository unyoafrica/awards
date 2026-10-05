/** Dates are handled as local YYYY-MM-DD strings so day boundaries match the merchant's clock. */

export function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const today = () => isoDate(new Date())

export function addDays(s: string, n: number): string {
  const d = parseDate(s)
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86_400_000)
}

const short = new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' })

export const formatDay = (s: string) => short.format(parseDate(s))

export function formatRange(start: string, end: string): string {
  return `${formatDay(start)} – ${formatDay(end)}`
}
