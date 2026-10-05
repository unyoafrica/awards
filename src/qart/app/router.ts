import { useSyncExternalStore } from 'react'

/**
 * Hash routing keeps the prototype deployable as static files while giving
 * every screen a URL and making the phone's back gesture work.
 */
const read = () => window.location.hash.replace(/^#/, '') || '/'

function subscribe(fn: () => void) {
  window.addEventListener('hashchange', fn)
  return () => window.removeEventListener('hashchange', fn)
}

export function useRoute(): string {
  return useSyncExternalStore(subscribe, read, () => '/')
}

/** How many in-app screens sit behind the current one, so back() never leaves the app. */
let depth = 0
let pushing = false

window.addEventListener('hashchange', () => {
  if (pushing) {
    depth++
    pushing = false
  } else {
    depth = Math.max(0, depth - 1)
  }
})

export function navigate(path: string, opts: { replace?: boolean } = {}) {
  if (opts.replace) {
    window.history.replaceState(null, '', `#${path}`)
    // Not a history move, so don't let the listener count it as one.
    pushing = true
    depth--
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else if (read() !== path) {
    pushing = true
    window.location.hash = path
  }
}

/** Go back within the app, or to a fallback when the screen was opened directly. */
export function back(fallback: string) {
  if (depth > 0) window.history.back()
  else navigate(fallback, { replace: true })
}

/** Matches "/ads/campaigns/:id" style patterns. */
export function match(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/')
  const a = path.split('?')[0].split('/')
  if (p.length !== a.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(a[i])
    else if (p[i] !== a[i]) return null
  }
  return params
}
