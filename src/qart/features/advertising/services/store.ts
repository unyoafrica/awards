import type { Campaign } from '../types'
import { seedCampaigns } from '../data/seed'

/**
 * Client-side state for the advertising module. Stands in for the backend until
 * the Qart Ads API exists; adsService is the only writer.
 */
export interface AdsState {
  campaigns: Campaign[]
  /** Qart wallet balance available for ads, in naira. */
  balance: number
  dismissed: string[]
}

const KEY = 'qart.ads.v1'

const initial = (): AdsState => ({ campaigns: seedCampaigns(), balance: 185_000, dismissed: [] })

function load(): AdsState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as AdsState
  } catch {
    // Storage blocked or corrupt: fall back to demo data.
  }
  return initial()
}

let state: AdsState = load()
const listeners = new Set<() => void>()

export const adsStore = {
  get: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  set(next: AdsState | ((s: AdsState) => AdsState)) {
    state = typeof next === 'function' ? next(state) : next
    try {
      // Uploaded images are stored as downscaled data URLs; uploaded videos stay blob: URLs and only last the session.
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // Quota or privacy mode: keep working in memory.
    }
    listeners.forEach((l) => l())
  },
  reset(empty = false) {
    adsStore.set(empty ? { ...initial(), campaigns: [] } : initial())
  },
}
