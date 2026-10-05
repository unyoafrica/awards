import type { CampaignStatus } from '../types'
import { statusCopy } from '../utils/copy'

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const s = statusCopy[status]
  return (
    <span className={`ad-badge ad-badge--${s.tone}`}>
      <span className={`ad-badge__dot ${status === 'running' ? 'is-live' : ''}`} aria-hidden="true" />
      {s.label}
    </span>
  )
}
