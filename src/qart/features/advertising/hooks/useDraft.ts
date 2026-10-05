import { useSyncExternalStore } from 'react'
import type { CampaignDraft, PaymentMethodId } from '../types'
import { navigate } from '../../../app/router'
import { haptic } from '../../../ui/feedback'

/**
 * The in-progress ad lives outside the screens so merchants can step back and
 * forth, jump in from Review to edit, and leave and return without losing work.
 */
const KEY = 'qart.ads.draft.v1'

export const emptyDraft = (): CampaignDraft => ({
  name: '',
  creative: { media: [], headline: '', primaryText: '', callToAction: 'Shop now' },
  channels: [],
  audience: {
    mode: 'auto',
    country: 'Nigeria',
    state: 'Lagos',
    city: 'Lagos',
    radiusKm: 20,
    ages: ['18-24', '25-34', '35-44'],
    gender: 'all',
    interests: [],
  },
  budget: { type: 'daily', amount: 5000, durationDays: 7 },
})

function load(): CampaignDraft {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) return { ...emptyDraft(), ...(JSON.parse(raw) as CampaignDraft) }
  } catch {
    // Fall through to a fresh draft.
  }
  return emptyDraft()
}

let draft = load()
/** Set when the draft re-submits an existing campaign (e.g. fixing a rejected ad). */
let editingId: string | undefined
const listeners = new Set<() => void>()

export const draftStore = {
  get: () => draft,
  editingId: () => editingId,
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  update(patch: Partial<CampaignDraft> | ((d: CampaignDraft) => CampaignDraft)) {
    draft = typeof patch === 'function' ? patch(draft) : { ...draft, ...patch }
    try {
      sessionStorage.setItem(KEY, JSON.stringify(draft))
    } catch {
      // In-memory only.
    }
    listeners.forEach((l) => l())
  },
  reset(from?: CampaignDraft, id?: string) {
    editingId = id
    // Replace, don't merge: an empty draft has no objective or promoted item to overwrite the old ones.
    const fresh = from ?? emptyDraft()
    draftStore.update(() => fresh)
  },
}

export function useDraft(): [CampaignDraft, typeof draftStore.update] {
  const d = useSyncExternalStore(draftStore.subscribe, draftStore.get, draftStore.get)
  return [d, draftStore.update]
}

/** Payment method picked on the payment screen, read by the launch screen. Nothing is charged until launch succeeds. */
export const checkout: { method: PaymentMethodId } = { method: 'balance' }

export function startNewAd() {
  haptic()
  draftStore.reset()
  navigate('/ads/create/1')
}
