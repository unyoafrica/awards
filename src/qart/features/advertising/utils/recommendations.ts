import type { Campaign } from '../types'
import { platformLabels } from '../services/platforms'
import { totalAmount, dailyAmount } from './estimates'
import { formatNaira } from './format'
import { goals } from './copy'

export type RecommendationAction = 'increase_budget' | 'extend' | 'keep' | 'insights' | 'shift_platform'

export interface Recommendation {
  id: string
  campaignId: string
  tone: 'good' | 'warn' | 'info'
  title: string
  body: string
  primary: { label: string; action: RecommendationAction; amount?: number }
  secondary?: { label: string; action: RecommendationAction }
}

const costPer = (spend: number, results: number) => (results > 0 ? spend / results : Infinity)

/** Plain-language suggestions derived from a running campaign's numbers. */
export function recommend(c: Campaign): Recommendation[] {
  if (c.status !== 'running' || c.daily.length < 3) return []
  const out: Recommendation[] = []
  const budget = totalAmount(c.budget)
  const spentShare = c.spend / budget
  const result = goals[c.objective].resultOne

  if (spentShare >= 0.8) {
    out.push({
      id: `${c.id}-budget-used`,
      campaignId: c.id,
      tone: 'warn',
      title: `${c.name} has used ${Math.round(spentShare * 100)}% of its budget`,
      body: `It will stop when the remaining ${formatNaira(Math.max(0, budget - c.spend))} is spent. Would you like to keep it going?`,
      primary: { label: 'Add 3 more days', action: 'extend' },
      secondary: { label: 'Let it finish', action: 'keep' },
    })
  }

  const ranked = [...c.byPlatform].filter((p) => p.results > 0).sort((a, b) => costPer(a.spend, a.results) - costPer(b.spend, b.results))
  if (ranked.length >= 2) {
    const best = ranked[0]
    const worst = ranked[ranked.length - 1]
    const saving = 1 - costPer(best.spend, best.results) / costPer(worst.spend, worst.results)
    if (saving >= 0.15) {
      out.push({
        id: `${c.id}-platform`,
        campaignId: c.id,
        tone: 'info',
        title: `${platformLabels[best.platform]} is getting you customers for less`,
        body: `Each ${result} from ${platformLabels[best.platform]} costs ${Math.round(saving * 100)}% less than from ${platformLabels[worst.platform]}.`,
        primary: { label: 'View insights', action: 'insights' },
      })
    }
  }

  const roas = c.spend > 0 ? c.revenue / c.spend : 0
  if (roas >= 3 && spentShare < 0.8) {
    const bump = dailyAmount(c.budget) >= 10000 ? 10000 : 5000
    out.push({
      id: `${c.id}-scale`,
      campaignId: c.id,
      tone: 'good',
      title: 'Your ad is performing well',
      body: `Every ₦1 spent has brought back about ₦${roas.toFixed(1)} in sales. Consider increasing your budget by ${formatNaira(bump)}/day.`,
      primary: { label: `Increase by ${formatNaira(bump)}/day`, action: 'increase_budget', amount: bump },
      secondary: { label: 'Keep as is', action: 'keep' },
    })
  }
  return out
}
