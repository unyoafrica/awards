/** Light tap feedback on devices that support it. */
export function haptic(ms = 8) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    // Unsupported: silent.
  }
}

/* Toasts: one global queue, rendered by <Toaster/> in the app shell. */

export interface Toast {
  id: number
  text: string
  tone: 'good' | 'info' | 'bad'
}
let toasts: Toast[] = []
const toastListeners = new Set<() => void>()
const emit = () => toastListeners.forEach((l) => l())

export function toast(text: string, tone: Toast['tone'] = 'good') {
  const t = { id: Date.now() + Math.random(), text, tone }
  toasts = [...toasts.slice(-1), t]
  emit()
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id)
    emit()
  }, 3600)
}

export function subscribeToasts(fn: () => void) {
  toastListeners.add(fn)
  return () => {
    toastListeners.delete(fn)
  }
}

export const getToasts = () => toasts
