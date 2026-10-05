import type { Campaign, CampaignDraft, PaymentMethodId, PlatformId } from '../types'
import { adsStore } from './store'
import { platformAdapters, platformLabels, platformsFor } from './platforms'
import { addDays, today } from '../utils/dates'
import { fees, totalAmount } from '../utils/estimates'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface LaunchStep {
  id: string
  label: string
}

export interface LaunchError {
  title: string
  detail: string
  platform?: PlatformId
  /** True when nothing was charged, which is always the case for a failed launch. */
  notCharged: boolean
}

export type LaunchResult = { ok: true; campaign: Campaign } | { ok: false; error: LaunchError }

export function launchSteps(draft: CampaignDraft): LaunchStep[] {
  return [
    { id: 'prepare', label: 'Preparing your ad' },
    { id: 'check', label: 'Checking your creative' },
    ...platformsFor(draft.channels).map((p) => ({ id: `connect-${p}`, label: `Connecting to ${platformLabels[p]}` })),
    { id: 'publish', label: 'Publishing your campaign' },
  ]
}

function newId() {
  return `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

const reviewTimers = new Map<string, ReturnType<typeof setTimeout>>()

/** Mock review: platforms approve a fresh campaign a few seconds after submission. */
function scheduleApproval(id: string, afterMs = 9000) {
  clearTimeout(reviewTimers.get(id))
  reviewTimers.set(
    id,
    setTimeout(() => {
      updateCampaign(id, (c) => (c.status === 'in_review' ? { ...c, status: 'running' } : c))
    }, afterMs),
  )
}

function updateCampaign(id: string, fn: (c: Campaign) => Campaign) {
  adsStore.set((s) => ({
    ...s,
    campaigns: s.campaigns.map((c) => (c.id === id ? { ...fn(c), updatedAt: new Date().toISOString() } : c)),
  }))
}

/** What a draft still owes: the full total for a new ad, or only the top-up when fixing an existing one. */
export function amountDue(draft: CampaignDraft, existingId?: string): number {
  const { total } = fees(totalAmount(draft.budget))
  const paid = existingId ? (adsStore.get().campaigns.find((c) => c.id === existingId)?.paid ?? 0) : 0
  return Math.max(0, total - paid)
}

export const adsService = {
  async listCampaigns(): Promise<Campaign[]> {
    await wait(450)
    return adsStore.get().campaigns
  },

  /**
   * Runs the publish pipeline step by step so the UI can show real progress.
   * The merchant is charged only after every platform accepts the campaign.
   */
  async launch(
    draft: CampaignDraft,
    method: PaymentMethodId,
    onStep: (stepId: string) => void,
    existingId?: string,
  ): Promise<LaunchResult> {
    onStep('prepare')
    await wait(900)

    onStep('check')
    await wait(800)
    for (const p of platformsFor(draft.channels)) {
      const check = platformAdapters[p].checkCreative(draft)
      if (!check.ok) {
        return {
          ok: false,
          error: {
            title: `Your ad needs a small change for ${platformLabels[p]}`,
            detail: `${check.message} Your money hasn’t been charged.`,
            platform: p,
            notCharged: true,
          },
        }
      }
    }

    for (const p of platformsFor(draft.channels)) {
      onStep(`connect-${p}`)
      const res = await platformAdapters[p].publish(draft)
      if (!res.ok) {
        // rawError goes to support logs; the merchant gets a plain explanation.
        console.warn('[ads] publish failed', p, res.rawError)
        return {
          ok: false,
          error: {
            title: `We couldn’t publish your ad to ${p === 'meta' ? 'Instagram and Facebook' : platformLabels[p]}`,
            detail: `There was a problem connecting to ${platformLabels[p]}. Your money hasn’t been charged.`,
            platform: p,
            notCharged: true,
          },
        }
      }
    }

    onStep('publish')
    await wait(700)

    const budgetTotal = totalAmount(draft.budget)
    const { total } = fees(budgetTotal)
    // Resubmitting a fixed ad only charges for budget the merchant hasn't already paid.
    const alreadyPaid = existingId ? (adsStore.get().campaigns.find((c) => c.id === existingId)?.paid ?? 0) : 0
    const due = Math.max(0, total - alreadyPaid)
    const start = today()
    const now = new Date().toISOString()
    const campaign: Campaign = {
      id: existingId ?? newId(),
      name: draft.name.trim() || draft.promoted?.name || 'My ad',
      objective: draft.objective ?? 'customers',
      status: 'in_review',
      channels: draft.channels,
      promoted: draft.promoted ?? { kind: 'storefront', name: 'My Qart store' },
      creative: draft.creative,
      audience: draft.audience,
      budget: draft.budget,
      startDate: start,
      endDate: addDays(start, draft.budget.durationDays - 1),
      paid: Math.max(total, alreadyPaid),
      spend: 0,
      reach: 0,
      impressions: 0,
      clicks: 0,
      results: 0,
      revenue: 0,
      daily: [],
      byPlatform: [],
      createdAt: now,
      updatedAt: now,
    }

    adsStore.set((s) => ({
      ...s,
      balance: method === 'balance' ? s.balance - due : s.balance,
      campaigns: existingId
        ? s.campaigns.map((c) => (c.id === existingId ? { ...campaign, createdAt: c.createdAt } : c))
        : [campaign, ...s.campaigns],
    }))
    scheduleApproval(campaign.id)
    return { ok: true, campaign }
  },

  pause(id: string) {
    updateCampaign(id, (c) => ({ ...c, status: 'paused' }))
  },

  resume(id: string) {
    updateCampaign(id, (c) => ({ ...c, status: 'running' }))
  },

  /** Retry a campaign that failed for technical reasons. Nothing was charged, so it goes back to review. */
  async retry(id: string) {
    updateCampaign(id, (c) => ({ ...c, status: 'processing', issue: undefined }))
    await wait(1600)
    updateCampaign(id, (c) => ({ ...c, status: 'in_review' }))
    scheduleApproval(id)
  },

  /** Raise the daily budget (or the total, scaled per day) and charge the difference. */
  increaseBudget(id: string, perDay: number, method: PaymentMethodId) {
    const c = adsStore.get().campaigns.find((x) => x.id === id)
    if (!c) return 0
    const remainingDays = Math.max(1, c.budget.durationDays - c.daily.length)
    const extra = perDay * remainingDays
    const charge = fees(extra).total
    adsStore.set((s) => ({
      ...s,
      balance: method === 'balance' ? s.balance - charge : s.balance,
      campaigns: s.campaigns.map((x) =>
        x.id === id
          ? {
              ...x,
              budget:
                x.budget.type === 'daily'
                  ? { ...x.budget, amount: x.budget.amount + perDay }
                  : { ...x.budget, amount: x.budget.amount + extra },
              paid: x.paid + charge,
              updatedAt: new Date().toISOString(),
            }
          : x,
      ),
    }))
    return charge
  },

  /** Add days at the current daily rate and charge for them. */
  extend(id: string, days: number, method: PaymentMethodId) {
    const c = adsStore.get().campaigns.find((x) => x.id === id)
    if (!c) return 0
    const perDay = c.budget.type === 'daily' ? c.budget.amount : c.budget.amount / c.budget.durationDays
    const extra = Math.round(perDay * days)
    const charge = fees(extra).total
    adsStore.set((s) => ({
      ...s,
      balance: method === 'balance' ? s.balance - charge : s.balance,
      campaigns: s.campaigns.map((x) =>
        x.id === id
          ? {
              ...x,
              budget: {
                ...x.budget,
                durationDays: x.budget.durationDays + days,
                amount: x.budget.type === 'total' ? x.budget.amount + extra : x.budget.amount,
              },
              endDate: addDays(x.endDate, days),
              status: x.status === 'completed' ? 'running' : x.status,
              paid: x.paid + charge,
              updatedAt: new Date().toISOString(),
            }
          : x,
      ),
    }))
    return charge
  },

  updateCopy(id: string, headline: string, primaryText: string) {
    updateCampaign(id, (c) => ({
      ...c,
      creative: { ...c.creative, headline, primaryText },
      // A rejected ad goes back to review; a running ad keeps delivering while the platform checks the edit.
      status: c.status === 'rejected' ? 'in_review' : c.status,
      issue: undefined,
    }))
    const c = adsStore.get().campaigns.find((x) => x.id === id)
    if (c?.status === 'in_review') scheduleApproval(id)
  },

  dismissRecommendation(id: string) {
    adsStore.set((s) => ({ ...s, dismissed: [...s.dismissed, id] }))
  },

  /** Re-arm review timers for anything left in review when the page reloaded. */
  resumeReviews() {
    for (const c of adsStore.get().campaigns) {
      if (c.status === 'in_review' && !c.id.startsWith('c-shea')) scheduleApproval(c.id, 6000)
    }
  },
}
