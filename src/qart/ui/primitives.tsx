import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import { haptic, subscribeToasts, getToasts } from './feedback'

export function ScreenHeader({
  title,
  onBack,
  right,
  sub,
}: {
  title: string
  onBack?: () => void
  right?: ReactNode
  sub?: ReactNode
}) {
  return (
    <header className="q-header">
      {onBack ? (
        <button type="button" className="q-icon-btn" onClick={onBack} aria-label="Back">
          <Icon name="chevron-left" />
        </button>
      ) : (
        <span className="q-header__spacer" />
      )}
      <div className="q-header__title">
        <h1>{title}</h1>
        {sub}
      </div>
      {right ?? <span className="q-header__spacer" />}
    </header>
  )
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  const id = useId()
  const panel = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(raf)
    }
    setShown(false)
    const t = setTimeout(() => setMounted(false), 260)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [open, onClose])

  if (!mounted) return null
  return createPortal(
    <div className={`q-sheet ${shown ? 'is-open' : ''}`}>
      <div className="q-sheet__scrim" onClick={onClose} />
      <div className="q-sheet__panel" role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1} ref={panel}>
        <div className="q-sheet__grip" />
        <div className="q-sheet__head">
          <h2 id={id}>{title}</h2>
          <button type="button" className="q-icon-btn q-icon-btn--soft" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="q-sheet__body">{children}</div>
        {footer && <div className="q-sheet__foot">{footer}</div>}
      </div>
    </div>,
    document.getElementById('q-overlay') ?? document.body,
  )
}

export function Toaster() {
  const list = useSyncExternalStore(subscribeToasts, getToasts)
  return (
    <div className="q-toasts" role="status" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className={`q-toast q-toast--${t.tone}`}>
          <Icon name={t.tone === 'bad' ? 'alert' : t.tone === 'info' ? 'info' : 'check'} size={18} />
          {t.text}
        </div>
      ))}
    </div>
  )
}

export function Skeleton({ h = 16, w = '100%', r = 10 }: { h?: number; w?: number | string; r?: number }) {
  return <span className="q-skel" style={{ height: h, width: w, borderRadius: r }} aria-hidden="true" />
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div className="q-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={value === o.value ? 'is-on' : ''}
          onClick={() => {
            haptic()
            onChange(o.value)
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Chip({
  on,
  children,
  onClick,
}: {
  on: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      className={`q-chip ${on ? 'is-on' : ''}`}
      onClick={() => {
        haptic()
        onClick()
      }}
    >
      {on && <Icon name="check" size={14} strokeWidth={2.4} />}
      {children}
    </button>
  )
}

export function SectionLabel({ icon, children, action }: { icon?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="q-section-label">
      <span>
        {icon && <Icon name={icon} size={18} />}
        {children}
      </span>
      {action}
    </div>
  )
}
