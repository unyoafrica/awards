import type { PlatformStats } from '../types'
import { platformLabels } from '../services/platforms'
import { ChannelLogo } from './PlatformLogo'
import { formatCount, formatNaira } from '../utils/format'

const seriesVar: Record<string, string> = {
  meta: 'var(--q-series-1)',
  tiktok: 'var(--q-series-2)',
  snapchat: 'var(--q-series-3)',
}

/** Per-platform rows with a share-of-spend bar; every bar carries its own label and value. */
export function PlatformBreakdown({ stats, resultLabel }: { stats: PlatformStats[]; resultLabel: string }) {
  const totalSpend = stats.reduce((t, s) => t + s.spend, 0) || 1
  const best = [...stats]
    .filter((s) => s.results > 0)
    .sort((a, b) => a.spend / a.results - b.spend / b.results)[0]?.platform
  return (
    <ul className="ad-breakdown">
      {stats.map((s) => {
        const share = s.spend / totalSpend
        return (
          <li key={s.platform}>
            <div className="ad-breakdown__head">
              <ChannelLogo channel={s.platform} size={28} />
              <strong>{platformLabels[s.platform]}</strong>
              {best === s.platform && stats.length > 1 && <span className="ad-pill ad-pill--good">Lowest cost</span>}
              <span className="ad-breakdown__share num">{Math.round(share * 100)}% of spend</span>
            </div>
            <div className="ad-breakdown__bar" aria-hidden="true">
              <span style={{ width: `${share * 100}%`, background: seriesVar[s.platform] }} />
            </div>
            <dl className="ad-breakdown__stats">
              <div>
                <dt>Spent</dt>
                <dd className="num">{formatNaira(s.spend)}</dd>
              </div>
              <div>
                <dt>{resultLabel}</dt>
                <dd className="num">{formatCount(s.results)}</dd>
              </div>
              <div>
                <dt>Each cost</dt>
                <dd className="num">{s.results ? formatNaira(s.spend / s.results) : '–'}</dd>
              </div>
            </dl>
          </li>
        )
      })}
    </ul>
  )
}
