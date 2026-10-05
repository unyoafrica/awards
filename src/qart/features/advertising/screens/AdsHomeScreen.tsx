import { useMemo, useState } from 'react'
import type { Campaign, CampaignStatus } from '../types'
import { useAdsState, useCampaigns } from '../hooks/useAds'
import { useDraft, startNewAd } from '../hooks/useDraft'
import { navigate } from '../../../app/router'
import { Icon } from '../../../ui/Icon'
import { BottomSheet, SectionLabel } from '../../../ui/primitives'
import { toast } from '../../../ui/feedback'
import { CampaignCard, CampaignCardSkeleton } from '../components/CampaignCard'
import { MetricCard, MetricSkeleton } from '../components/MetricCard'
import { EmptyState } from '../components/States'
import { AIRecommendationCard } from '../components/AIRecommendationCard'
import { BudgetActionSheet, type BudgetAction } from '../components/BudgetActionSheet'
import { adsService } from '../services/adsService'
import { recommend, type Recommendation } from '../utils/recommendations'
import { formatCount, formatNaira, formatNairaCompact } from '../utils/format'
import { goals } from '../utils/copy'

type Filter = 'all' | 'active' | 'review' | 'attention' | 'ended'

const filterMatch: Record<Filter, CampaignStatus[] | null> = {
  all: null,
  active: ['running', 'paused'],
  review: ['processing', 'in_review'],
  attention: ['rejected', 'failed'],
  ended: ['completed'],
}

const filterLabels: Record<Filter, string> = {
  all: 'All',
  active: 'Active',
  review: 'In review',
  attention: 'Needs attention',
  ended: 'Ended',
}

export function AdsHomeScreen() {
  const { campaigns, loading } = useCampaigns()
  const { balance, dismissed } = useAdsState()
  const [draft] = useDraft()
  const [filter, setFilter] = useState<Filter>('all')
  const [walletOpen, setWalletOpen] = useState(false)
  // Campaign stays set after closing so the sheet can animate out with its content.
  const [sheetCampaign, setSheetCampaign] = useState<Campaign>()
  const [budgetAction, setBudgetActionState] = useState<BudgetAction | null>(null)
  const setBudgetAction = ({ campaign, action }: { campaign: Campaign; action: BudgetAction }) => {
    setSheetCampaign(campaign)
    setBudgetActionState(action)
  }

  const totals = useMemo(
    () =>
      campaigns.reduce(
        (t, c) => {
          const isSale = c.objective === 'customers' || c.objective === 'product'
          return {
            spend: t.spend + c.spend,
            reach: t.reach + c.reach,
            customers: t.customers + (isSale ? c.results : 0),
            revenue: t.revenue + c.revenue,
          }
        },
        { spend: 0, reach: 0, customers: 0, revenue: 0 },
      ),
    [campaigns],
  )

  const recs = useMemo(
    () => campaigns.flatMap(recommend).filter((r) => !dismissed.includes(r.id)),
    [campaigns, dismissed],
  )

  const attention = campaigns.filter((c) => c.status === 'rejected' || c.status === 'failed')
  const visible = campaigns.filter((c) => !filterMatch[filter] || filterMatch[filter]!.includes(c.status))
  const committed = campaigns
    .filter((c) => ['running', 'in_review', 'processing', 'paused'].includes(c.status))
    .reduce((t, c) => t + Math.max(0, c.paid - c.spend), 0)
  const hasDraft = !!draft.objective && !loading

  const onRec = (rec: Recommendation, which: 'primary' | 'secondary') => {
    const c = campaigns.find((x) => x.id === rec.campaignId)
    if (!c) return
    const action = which === 'primary' ? rec.primary.action : rec.secondary!.action
    if (action === 'increase_budget') setBudgetAction({ campaign: c, action: { kind: 'increase', amount: rec.primary.amount } })
    else if (action === 'extend') setBudgetAction({ campaign: c, action: { kind: 'extend', days: 3 } })
    else if (action === 'insights') navigate(`/ads/campaigns/${c.id}`)
    else {
      adsService.dismissRecommendation(rec.id)
      toast('Okay, we’ll leave it as it is.', 'info')
    }
  }

  return (
    <div className="q-screen">
      <header className="ad-home__top">
        <div>
          <span className="ad-home__eyebrow">Ads</span>
          <h1>Grow your business with ads</h1>
          <p>Reach more customers on the apps they use every day.</p>
        </div>
      </header>

      <section className="ad-hero">
        <div className="ad-hero__logos" aria-hidden="true">
          <span className="ad-hero__logo ad-hero__logo--ig" />
          <span className="ad-hero__logo ad-hero__logo--fb" />
          <span className="ad-hero__logo ad-hero__logo--tt" />
          <span className="ad-hero__logo ad-hero__logo--sc" />
        </div>
        <p className="ad-hero__lead">Instagram, Facebook, TikTok and Snapchat. One place, no ad accounts needed.</p>
        <button type="button" className="ad-hero__cta" onClick={startNewAd}>
          <Icon name="plus" size={20} strokeWidth={2.4} />
          Create an ad
        </button>
      </section>

      {hasDraft && (
        <button type="button" className="ad-draft" onClick={() => navigate('/ads/create/1')}>
          <span className="ad-draft__icon">
            <Icon name="pencil" size={18} />
          </span>
          <span>
            <strong>Finish your ad</strong>
            <span>
              {draft.promoted?.name ?? goals[draft.objective!].title} · not launched yet
            </span>
          </span>
          <Icon name="chevron-right" size={18} />
        </button>
      )}

      <div className="ad-quick">
        <button type="button" onClick={() => setWalletOpen(true)}>
          <Icon name="wallet" />
          <span>Ad balance</span>
          <strong className="num">{formatNairaCompact(balance)}</strong>
        </button>
        <button type="button" onClick={() => navigate('/ads/insights')}>
          <Icon name="pie" />
          <span>Insights</span>
        </button>
        <button type="button" onClick={() => navigate('/ads/accounts')}>
          <Icon name="link" />
          <span>Ad accounts</span>
        </button>
      </div>

      {(loading || campaigns.length > 0) && (
        <>
          <SectionLabel icon="calendar">Last 30 days</SectionLabel>
          <div className="ad-metrics">
            {loading ? (
              [0, 1, 2, 3].map((i) => <MetricSkeleton key={i} />)
            ) : (
              <>
                <MetricCard label="Total spent" value={formatNaira(totals.spend)} icon="coins" />
                <MetricCard label="People reached" value={formatCount(totals.reach)} icon="users" />
                <MetricCard label="Customers" value={formatCount(totals.customers)} icon="cart" tone="green" />
                <MetricCard label="Sales" value={formatNairaCompact(totals.revenue)} icon="trend" tone="yellow" />
              </>
            )}
          </div>
        </>
      )}

      {!loading && attention.length > 0 && (
        <button type="button" className="ad-alert" onClick={() => setFilter('attention')}>
          <Icon name="alert" size={20} />
          <span>
            <strong>
              {attention.length} {attention.length === 1 ? 'ad needs' : 'ads need'} your attention
            </strong>
            <span>We’ll explain what happened and how to fix it.</span>
          </span>
          <Icon name="chevron-right" size={18} />
        </button>
      )}

      {!loading && recs.length > 0 && (
        <>
          <SectionLabel icon="sparkle">Suggestions for you</SectionLabel>
          <div className="ad-recs">
            {recs.slice(0, 3).map((r) => (
              <AIRecommendationCard
                key={r.id}
                rec={r}
                onAction={onRec}
                onDismiss={() => adsService.dismissRecommendation(r.id)}
              />
            ))}
          </div>
        </>
      )}

      <SectionLabel
        icon="ads"
        action={
          campaigns.length > 0 && (
            <button type="button" className="q-link" onClick={startNewAd}>
              New ad <Icon name="plus" size={16} />
            </button>
          )
        }
      >
        Your campaigns
      </SectionLabel>

      {loading ? (
        <div className="ad-list">
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          body="Your next customer could come from here. Set up your first ad in about three minutes."
          action={
            <button type="button" className="q-btn q-btn--primary" onClick={startNewAd}>
              Create your first ad
            </button>
          }
        />
      ) : (
        <>
          <div className="ad-filters" role="tablist" aria-label="Filter campaigns">
            {(Object.keys(filterLabels) as Filter[]).map((f) => {
              const n = f === 'all' ? campaigns.length : campaigns.filter((c) => filterMatch[f]!.includes(c.status)).length
              if (f !== 'all' && n === 0) return null
              return (
                <button key={f} type="button" role="tab" aria-selected={filter === f} className={`q-chip ${filter === f ? 'is-on' : ''}`} onClick={() => setFilter(f)}>
                  {filterLabels[f]} <span className="num ad-filters__n">{n}</span>
                </button>
              )
            })}
          </div>
          <div className="ad-list">
            {visible.map((c) => (
              <CampaignCard key={c.id} campaign={c} onOpen={() => navigate(`/ads/campaigns/${c.id}`)} />
            ))}
            {visible.length === 0 && <p className="ad-muted ad-center-text">Nothing here right now.</p>}
          </div>
        </>
      )}

      <BottomSheet open={walletOpen} onClose={() => setWalletOpen(false)} title="Ad balance">
        <div className="ad-wallet">
          <span>Available to spend</span>
          <strong className="num">{formatNaira(balance)}</strong>
          <span className="ad-muted">Your Qart balance pays for ads. No separate top-up needed.</span>
        </div>
        <dl className="ad-pay">
          <div>
            <dt>Committed to running ads</dt>
            <dd className="num">{formatNaira(committed)}</dd>
          </div>
          <div>
            <dt>Spent in the last 30 days</dt>
            <dd className="num">{formatNaira(totals.spend)}</dd>
          </div>
          <div>
            <dt>Refunded from ended ads</dt>
            <dd className="num">{formatNaira(2150)}</dd>
          </div>
        </dl>
        <p className="q-hint" style={{ marginTop: 12 }}>
          When a campaign ends or is stopped, unspent budget returns to your Qart balance within 24 hours.
        </p>
      </BottomSheet>

      <BudgetActionSheet campaign={sheetCampaign} action={budgetAction} onClose={() => setBudgetActionState(null)} />
    </div>
  )
}
