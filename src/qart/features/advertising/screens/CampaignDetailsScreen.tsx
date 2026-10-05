import { useMemo, useState } from 'react'
import type { Campaign, DailyPoint, PlatformStats } from '../types'
import { useCampaign, useAdsState } from '../hooks/useAds'
import { draftStore } from '../hooks/useDraft'
import { back, navigate } from '../../../app/router'
import { Icon } from '../../../ui/Icon'
import { BottomSheet, ScreenHeader } from '../../../ui/primitives'
import { haptic, toast } from '../../../ui/feedback'
import { CampaignStatusBadge } from '../components/CampaignStatusBadge'
import { MetricCard } from '../components/MetricCard'
import { PerformanceChart } from '../components/PerformanceChart'
import { PlatformBreakdown } from '../components/PlatformBreakdown'
import { CreativePreview } from '../components/CreativePreview'
import { AIRecommendationCard } from '../components/AIRecommendationCard'
import { BudgetActionSheet, type BudgetAction } from '../components/BudgetActionSheet'
import { EmptyState } from '../components/States'
import { adsService } from '../services/adsService'
import { channelLabels, platformLabels, platformsFor } from '../services/platforms'
import { describeAudience, goals, statusCopy } from '../utils/copy'
import { totalAmount, dailyAmount } from '../utils/estimates'
import { formatDay, formatRange } from '../utils/dates'
import { formatCount, formatMultiple, formatNaira, formatNairaCompact, formatPercent, joinList } from '../utils/format'
import { recommend, type Recommendation } from '../utils/recommendations'

type Range = 'today' | '7d' | '30d' | 'custom'
type Measure = 'spend' | 'reach' | 'results' | 'revenue'

function sum(points: DailyPoint[]) {
  return points.reduce(
    (t, p) => ({
      spend: t.spend + p.spend,
      reach: t.reach + p.reach,
      impressions: t.impressions + p.impressions,
      clicks: t.clicks + p.clicks,
      results: t.results + p.results,
      revenue: t.revenue + p.revenue,
    }),
    { spend: 0, reach: 0, impressions: 0, clicks: 0, results: 0, revenue: 0 },
  )
}

/** Scale per-platform totals to the selected range so every number on screen agrees. */
function scalePlatforms(stats: PlatformStats[], share: number): PlatformStats[] {
  return stats.map((s) => ({
    ...s,
    spend: s.spend * share,
    reach: s.reach * share,
    impressions: s.impressions * share,
    clicks: s.clicks * share,
    results: Math.round(s.results * share),
    revenue: s.revenue * share,
  }))
}

export function CampaignDetailsScreen({ id }: { id: string }) {
  const c = useCampaign(id)
  if (!c) {
    return (
      <div className="q-screen">
        <ScreenHeader title="Campaign" onBack={() => back('/ads')} />
        <EmptyState
          title="We couldn’t find this campaign"
          body="It may have been removed. Your other campaigns are safe."
          action={
            <button type="button" className="q-btn q-btn--primary" onClick={() => navigate('/ads', { replace: true })}>
              Back to Ads
            </button>
          }
        />
      </div>
    )
  }
  return <Details c={c} />
}

function Details({ c }: { c: Campaign }) {
  const { dismissed } = useAdsState()
  const [range, setRange] = useState<Range>('30d')
  const [custom, setCustom] = useState<[number, number]>([0, Math.max(0, c.daily.length - 1)])
  const [customOpen, setCustomOpen] = useState(false)
  const [measure, setMeasure] = useState<Measure>('results')
  const [moreOpen, setMoreOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [action, setAction] = useState<BudgetAction | null>(null)
  const [retrying, setRetrying] = useState(false)

  const goal = goals[c.objective]
  const points = useMemo(() => {
    if (range === 'today') return c.daily.slice(-1)
    if (range === '7d') return c.daily.slice(-7)
    if (range === 'custom') return c.daily.slice(custom[0], custom[1] + 1)
    return c.daily.slice(-30)
  }, [c.daily, range, custom])
  const t = sum(points)
  const all = sum(c.daily)
  const share = all.spend ? t.spend / all.spend : 0
  const budget = totalAmount(c.budget)
  const hasData = c.daily.length > 0
  const roas = t.spend ? t.revenue / t.spend : 0
  const recs = recommend(c).filter((r) => !dismissed.includes(r.id))
  const status = statusCopy[c.status]
  const platforms = joinList(platformsFor(c.channels).map((p) => platformLabels[p]))

  const measures: Record<Measure, { label: string; fmt: (n: number) => string }> = {
    results: { label: goal.resultLabel, fmt: (n) => formatCount(n) },
    spend: { label: 'Spent', fmt: (n) => formatNairaCompact(n) },
    reach: { label: 'People reached', fmt: (n) => formatCount(n) },
    revenue: { label: 'Sales', fmt: (n) => formatNairaCompact(n) },
  }

  const onRec = (rec: Recommendation, which: 'primary' | 'secondary') => {
    const a = which === 'primary' ? rec.primary.action : rec.secondary!.action
    if (a === 'increase_budget') setAction({ kind: 'increase', amount: rec.primary.amount })
    else if (a === 'extend') setAction({ kind: 'extend', days: 3 })
    else if (a === 'insights') document.getElementById('platforms')?.scrollIntoView({ behavior: 'smooth' })
    else adsService.dismissRecommendation(rec.id)
  }

  const fixAd = () => {
    draftStore.reset(
      {
        name: c.name,
        objective: c.objective,
        promoted: c.promoted,
        creative: c.creative,
        channels: c.channels,
        audience: c.audience,
        budget: c.budget,
      },
      c.id,
    )
    navigate('/ads/create/3?from=review')
  }

  const togglePause = () => {
    haptic(12)
    if (c.status === 'running') {
      adsService.pause(c.id)
      toast('Paused. Nothing more will be spent until you resume.', 'info')
    } else {
      adsService.resume(c.id)
      toast('Your ad is running again.')
    }
  }

  return (
    <div className="q-screen q-screen--flow">
      <ScreenHeader
        title={c.name}
        onBack={() => back('/ads')}
        right={
          <button type="button" className="q-icon-btn" onClick={() => setMenuOpen(true)} aria-label="Campaign options">
            <Icon name="more" strokeWidth={3} />
          </button>
        }
      />

      <div className="ad-detail__status">
        <CampaignStatusBadge status={c.status} />
        <span className="ad-detail__dates num">{formatRange(c.startDate, c.endDate)}</span>
      </div>

      {/* Lifecycle explanation: always says what is happening and what comes next. */}
      {c.issue ? (
        <div className="ad-issue" role="alert">
          <div className="ad-issue__head">
            <Icon name="alert" size={22} />
            <strong>{c.issue.title}</strong>
          </div>
          <p>{c.issue.detail}</p>
          <div className="ad-issue__actions">
            {c.issue.action === 'edit_creative' && (
              <button type="button" className="q-btn q-btn--dark q-btn--sm" onClick={fixAd}>
                <Icon name="pencil" size={16} /> Fix and resubmit
              </button>
            )}
            {c.issue.action === 'retry' && (
              <button
                type="button"
                className="q-btn q-btn--dark q-btn--sm"
                disabled={retrying}
                onClick={async () => {
                  setRetrying(true)
                  await adsService.retry(c.id)
                  setRetrying(false)
                  toast('Sent again. We’ll let you know when it’s approved.')
                }}
              >
                <Icon name="refresh" size={16} /> {retrying ? 'Trying…' : 'Try again'}
              </button>
            )}
            <a className="q-btn q-btn--ghost q-btn--sm" href="mailto:support@qart.ng">
              Contact support
            </a>
          </div>
        </div>
      ) : c.status === 'in_review' || c.status === 'processing' ? (
        <div className="ad-lifecycle">
          <ol className="ad-timeline ad-timeline--compact">
            <li className="is-done">
              <span className="ad-timeline__dot">
                <Icon name="check" size={12} strokeWidth={2.6} />
              </span>
              <div>
                <strong>Submitted</strong>
                <span>{formatNaira(budget)} added to this campaign</span>
              </div>
            </li>
            <li className="is-now">
              <span className="ad-timeline__dot" />
              <div>
                <strong>{status.label}</strong>
                <span>{c.status === 'processing' ? status.explain : `${platforms} are checking your ad. Usually a few hours, at most 24.`}</span>
              </div>
            </li>
            <li>
              <span className="ad-timeline__dot" />
              <div>
                <strong>Live</strong>
                <span>We’ll notify you when it’s approved</span>
              </div>
            </li>
          </ol>
        </div>
      ) : (
        <p className="ad-detail__explain">
          <Icon name={c.status === 'running' ? 'bolt' : c.status === 'paused' ? 'pause' : 'check'} size={16} />
          {status.explain}
        </p>
      )}

      {c.status === 'running' && !hasData && (
        <div className="ad-tip ad-tip--plain">
          <Icon name="clock" size={18} />
          <div>
            <strong>Your ad just went live</strong>
            <span>First results usually show up within a few hours. Check back this evening.</span>
          </div>
        </div>
      )}

      {hasData && (
        <>
          <div className="ad-range" role="tablist" aria-label="Date range">
            {(
              [
                ['today', 'Today'],
                ['7d', '7 days'],
                ['30d', '30 days'],
                ['custom', 'Custom'],
              ] as const
            ).map(([r, label]) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={range === r}
                className={range === r ? 'is-on' : ''}
                onClick={() => {
                  if (r === 'custom') setCustomOpen(true)
                  setRange(r)
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {range === 'custom' && points.length > 0 && (
            <button type="button" className="ad-range__custom" onClick={() => setCustomOpen(true)}>
              <Icon name="calendar" size={16} /> {formatRange(points[0].date, points[points.length - 1].date)}
              <Icon name="chevron-down" size={16} />
            </button>
          )}

          <section className="ad-result">
            <p>Your ad generated</p>
            <strong className="num">
              {formatCount(t.results)} {t.results === 1 ? goal.resultOne : goal.resultLabel.toLowerCase()}
            </strong>
            <p>
              from <span className="num">{formatNaira(t.spend)}</span> spent
            </p>
            {t.revenue > 0 && (
              <div className="ad-result__row">
                <div>
                  <span>Sales generated</span>
                  <strong className="num">{formatNaira(t.revenue)}</strong>
                </div>
                <div>
                  <span>Return</span>
                  <strong className="num">{formatMultiple(roas)}</strong>
                </div>
              </div>
            )}
          </section>

          <div className="ad-metrics">
            <MetricCard
              label="Amount spent"
              value={formatNaira(t.spend)}
              sub={
                <>
                  <span className="ad-meter ad-meter--sm" aria-hidden="true">
                    <span style={{ width: `${Math.min(100, (c.spend / budget) * 100)}%` }} />
                  </span>
                  <span className="num">
                    {formatNaira(c.spend)} of {formatNaira(budget)} used
                  </span>
                </>
              }
            />
            <MetricCard label="People reached" value={formatCount(t.reach)} />
            <MetricCard label={goal.resultLabel} value={formatCount(t.results)} tone="green" />
            <MetricCard label={goal.costLabel} value={t.results ? formatNaira(t.spend / t.results) : '–'} />
          </div>

          {recs.length > 0 && (
            <div className="ad-recs" style={{ marginTop: 16 }}>
              {recs.map((r) => (
                <AIRecommendationCard key={r.id} rec={r} onAction={onRec} onDismiss={() => adsService.dismissRecommendation(r.id)} />
              ))}
            </div>
          )}

          <section className="ad-panel">
            <div className="ad-panel__head">
              <h2>Performance</h2>
            </div>
            <div className="ad-measures" role="tablist" aria-label="Measure">
              {(Object.keys(measures) as Measure[]).map((m) => (
                <button key={m} type="button" role="tab" aria-selected={measure === m} className={`q-chip ${measure === m ? 'is-on' : ''}`} onClick={() => setMeasure(m)}>
                  {measures[m].label}
                </button>
              ))}
            </div>
            <PerformanceChart
              points={points.map((p) => ({ date: p.date, value: p[measure] }))}
              format={measures[measure].fmt}
              label={measures[measure].label}
            />
          </section>

          <section className="ad-panel">
            <button type="button" className="ad-disclose" aria-expanded={moreOpen} onClick={() => setMoreOpen((o) => !o)}>
              <span>
                <strong>More details</strong>
                <span>Impressions, clicks and other ad numbers</span>
              </span>
              <Icon name="chevron-down" size={20} style={{ transform: moreOpen ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} />
            </button>
            {moreOpen && (
              <dl className="ad-advanced">
                <Adv term="Impressions" value={formatCount(t.impressions)} help="Times your ad was shown" />
                <Adv term="Clicks" value={formatCount(t.clicks)} help="Taps on your ad" />
                <Adv term="CTR" value={t.impressions ? formatPercent(t.clicks / t.impressions, 2) : '–'} help="Share of views that got a tap" />
                <Adv term="CPC" value={t.clicks ? formatNaira(t.spend / t.clicks) : '–'} help="Cost per tap" />
                <Adv term="CPM" value={t.impressions ? formatNaira((t.spend / t.impressions) * 1000) : '–'} help="Cost per 1,000 views" />
                <Adv term="Conversion rate" value={t.clicks ? formatPercent(t.results / t.clicks) : '–'} help={`Taps that became ${goal.resultLabel.toLowerCase()}`} />
                <Adv term="ROAS" value={t.revenue ? formatMultiple(roas) : '–'} help="Sales for every ₦1 spent" />
                <Adv term="Frequency" value={t.reach ? (t.impressions / t.reach).toFixed(1) : '–'} help="Average views per person" />
              </dl>
            )}
          </section>

          {c.byPlatform.length > 0 && (
            <section className="ad-panel" id="platforms">
              <div className="ad-panel__head">
                <h2>By platform</h2>
              </div>
              <PlatformBreakdown stats={scalePlatforms(c.byPlatform, share)} resultLabel={goal.resultLabel} />
            </section>
          )}

          {c.insights && (
            <section className="ad-panel">
              <div className="ad-panel__head">
                <h2>Who’s responding</h2>
              </div>
              <h3 className="ad-panel__sub">Top areas</h3>
              <ul className="ad-bars">
                {c.insights.topLocations.map((l) => (
                  <li key={l.name}>
                    <span>{l.name}</span>
                    <span className="ad-bars__track" aria-hidden="true">
                      <span style={{ width: `${(l.share / c.insights!.topLocations[0].share) * 100}%` }} />
                    </span>
                    <span className="num">{Math.round(l.share * 100)}%</span>
                  </li>
                ))}
              </ul>
              <h3 className="ad-panel__sub">Age</h3>
              <ul className="ad-bars">
                {c.insights.ages.map((a) => (
                  <li key={a.band}>
                    <span>{a.band}</span>
                    <span className="ad-bars__track" aria-hidden="true">
                      <span style={{ width: `${(a.share / Math.max(...c.insights!.ages.map((x) => x.share))) * 100}%` }} />
                    </span>
                    <span className="num">{Math.round(a.share * 100)}%</span>
                  </li>
                ))}
              </ul>
              <p className="ad-insight-line">
                <Icon name="sparkle" size={16} />
                {Math.round(c.insights.gender.women * 100)}% of the people responding are women, mostly aged{' '}
                {[...c.insights.ages].sort((a, b) => b.share - a.share)[0].band}.
              </p>
            </section>
          )}
        </>
      )}

      <section className="ad-panel">
        <div className="ad-panel__head">
          <h2>Your ad</h2>
          {c.status !== 'completed' && (
            <button type="button" className="q-link" onClick={() => setEditOpen(true)}>
              Edit text
            </button>
          )}
        </div>
        <CreativePreview creative={c.creative} channels={c.channels} />
      </section>

      <section className="ad-panel">
        <div className="ad-panel__head">
          <h2>Campaign details</h2>
        </div>
        <dl className="ad-review ad-review--plain">
          <div>
            <dt>Goal</dt>
            <dd>{goal.title}</dd>
          </div>
          <div>
            <dt>Promoting</dt>
            <dd>{c.promoted.name}</dd>
          </div>
          <div>
            <dt>Platforms</dt>
            <dd>{joinList(c.channels.map((ch) => channelLabels[ch]))}</dd>
          </div>
          <div>
            <dt>Audience</dt>
            <dd>{describeAudience(c.audience)}</dd>
          </div>
          <div>
            <dt>Budget</dt>
            <dd className="num">
              {c.budget.type === 'daily' ? `${formatNaira(c.budget.amount)} a day` : `${formatNaira(budget)} total`} · {c.budget.durationDays} days
            </dd>
          </div>
          <div>
            <dt>Paid</dt>
            <dd className="num">{c.paid ? `${formatNaira(c.paid)} incl. fees` : 'Nothing charged'}</dd>
          </div>
          <div>
            <dt>Started</dt>
            <dd>{formatDay(c.startDate)}</dd>
          </div>
        </dl>
      </section>

      {(c.status === 'running' || c.status === 'paused') && (
        <div className="q-actionbar">
          <button type="button" className="q-btn q-btn--ghost" onClick={togglePause}>
            <Icon name={c.status === 'running' ? 'pause' : 'play'} size={18} />
            {c.status === 'running' ? 'Pause' : 'Resume'}
          </button>
          <button type="button" className="q-btn q-btn--dark" onClick={() => setAction({ kind: 'increase', amount: 5000 })}>
            <Icon name="trend" size={18} /> Boost budget
          </button>
        </div>
      )}
      {c.status === 'completed' && (
        <div className="q-actionbar">
          <button type="button" className="q-btn q-btn--primary" onClick={() => setAction({ kind: 'extend', days: 7 })}>
            Run it again
          </button>
        </div>
      )}

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title={c.name}>
        <ul className="ad-menu">
          {(c.status === 'running' || c.status === 'paused') && (
            <>
              <li>
                <button type="button" onClick={() => (setMenuOpen(false), setAction({ kind: 'increase', amount: 5000 }))}>
                  <Icon name="trend" /> Increase daily budget
                </button>
              </li>
              <li>
                <button type="button" onClick={() => (setMenuOpen(false), setAction({ kind: 'extend', days: 3 }))}>
                  <Icon name="calendar" /> Run for more days
                </button>
              </li>
              <li>
                <button type="button" onClick={() => (setMenuOpen(false), togglePause())}>
                  <Icon name={c.status === 'running' ? 'pause' : 'play'} /> {c.status === 'running' ? 'Pause campaign' : 'Resume campaign'}
                </button>
              </li>
            </>
          )}
          {c.status !== 'completed' && (
            <li>
              <button type="button" onClick={() => (setMenuOpen(false), setEditOpen(true))}>
                <Icon name="pencil" /> Edit ad text
              </button>
            </li>
          )}
          <li>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                draftStore.reset({
                  name: `${c.name} (copy)`,
                  objective: c.objective,
                  promoted: c.promoted,
                  creative: c.creative,
                  channels: c.channels,
                  audience: c.audience,
                  budget: { ...c.budget, amount: c.budget.type === 'daily' ? dailyAmount(c.budget) : c.budget.amount },
                })
                navigate('/ads/create/7')
              }}
            >
              <Icon name="copy" /> Duplicate as a new ad
            </button>
          </li>
          <li>
            <a href="mailto:support@qart.ng">
              <Icon name="headset" /> Get help with this ad
            </a>
          </li>
        </ul>
      </BottomSheet>

      <EditCopySheet open={editOpen} onClose={() => setEditOpen(false)} c={c} />
      <BudgetActionSheet campaign={c} action={action} onClose={() => setAction(null)} />

      <BottomSheet
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        title="Choose dates"
        footer={
          <button type="button" className="q-btn q-btn--primary" onClick={() => setCustomOpen(false)}>
            Show results
          </button>
        }
      >
        <div className="ad-grid-2">
          <label className="q-field">
            <span>From</span>
            <select className="q-select" value={custom[0]} onChange={(e) => setCustom([Number(e.target.value), Math.max(Number(e.target.value), custom[1])])}>
              {c.daily.map((d, i) => (
                <option key={d.date} value={i}>
                  {formatDay(d.date)}
                </option>
              ))}
            </select>
          </label>
          <label className="q-field">
            <span>To</span>
            <select className="q-select" value={custom[1]} onChange={(e) => setCustom([Math.min(custom[0], Number(e.target.value)), Number(e.target.value)])}>
              {c.daily.map((d, i) => (
                <option key={d.date} value={i}>
                  {formatDay(d.date)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </BottomSheet>
    </div>
  )
}

function Adv({ term, value, help }: { term: string; value: string; help: string }) {
  return (
    <div>
      <dt>
        {term}
        <span>{help}</span>
      </dt>
      <dd className="num">{value}</dd>
    </div>
  )
}

function EditCopySheet({ open, onClose, c }: { open: boolean; onClose: () => void; c: Campaign }) {
  const [headline, setHeadline] = useState(c.creative.headline)
  const [text, setText] = useState(c.creative.primaryText)
  const live = c.status === 'running'
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Edit ad text"
      footer={
        <button
          type="button"
          className="q-btn q-btn--primary"
          disabled={!text.trim()}
          onClick={() => {
            adsService.updateCopy(c.id, headline, text)
            onClose()
            toast(live ? 'Saved. Your ad keeps running while the change is reviewed.' : c.status === 'rejected' ? 'Saved and resubmitted for review.' : 'Saved')
          }}
        >
          Save changes
        </button>
      }
    >
      <div className="ad-stack">
        <label className="q-field">
          <span>Headline</span>
          <input className="q-input" value={headline} maxLength={40} onChange={(e) => setHeadline(e.target.value)} />
        </label>
        <label className="q-field">
          <span>Main text</span>
          <textarea className="q-textarea" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} />
        </label>
        {(live || c.status === 'rejected') && (
          <p className="ad-tip ad-tip--plain ad-tip--small">
            <Icon name="info" size={16} />
            <span>Changes go through a quick review again.{live ? ' Your current ad keeps running meanwhile.' : ''}</span>
          </p>
        )}
      </div>
    </BottomSheet>
  )
}
