/**
 * Public surface of the advertising module. The app shell only imports from
 * here; everything else stays inside the feature.
 */
export { AdsRouter } from './screens/AdsRouter'
export { startNewAd } from './hooks/useDraft'
export { useAdsState } from './hooks/useAds'
export { adsStore } from './services/store'

/** Screens that take over the whole display (no tab bar). */
export function isFullScreenAdsRoute(path: string) {
  return path.startsWith('/ads/create') || path.startsWith('/ads/campaigns/')
}
