import { useMemo, useState } from 'react'
import type { DailyPoint, PlatformId, PlatformStats } from '../types'
import { useCampaigns } from '../hooks/useAds'
import { back, navigate } from '../../../app/router'
import { ScreenHeader, Segmented } from '../../../ui/primitives'
import { MetricCard, MetricSkeleton } from '../components/MetricCard'
import { PerformanceChart } from '../components/PerformanceChart'
import { PlatformBreakdown } from '../components/PlatformBreakdown'
import { EmptyState } from '../components/States'
import { MediaThumb } from '../components/MediaThumb'
import { addDays, today } from '../utils/dates'
import { formatCount, formatMultiple, formatNaira, formatNairaCompact } from '../utils/format'
import { startNewAd } from '../hooks/useDraft'

type Measure = 'results' | 'spend' | 'revenue'

/** All campaigns together: where the money went and what came back. */
export function InsightsScreen() {
  const { campaigns, loading } = useCampaigns()
  const [range, setRange] = useState<'7' | '30'>('30')
  const [measure, setMeasure] = useState<Measure>('results')

  const { days, platforms, totals } = useMemo(() => {
    const n = Number(range)
    const start = addDays(today(), -(n - 1))
    const byDate = new Map<string, DailyPoint>()
    for (let i = 0; i < n; i++) {
      const date = addDays(start, i)
      byDate.set(date, { date, spend: 0, reach: 0, impressions: 0, clicks: 0, results: 0, revenue: 0 })
    }
    const plat = new Map<PlatformId, PlatformStats>()
    for (const c of campaigns) {
      const inRange = c.daily.filter((d) => byDate.has(d.date))
      for (const d of inRange) {
        const t = byDate.get(d.date)!
        t.spend += d.spend
        t.reach += d.reach
        t.impressions += d.impressions
        t.clicks += d.clicks
        t.results += d.results
        t.revenue += d.revenue
      }
      const share = c.spend ? inRange.reduce((s, d) => s + d.spend, 0) / c.spend : 0
      for (const p of c.byPlatform) {
        const t = plat.get(p.platform) ?? { platform: p.platform, spend: 0, reach: 0, impressions: 0, clicks: 0, results: 0, revenue: 0 }
        t.spend += p.spend * share
        t.reach += p.reach * share
        t.impressions += p.impressions * share
        t.clicks += p.clicks * share
        t.results += Math.round(p.results * share)
        t.revenue += p.revenue * share
        plat.set(p.platform, t)
      }
    }
    const days = [...byDate.values()]
    const totals = days.reduce(
      (t, d) => ({ spend: t.spend + d.spend, reach: t.reach + d.reach, results: t.results + d.results, revenue: t.revenue + d.revenue }),
      { spend: 0, reach: 0, results: 0, revenue: 0 },
    )
    return { days, platforms: [...plat.values()].sort((a, b) => b.spend - a.spend), totals }
  }, [campaigns, range])

  const ranked = campaigns
    .filter((c) => c.spend > 0)
    .map((c) => ({ c, roas: c.revenue / c.spend }))
    .sort((a, b) => b.roas - a.roas)

  const fmt: Record<Measure, (n: number) => string> = {
    results: formatCount,
    spend: formatNairaCompact,
    revenue: formatNairaCompact,
  }
  const labels: Record<Measure, string> = { results: 'Customers & messages', spend: 'Spent', revenue: 'Sales' }

  return (
    <div className="q-screen">
      <ScreenHeader title="Insights" onBack={() => back('/ads')} />
      {!loading && campaigns.every((c) => c.spend === 0) ? (
        <EmptyState
          art="pie"
          title="No results to show yet"
          body="Once an ad is running, you’ll see what you spent and what came back, all in one place."
          action={
            <button type="button" className="q-btn q-btn--primary" onClick={startNewAd}>
              Create an ad
            </button>
          }
        />
      ) : (
        <>
          <Segmented
            label="Date range"
            value={range}
            onChange={setRange}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
            ]}
          />
          <div className="ad-metrics" style={{ marginTop: 16 }}>
            {loading ? (
              [0, 1, 2, 3].map((i) => <MetricSkeleton key={i} />)
            ) : (
              <>
                <MetricCard label="Total spent" value={formatNaira(totals.spend)} />
                <MetricCard label="People reached" value={formatCount(totals.reach)} />
                <MetricCard label="Customers & messages" value={formatCount(totals.results)} tone="green" />
                <MetricCard
                  label="Sales"
                  value={formatNairaCompact(totals.revenue)}
                  tone="yellow"
                  sub={totals.spend ? `${formatMultiple(totals.revenue / totals.spend)} what you spent` : undefined}
                />
              </>
            )}
          </div>

          <section className="ad-panel">
            <div className="ad-panel__head">
              <h2>Day by day</h2>
            </div>
            <div className="ad-measures" role="tablist" aria-label="Measure">
              {(Object.keys(labels) as Measure[]).map((m) => (
                <button key={m} type="button" role="tab" aria-selected={measure === m} className={`q-chip ${measure === m ? 'is-on' : ''}`} onClick={() => setMeasure(m)}>
                  {labels[m]}
                </button>
              ))}
            </div>
            <PerformanceChart points={days.map((d) => ({ date: d.date, value: d[measure] }))} format={fmt[measure]} label={labels[measure]} />
          </section>

          {platforms.length > 0 && (
            <section className="ad-panel">
              <div className="ad-panel__head">
                <h2>By platform</h2>
              </div>
              <PlatformBreakdown stats={platforms} resultLabel="Results" />
            </section>
          )}

          {ranked.length > 0 && (
            <section className="ad-panel">
              <div className="ad-panel__head">
                <h2>Best performing ads</h2>
              </div>
              <ol className="ad-rank">
                {ranked.map(({ c, roas }, i) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => navigate(`/ads/campaigns/${c.id}`)}>
                      <span className="ad-rank__n num">{i + 1}</span>
                      <span className="ad-rank__thumb">
                        <MediaThumb media={c.creative.media[0]} />
                      </span>
                      <span className="ad-rank__name">
                        <strong>{c.name}</strong>
                        <span className="num">
                          {formatNaira(c.spend)} spent · {formatNairaCompact(c.revenue)} sales
                        </span>
                      </span>
                      <span className="ad-rank__roas num">{formatMultiple(roas)}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="q-hint">“8x” means every ₦1 spent brought back ₦8 in sales tracked by Qart.</p>
            </section>
          )}
        </>
      )}
    </div>
  )
}
