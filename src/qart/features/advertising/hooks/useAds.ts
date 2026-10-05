import { useEffect, useState, useSyncExternalStore } from 'react'
import { adsStore, type AdsState } from '../services/store'
import { adsService } from '../services/adsService'
import type { Campaign } from '../types'

export function useAdsState(): AdsState {
  return useSyncExternalStore(adsStore.subscribe, adsStore.get, adsStore.get)
}

export function useCampaign(id: string): Campaign | undefined {
  return useAdsState().campaigns.find((c) => c.id === id)
}

let loadedOnce = false

/**
 * Campaigns with a first-load state for skeletons. Later visits read the store
 * straight away, the way a cached query would.
 */
export function useCampaigns(): { campaigns: Campaign[]; loading: boolean } {
  const { campaigns } = useAdsState()
  const [loading, setLoading] = useState(!loadedOnce)
  useEffect(() => {
    if (loadedOnce) return
    let live = true
    adsService.listCampaigns().then(() => {
      loadedOnce = true
      if (live) setLoading(false)
    })
    return () => {
      live = false
    }
  }, [])
  return { campaigns, loading }
}
