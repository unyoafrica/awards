import type { Campaign } from '../types'
import { CampaignStatusBadge } from './CampaignStatusBadge'
import { MediaThumb } from './MediaThumb'
import { ChannelLogo } from './PlatformLogo'
import { channelLabels } from '../services/platforms'
import { formatCount, formatNaira, joinList } from '../utils/format'
import { formatRange } from '../utils/dates'
import { goals } from '../utils/copy'
import { totalAmount } from '../utils/estimates'
import { Icon } from '../../../ui/Icon'

export function CampaignCard({ campaign: c, onOpen }: { campaign: Campaign; onOpen: () => void }) {
  const goal = goals[c.objective]
  const budget = totalAmount(c.budget)
  const spentShare = Math.min(1, c.spend / budget)
  const live = c.status === 'running' || c.status === 'paused' || c.status === 'completed'
  return (
    <button type="button" className="ad-card" onClick={onOpen}>
      <div className="ad-card__top">
        <div className="ad-card__thumb">
          <MediaThumb media={c.creative.media[0]} />
        </div>
        <div className="ad-card__id">
          <h3>{c.name}</h3>
          <p>{c.promoted.name}</p>
          <div className="ad-card__channels" aria-label={joinList(c.channels.map((ch) => channelLabels[ch]))}>
            {c.channels.map((ch) => (
              <ChannelLogo key={ch} channel={ch} size={18} />
            ))}
            <span>{joinList(c.channels.map((ch) => channelLabels[ch]))}</span>
          </div>
        </div>
        <Icon name="chevron-right" size={20} className="ad-card__chev" />
      </div>

      <div className="ad-card__status">
        <CampaignStatusBadge status={c.status} />
        <span className="ad-card__dates">{formatRange(c.startDate, c.endDate)}</span>
      </div>

      {live ? (
        <>
          <dl className="ad-card__stats">
            <div>
              <dt>Spent</dt>
              <dd className="num">{formatNaira(c.spend)}</dd>
            </div>
            <div>
              <dt>Reached</dt>
              <dd className="num">{formatCount(c.reach)}</dd>
            </div>
            <div>
              <dt>{goal.resultLabel}</dt>
              <dd className="num">{formatCount(c.results)}</dd>
            </div>
          </dl>
          <div
            className="ad-meter"
            role="meter"
            aria-label="Budget used"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(spentShare * 100)}
          >
            <span style={{ width: `${spentShare * 100}%` }} />
          </div>
          <p className="ad-card__budget num">
            {formatNaira(c.spend)} of {formatNaira(budget)} budget
          </p>
        </>
      ) : c.issue ? (
        <p className="ad-card__issue">
          <Icon name="alert" size={16} />
          {c.issue.title}
        </p>
      ) : (
        <p className="ad-card__note">
          <Icon name="clock" size={16} />
          {c.status === 'processing' ? 'Getting your ad ready…' : 'Usually approved within a few hours'}
        </p>
      )}
    </button>
  )
}

export function CampaignCardSkeleton() {
  return (
    <div className="ad-card ad-card--skel" aria-hidden="true">
      <div className="ad-card__top">
        <span className="q-skel" style={{ width: 56, height: 56, borderRadius: 14 }} />
        <div style={{ flex: 1, display: 'grid', gap: 8 }}>
          <span className="q-skel" style={{ height: 16, width: '60%', borderRadius: 8 }} />
          <span className="q-skel" style={{ height: 12, width: '40%', borderRadius: 8 }} />
        </div>
      </div>
      <span className="q-skel" style={{ height: 44, borderRadius: 12 }} />
    </div>
  )
}
