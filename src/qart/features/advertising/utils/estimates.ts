import type { Audience, Budget, ChannelId, Estimate, GoalId } from '../types'
import { goals } from './copy'

/**
 * Rough Nigerian benchmarks for a mixed small-business audience. Real estimates
 * come from each platform's reach API; these keep the setup flow honest offline.
 */
const cpmByChannel: Record<ChannelId, number> = { instagram: 1150, facebook: 900, tiktok: 780, snapchat: 850 }

const costPerResult: Record<GoalId, [number, number]> = {
  customers: [120, 260],
  product: [130, 280],
  messages: [55, 140],
  visits: [22, 60],
  awareness: [30, 80],
}

export function dailyAmount(b: Budget): number {
  return b.type === 'daily' ? b.amount : b.amount / Math.max(1, b.durationDays)
}

export function totalAmount(b: Budget): number {
  return b.type === 'daily' ? b.amount * b.durationDays : b.amount
}

const round = (n: number) => {
  if (n < 100) return Math.max(0, Math.round(n))
  const mag = 10 ** (Math.floor(Math.log10(n)) - 1)
  return Math.round(n / mag) * mag
}

export function estimate(goal: GoalId, channels: ChannelId[], audience: Audience, budget: Budget): Estimate {
  const daily = dailyAmount(budget)
  const picked: ChannelId[] = channels.length ? channels : ['instagram']
  const cpm = picked.reduce((t, c) => t + cpmByChannel[c], 0) / picked.length
  // Narrow manual audiences cost more to reach; Qart's automatic audience is a little cheaper.
  const narrowing =
    audience.mode === 'auto'
      ? 0.95
      : 1 + (5 - Math.max(1, audience.ages.length)) * 0.06 + (audience.gender === 'all' ? 0 : 0.08)
  const impressions = (daily / (cpm * narrowing)) * 1000
  const reachLo = impressions * 0.45
  const reachHi = impressions * 1.15
  const days = budget.durationDays
  const [cLo, cHi] = costPerResult[goal]
  const total = totalAmount(budget)
  return {
    dailyReach: [round(reachLo), round(reachHi)],
    totalReach: [round(reachLo * days * 0.8), round(reachHi * days * 0.85)],
    results: [round(total / (cHi * narrowing)), round(total / (cLo * narrowing))],
    resultLabel: goals[goal].resultLabel.toLowerCase(),
  }
}

/** Qart's service fee and VAT on that fee. Spelled out on the payment screen, never hidden. */
export function fees(budgetTotal: number) {
  const service = Math.round(budgetTotal * 0.03)
  const vat = Math.round(service * 0.075)
  return { service, vat, total: budgetTotal + service + vat }
}
