import { useMemo, useState, type ReactNode } from 'react'
import type { AgeBand, CampaignDraft, ChannelId, GoalId, PromotedKind } from '../types'
import { useDraft, draftStore } from '../hooks/useDraft'
import { navigate } from '../../../app/router'
import { Icon } from '../../../ui/Icon'
import { BottomSheet, Chip, Segmented } from '../../../ui/primitives'
import { haptic, toast } from '../../../ui/feedback'
import { StepIndicator } from '../components/StepIndicator'
import { GoalCard, OptionCard, PlatformSelector, ProductSelector, BudgetSelector } from '../components/Selectors'
import { CreativeUploader } from '../components/CreativeUploader'
import { CreativePreview, CreativeCanvas } from '../components/CreativePreview'
import { ChannelLogo } from '../components/PlatformLogo'
import { products } from '../data/seed'
import { amountDue } from '../services/adsService'
import { productArt } from '../data/productArt'
import { channelLabels, platformAdapters, platformLabels, platformsFor } from '../services/platforms'
import { ageBands, citiesByState, describeAudience, goalOrder, goals, interestOptions, nigerianStates } from '../utils/copy'
import { estimate, fees, totalAmount, dailyAmount } from '../utils/estimates'
import { formatCount, formatNaira, formatRangeCount, joinList } from '../utils/format'

const STEPS = [
  'Your goal',
  'What you’re advertising',
  'Your ad',
  'Where it appears',
  'Who sees it',
  'Your budget',
  'Review',
] as const

export function CreateAdScreen({ step, fromReview }: { step: number; fromReview: boolean }) {
  const [draft, update] = useDraft()
  const [leaving, setLeaving] = useState(false)
  const s = Math.min(Math.max(step, 1), STEPS.length)
  const ready = stepReady(s, draft)
  const editingId = draftStore.editingId()
  // A fixed ad whose budget is already paid goes straight back to review.
  const resubmitFree = !!editingId && amountDue(draft, editingId) === 0

  const go = (n: number) => navigate(`/ads/create/${n}`)
  const next = () => {
    haptic()
    // Arrive at the platform step with Qart's recommendation already ticked.
    if (s === 3 && draft.channels.length === 0) update({ channels: recommendChannels(draft) })
    if (fromReview && s < 7) navigate('/ads/create/7', { replace: true })
    else if (s < 7) go(s + 1)
    else if (resubmitFree) navigate('/ads/create/launch', { replace: true })
    else navigate('/ads/create/pay')
  }
  const back = () => (s > 1 ? window.history.back() : setLeaving(true))

  return (
    <div className="q-screen q-screen--flow">
      <header className="q-header">
        <button type="button" className="q-icon-btn" onClick={back} aria-label={s > 1 ? 'Previous step' : 'Leave ad setup'}>
          <Icon name="chevron-left" />
        </button>
        <div className="q-header__title">
          <h1>{draftStore.editingId() ? 'Fix your ad' : 'Create an ad'}</h1>
        </div>
        <button type="button" className="q-icon-btn" onClick={() => setLeaving(true)} aria-label="Close">
          <Icon name="close" size={20} />
        </button>
      </header>

      <StepIndicator step={s} total={STEPS.length} label={STEPS[s - 1]} />

      <div className="ad-step" key={s}>
        {s === 1 && <GoalStep draft={draft} update={update} />}
        {s === 2 && <PromoteStep draft={draft} update={update} />}
        {s === 3 && <CreativeStep draft={draft} update={update} />}
        {s === 4 && <PlatformStep draft={draft} update={update} />}
        {s === 5 && <AudienceStep draft={draft} update={update} />}
        {s === 6 && <BudgetStep draft={draft} update={update} />}
        {s === 7 && <ReviewStep draft={draft} update={update} />}
      </div>

      <div className="q-actionbar">
        {!ready.ok && ready.why && (
          <p className="ad-why" role="status">
            {ready.why}
          </p>
        )}
        {s === 7 ? (
          <>
            <button type="button" className="q-btn q-btn--ghost" onClick={() => go(1)}>
              Edit
            </button>
            <button type="button" className="q-btn q-btn--primary" onClick={next} disabled={!ready.ok}>
              {resubmitFree ? 'Resubmit ad' : 'Launch ad'}
              <Icon name="chevron-right" size={18} />
            </button>
          </>
        ) : (
          <button type="button" className="q-btn q-btn--primary" onClick={next} disabled={!ready.ok}>
            {fromReview ? 'Save and review' : 'Continue'}
          </button>
        )}
      </div>

      <BottomSheet
        open={leaving}
        onClose={() => setLeaving(false)}
        title="Leave ad setup?"
        footer={
          <>
            <button
              type="button"
              className="q-btn q-btn--ghost"
              onClick={() => {
                draftStore.reset()
                setLeaving(false)
                navigate('/ads', { replace: true })
              }}
            >
              Discard
            </button>
            <button
              type="button"
              className="q-btn q-btn--dark"
              onClick={() => {
                setLeaving(false)
                navigate('/ads', { replace: true })
                toast('Draft saved. Pick up where you left off any time.', 'info')
              }}
            >
              Save draft
            </button>
          </>
        }
      >
        <p className="ad-muted">Nothing has been charged. We’ll keep your progress so you can finish later.</p>
      </BottomSheet>
    </div>
  )
}

/* ------------------------------------------------------------------ */

type StepProps = { draft: CampaignDraft; update: ReturnType<typeof useDraft>[1] }

function StepTitle({ title, sub }: { title: string; sub?: ReactNode }) {
  return (
    <div className="ad-step__title">
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  )
}

function minDaily(channels: ChannelId[]) {
  return Math.max(1000, ...platformsFor(channels).map((p) => platformAdapters[p].minDailyBudget))
}

function stepReady(step: number, d: CampaignDraft): { ok: boolean; why?: string } {
  switch (step) {
    case 1:
      return { ok: !!d.objective }
    case 2:
      if (!d.promoted) return { ok: false }
      if ((d.promoted.kind === 'service' || d.promoted.kind === 'custom') && !d.promoted.name.trim())
        return { ok: false, why: 'Give it a name so we can write your ad.' }
      return { ok: true }
    case 3:
      if (d.creative.media.length === 0) return { ok: false, why: 'Add at least one photo or video.' }
      if (!d.creative.primaryText.trim()) return { ok: false, why: 'Add some text for your ad, or let AI write it.' }
      return { ok: true }
    case 4:
      return { ok: d.channels.length > 0, why: d.channels.length ? undefined : 'Pick at least one place to show your ad.' }
    case 5:
      if (d.audience.mode === 'manual' && d.audience.ages.length === 0) return { ok: false, why: 'Pick at least one age group.' }
      return { ok: true }
    case 6: {
      const min = minDaily(d.channels)
      if (dailyAmount(d.budget) < min)
        return { ok: false, why: `The smallest budget for these platforms is ${formatNaira(min)} a day.` }
      return { ok: d.budget.durationDays >= 1 }
    }
    case 7:
      return [1, 2, 3, 4, 5, 6].every((n) => stepReady(n, d).ok) ? { ok: true } : { ok: false, why: 'A step above needs attention.' }
  }
  return { ok: false }
}

/* Step 1 ------------------------------------------------------------ */

function GoalStep({ draft, update }: StepProps) {
  return (
    <>
      <StepTitle title="What do you want to achieve?" sub="Pick one. Qart sets up the rest for you." />
      <div className="ad-stack" role="radiogroup" aria-label="Advertising goal">
        {goalOrder.map((g: GoalId) => (
          <GoalCard key={g} goal={g} selected={draft.objective === g} onSelect={() => update({ objective: g })} />
        ))}
      </div>
    </>
  )
}

/* Step 2 ------------------------------------------------------------ */

function PromoteStep({ draft, update }: StepProps) {
  const kind: PromotedKind = draft.promoted?.kind ?? 'product'
  const [tab, setTab] = useState<PromotedKind>(kind)
  const choose = (k: PromotedKind) => {
    setTab(k)
    if (k === 'storefront') update({ promoted: { kind: 'storefront', name: 'Dalmont Store', art: 'storefront', url: 'qart.shop/dalmont' } })
    else if (k !== draft.promoted?.kind) update({ promoted: k === 'product' ? undefined : { kind: k, name: '' } })
  }
  return (
    <>
      <StepTitle title="What are you advertising?" sub="Choose from your Qart store, or describe it yourself." />
      <div className="ad-kinds" role="tablist" aria-label="Type">
        {(
          [
            ['product', 'Product', 'products'],
            ['storefront', 'Storefront', 'store'],
            ['service', 'Service', 'briefcase'],
            ['custom', 'Custom', 'pencil'],
          ] as const
        ).map(([k, label, icon]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => choose(k)}>
            <Icon name={icon} size={20} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'product' && (
        <>
          <ProductSelector
            products={products}
            selectedId={draft.promoted?.productId}
            onSelect={(p) => {
              update((d) => ({
                ...d,
                promoted: { kind: 'product', productId: p.id, name: p.name, price: p.price, art: p.art },
                name: d.name || `${p.name} ad`,
                // Start the creative with the product photo so step 3 isn't empty.
                creative: d.creative.media.length
                  ? d.creative
                  : { ...d.creative, media: [{ id: `m-${p.art}`, type: 'image', url: productArt[p.art], art: p.art, name: p.name }] },
              }))
              if (p.stock === 0) toast('This product is out of stock. Restock it before people start ordering.', 'info')
            }}
          />
        </>
      )}

      {tab === 'storefront' && (
        <div className="ad-storefront">
          <img src={productArt.storefront} alt="" />
          <div>
            <strong>Dalmont Store</strong>
            <span>qart.shop/dalmont · 6 products</span>
          </div>
          <span className="ad-option__check" aria-hidden="true">
            <Icon name="check" size={14} strokeWidth={2.6} />
          </span>
        </div>
      )}

      {(tab === 'service' || tab === 'custom') && (
        <div className="ad-stack">
          <label className="q-field">
            <span>{tab === 'service' ? 'What service do you offer?' : 'What are you promoting?'}</span>
            <input
              className="q-input"
              value={draft.promoted?.name ?? ''}
              placeholder={tab === 'service' ? 'e.g. Home delivery across Lagos' : 'e.g. Our Christmas pop-up in Lekki'}
              onChange={(e) => update((d) => ({ ...d, promoted: { kind: tab, name: e.target.value }, name: e.target.value }))}
            />
          </label>
          {tab === 'service' && (
            <label className="q-field">
              <span>Starting price (optional)</span>
              <input
                className="q-input num"
                inputMode="numeric"
                placeholder="₦"
                value={draft.promoted?.price ? draft.promoted.price.toLocaleString('en-NG') : ''}
                onChange={(e) =>
                  update((d) => ({
                    ...d,
                    promoted: { kind: 'service', name: d.promoted?.name ?? '', price: Number(e.target.value.replace(/\D/g, '')) || undefined },
                  }))
                }
              />
            </label>
          )}
          {tab === 'custom' && (
            <label className="q-field">
              <span>Link people should visit (optional)</span>
              <input
                className="q-input"
                type="url"
                inputMode="url"
                placeholder="qart.shop/dalmont"
                value={draft.promoted?.url ?? ''}
                onChange={(e) => update((d) => ({ ...d, promoted: { kind: 'custom', name: d.promoted?.name ?? '', url: e.target.value } }))}
              />
            </label>
          )}
        </div>
      )}
    </>
  )
}

/* Step 3 ------------------------------------------------------------ */

function CreativeStep({ draft, update }: StepProps) {
  return (
    <>
      <StepTitle title="Create your ad" sub="Add a photo or video and a few words. Qart AI can help with both." />
      <CreativeUploader draft={draft} update={(fn) => update(fn)} />
      <div className="ad-sub">
        <h3>Preview</h3>
        <CreativePreview creative={draft.creative} channels={draft.channels} />
      </div>
    </>
  )
}

/* Step 4 ------------------------------------------------------------ */

function recommendChannels(d: CampaignDraft): ChannelId[] {
  if (d.objective === 'messages') return ['instagram', 'facebook']
  return ['instagram', 'facebook', 'tiktok']
}

function PlatformStep({ draft, update }: StepProps) {
  const rec = recommendChannels(draft)
  const toggle = (c: ChannelId) =>
    update((d) => ({ ...d, channels: d.channels.includes(c) ? d.channels.filter((x) => x !== c) : [...d.channels, c] }))
  const recPlatforms = joinList(platformsFor(rec).map((p) => platformLabels[p]))
  return (
    <>
      <StepTitle title="Where do you want your ad to appear?" sub="Pick as many as you like. You manage them all here in Qart." />
      <div className="ad-tip">
        <Icon name="sparkle" size={18} />
        <div>
          <strong>We recommend {recPlatforms} for your business.</strong>
          <span>
            {draft.objective === 'messages'
              ? 'People reply quickest on Instagram and Facebook, and messages arrive straight in your inbox.'
              : 'Shoppers in Nigeria discover fashion and lifestyle products on Instagram and TikTok.'}
          </span>
          {rec.some((c) => !draft.channels.includes(c)) && (
            <button type="button" className="q-link" onClick={() => update({ channels: rec })}>
              Use recommendation
            </button>
          )}
        </div>
      </div>
      <PlatformSelector value={draft.channels} onToggle={toggle} recommended={rec} />
    </>
  )
}

/* Step 5 ------------------------------------------------------------ */

function AudienceStep({ draft, update }: StepProps) {
  const a = draft.audience
  const set = (patch: Partial<CampaignDraft['audience']>) => update((d) => ({ ...d, audience: { ...d.audience, ...patch } }))
  const [query, setQuery] = useState('')
  const matches = useMemo(
    () => interestOptions.filter((i) => !a.interests.includes(i) && i.toLowerCase().includes(query.toLowerCase())).slice(0, 8),
    [query, a.interests],
  )

  return (
    <>
      <StepTitle title="Who do you want to reach?" />
      <div className="ad-stack" role="radiogroup" aria-label="Audience">
        <OptionCard
          selected={a.mode === 'auto'}
          onSelect={() => set({ mode: 'auto' })}
          icon={<Icon name="sparkle" size={24} />}
          title="Let Qart find customers"
          badge={<span className="ad-pill ad-pill--good">Recommended</span>}
          body="Qart finds people likely to buy, based on your product, location and what has worked for similar shops."
        />
        <OptionCard
          selected={a.mode === 'manual'}
          onSelect={() => set({ mode: 'manual' })}
          icon={<Icon name="users" size={24} />}
          title="Choose my audience"
          body="Set the age, gender and interests yourself."
        />
      </div>

      <section className="ad-sub">
        <h3>
          <Icon name="location" size={18} /> Location
        </h3>
        <div className="ad-grid-2">
          <label className="q-field">
            <span>State</span>
            <select
              className="q-select"
              value={a.state}
              onChange={(e) => set({ state: e.target.value, city: citiesByState[e.target.value]?.[0] ?? e.target.value })}
            >
              {nigerianStates.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="q-field">
            <span>City or area</span>
            <select className="q-select" value={a.city} onChange={(e) => set({ city: e.target.value })}>
              {(citiesByState[a.state] ?? [a.state]).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="q-field">
          <span>
            Within <strong className="num">{a.radiusKm} km</strong> of {a.city}
          </span>
          <input
            type="range"
            className="ad-slider"
            min={5}
            max={80}
            step={5}
            value={a.radiusKm}
            onChange={(e) => set({ radiusKm: Number(e.target.value) })}
            style={{ ['--fill' as string]: `${((a.radiusKm - 5) / 75) * 100}%` }}
          />
        </label>
      </section>

      {a.mode === 'manual' && (
        <>
          <section className="ad-sub">
            <h3>Age</h3>
            <div className="ad-chips">
              {ageBands.map((b: AgeBand) => (
                <Chip
                  key={b}
                  on={a.ages.includes(b)}
                  onClick={() => set({ ages: a.ages.includes(b) ? a.ages.filter((x) => x !== b) : [...a.ages, b] })}
                >
                  {b}
                </Chip>
              ))}
            </div>
          </section>
          <section className="ad-sub">
            <h3>Gender</h3>
            <Segmented
              label="Gender"
              value={a.gender}
              onChange={(g) => set({ gender: g })}
              options={[
                { value: 'all', label: 'All' },
                { value: 'men', label: 'Men' },
                { value: 'women', label: 'Women' },
              ]}
            />
          </section>
          <section className="ad-sub">
            <h3>
              Interests <span className="ad-muted">(optional)</span>
            </h3>
            {a.interests.length > 0 && (
              <div className="ad-chips" style={{ marginBottom: 12 }}>
                {a.interests.map((i) => (
                  <Chip key={i} on onClick={() => set({ interests: a.interests.filter((x) => x !== i) })}>
                    {i}
                  </Chip>
                ))}
              </div>
            )}
            <div className="ad-search">
              <Icon name="search" size={18} />
              <input
                className="q-input"
                placeholder="Search interests, e.g. fashion"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search interests"
              />
            </div>
            <div className="ad-chips" style={{ marginTop: 12 }}>
              {matches.map((i) => (
                <button
                  key={i}
                  type="button"
                  className="q-chip"
                  onClick={() => {
                    haptic()
                    set({ interests: [...a.interests, i] })
                    setQuery('')
                  }}
                >
                  <Icon name="plus" size={14} /> {i}
                </button>
              ))}
              {matches.length === 0 && <span className="ad-muted">No matches. Try another word.</span>}
            </div>
          </section>
        </>
      )}

      <div className="ad-summary-line">
        <Icon name="users" size={18} />
        {describeAudience(a)}
      </div>
    </>
  )
}

/* Step 6 ------------------------------------------------------------ */

const presetsDaily = [5000, 10000, 25000, 50000]
const presetsTotal = [25000, 50000, 100000, 250000]
const durations = [3, 7, 14, 30]

export function EstimateCard({ draft }: { draft: CampaignDraft }) {
  const e = estimate(draft.objective ?? 'customers', draft.channels, draft.audience, draft.budget)
  return (
    <div className="ad-estimate">
      <div className="ad-estimate__row">
        <div>
          <span>Estimated daily reach</span>
          <strong className="num">{formatRangeCount(e.dailyReach)}</strong>
          <span>people</span>
        </div>
        <div>
          <span>Estimated {e.resultLabel}</span>
          <strong className="num">{formatRangeCount(e.results)}</strong>
          <span>over {draft.budget.durationDays} days</span>
        </div>
      </div>
      <p className="ad-estimate__note">
        <Icon name="info" size={14} /> Estimates are based on similar campaigns and may vary. Platforms control delivery, so results aren’t guaranteed.
      </p>
    </div>
  )
}

function BudgetStep({ draft, update }: StepProps) {
  const b = draft.budget
  const set = (patch: Partial<CampaignDraft['budget']>) => update((d) => ({ ...d, budget: { ...d.budget, ...patch } }))
  const total = totalAmount(b)
  const min = minDaily(draft.channels)
  return (
    <>
      <StepTitle title="How much do you want to spend?" sub="You only pay what you set here. Pause or stop any time." />
      <Segmented
        label="Budget type"
        value={b.type}
        onChange={(t) =>
          set(t === 'daily' ? { type: 'daily', amount: Math.max(min, Math.round(total / b.durationDays / 500) * 500) } : { type: 'total', amount: total })
        }
        options={[
          { value: 'daily', label: 'Daily budget' },
          { value: 'total', label: 'Campaign budget' },
        ]}
      />
      <BudgetSelector
        presets={b.type === 'daily' ? presetsDaily : presetsTotal}
        value={b.amount}
        onChange={(n) => set({ amount: n })}
        suffix={b.type === 'daily' ? '/ day' : 'total'}
      />
      <p className="q-hint">Minimum {formatNaira(min)} a day for the platforms you picked.</p>

      <section className="ad-sub">
        <h3>How long should it run?</h3>
        <div className="ad-chips">
          {durations.map((n) => (
            <Chip key={n} on={b.durationDays === n} onClick={() => set({ durationDays: n })}>
              {n} days
            </Chip>
          ))}
          <div className="ad-stepper">
            <button type="button" aria-label="One day less" onClick={() => set({ durationDays: Math.max(1, b.durationDays - 1) })}>
              <Icon name="minus" size={16} />
            </button>
            <span className="num">{b.durationDays}d</span>
            <button type="button" aria-label="One day more" onClick={() => set({ durationDays: Math.min(90, b.durationDays + 1) })}>
              <Icon name="plus" size={16} />
            </button>
          </div>
        </div>
      </section>

      <div className="ad-total">
        <span>You’ll spend at most</span>
        <strong className="num">{formatNaira(total)}</strong>
        <span className="num">
          {b.type === 'daily'
            ? `${formatNaira(b.amount)} a day for ${b.durationDays} days`
            : `About ${formatNaira(total / b.durationDays)} a day for ${b.durationDays} days`}
        </span>
      </div>

      <EstimateCard draft={draft} />
    </>
  )
}

/* Step 7 ------------------------------------------------------------ */

function ReviewStep({ draft, update }: StepProps) {
  const total = totalAmount(draft.budget)
  const e = estimate(draft.objective ?? 'customers', draft.channels, draft.audience, draft.budget)
  const edit = (n: number) => navigate(`/ads/create/${n}?from=review`)
  const rows: [string, ReactNode, number][] = [
    ['Goal', draft.objective ? goals[draft.objective].title : '—', 1],
    [
      draft.promoted?.kind === 'product' ? 'Product' : 'Promoting',
      draft.promoted ? `${draft.promoted.name}${draft.promoted.price ? ` · ${formatNaira(draft.promoted.price)}` : ''}` : '—',
      2,
    ],
    [
      'Platforms',
      <span key="channels" className="ad-review__channels">
        {draft.channels.map((c) => (
          <ChannelLogo key={c} channel={c} size={18} />
        ))}
        {joinList(draft.channels.map((c) => channelLabels[c]))}
      </span>,
      4,
    ],
    ['Audience', describeAudience(draft.audience), 5],
    ['Budget', draft.budget.type === 'daily' ? `${formatNaira(draft.budget.amount)} a day` : `${formatNaira(total)} total`, 6],
    ['Duration', `${draft.budget.durationDays} days`, 6],
    ['Estimated reach', `${formatRangeCount(e.totalReach)} people`, 6],
  ]
  return (
    <>
      <StepTitle title="Review your ad" sub="Check everything looks right. You can change any part." />
      <label className="q-field ad-review__name">
        <span>Campaign name</span>
        <input className="q-input" value={draft.name} placeholder="e.g. Summer Collection" onChange={(ev) => update({ name: ev.target.value })} />
        <span className="q-hint">Only you see this.</span>
      </label>

      <div className="ad-review__creative">
        <div className="ad-review__thumb">
          <CreativeCanvas creative={draft.creative} />
        </div>
        <div>
          <strong>{draft.creative.headline || 'No headline'}</strong>
          <p>{draft.creative.primaryText}</p>
          <button type="button" className="q-link" onClick={() => edit(3)}>
            Edit ad <Icon name="chevron-right" size={16} />
          </button>
        </div>
      </div>

      <dl className="ad-review">
        {rows.map(([k, v, n]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
            <button type="button" className="ad-review__edit" onClick={() => edit(n)} aria-label={`Edit ${k.toLowerCase()}`}>
              <Icon name="pencil" size={16} />
            </button>
          </div>
        ))}
      </dl>

      <div className="ad-review__money">
        <div>
          <span>Total to pay</span>
          <strong className="num">{formatNaira(fees(total).total)}</strong>
        </div>
        <p>
          {formatNaira(total)} budget plus a {formatNaira(fees(total).total - total)} Qart fee. You’ll see the full breakdown before
          paying. Unspent budget comes back to your Qart balance.
        </p>
      </div>

      <div className="ad-tip ad-tip--plain">
        <Icon name="shield" size={18} />
        <div>
          <strong>What happens after you launch</strong>
          <span>
            {joinList(platformsFor(draft.channels).map((p) => platformLabels[p]))} review every ad before it goes live, usually within a
            few hours. We’ll tell you the moment it’s approved, or explain what to change if it isn’t.
          </span>
        </div>
      </div>
      <p className="q-hint" style={{ textAlign: 'center', marginTop: 8 }}>
        About {formatCount(e.dailyReach[0])}–{formatCount(e.dailyReach[1])} people a day · estimates may vary
      </p>
    </>
  )
}
