import type { ReactNode } from 'react'
import { Icon } from '../../../ui/Icon'

/** Stat tile: label, one big number, optional supporting line. */
export function MetricCard({
  label,
  value,
  icon,
  tone = 'plain',
  sub,
}: {
  label: string
  value: ReactNode
  icon?: string
  tone?: 'plain' | 'green' | 'yellow'
  sub?: ReactNode
}) {
  return (
    <div className={`ad-metric ad-metric--${tone}`}>
      {icon && (
        <span className="ad-metric__icon">
          <Icon name={icon} size={18} />
        </span>
      )}
      <span className="ad-metric__label">{label}</span>
      <strong className="ad-metric__value num">{value}</strong>
      {sub && <span className="ad-metric__sub">{sub}</span>}
    </div>
  )
}

export function MetricSkeleton() {
  return (
    <div className="ad-metric" aria-hidden="true">
      <span className="q-skel" style={{ height: 12, width: '50%', borderRadius: 6 }} />
      <span className="q-skel" style={{ height: 26, width: '70%', borderRadius: 8, marginTop: 8 }} />
    </div>
  )
}
