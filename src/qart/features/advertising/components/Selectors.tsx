import { useRef, type ReactNode } from 'react'
import type { ChannelId, GoalId, Product } from '../types'
import { Icon } from '../../../ui/Icon'
import { haptic } from '../../../ui/feedback'
import { goals } from '../utils/copy'
import { formatNaira } from '../utils/format'
import { productArt } from '../data/productArt'
import { channelLabels } from '../services/platforms'
import { ChannelLogo } from './PlatformLogo'

/** Large selectable card. Radio or checkbox semantics depending on `multi`. */
export function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  body,
  badge,
  multi = false,
  children,
}: {
  selected: boolean
  onSelect: () => void
  icon?: ReactNode
  title: string
  body?: ReactNode
  badge?: ReactNode
  multi?: boolean
  children?: ReactNode
}) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      className={`ad-option ${selected ? 'is-on' : ''}`}
      onClick={() => {
        haptic()
        onSelect()
      }}
    >
      {icon && <span className="ad-option__icon">{icon}</span>}
      <span className="ad-option__text">
        <span className="ad-option__title">
          {title}
          {badge}
        </span>
        {body && <span className="ad-option__body">{body}</span>}
        {children}
      </span>
      <span className={`ad-option__check ${multi ? 'is-box' : ''}`} aria-hidden="true">
        {selected && <Icon name="check" size={14} strokeWidth={2.6} />}
      </span>
    </button>
  )
}

export function GoalCard({ goal, selected, onSelect }: { goal: GoalId; selected: boolean; onSelect: () => void }) {
  const g = goals[goal]
  return (
    <OptionCard
      selected={selected}
      onSelect={onSelect}
      icon={<Icon name={g.icon} size={24} />}
      title={g.title}
      body={g.body}
      badge={goal === 'customers' ? <span className="ad-pill ad-pill--yellow">Popular</span> : undefined}
    />
  )
}

export function ProductSelector({
  products,
  selectedId,
  onSelect,
}: {
  products: Product[]
  selectedId?: string
  onSelect: (p: Product) => void
}) {
  return (
    <div className="ad-products" role="radiogroup" aria-label="Your products">
      {products.map((p) => {
        const out = p.stock === 0
        const on = selectedId === p.id
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={on}
            className={`ad-product ${on ? 'is-on' : ''}`}
            onClick={() => {
              haptic()
              onSelect(p)
            }}
          >
            <span className="ad-product__img">
              <img src={productArt[p.art]} alt="" />
              {on && (
                <span className="ad-product__tick" aria-hidden="true">
                  <Icon name="check" size={14} strokeWidth={2.6} />
                </span>
              )}
            </span>
            <span className="ad-product__name">{p.name}</span>
            <span className="ad-product__price num">{formatNaira(p.price)}</span>
            <span className={`ad-stock ${out ? 'is-out' : p.stock <= 5 ? 'is-low' : ''}`}>
              {out ? 'Out of stock' : p.stock <= 5 ? `Only ${p.stock} left` : 'In stock'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const channelNotes: Record<ChannelId, string> = {
  instagram: 'Feed, Stories and Reels',
  facebook: 'News Feed and Marketplace',
  tiktok: 'For You feed',
  snapchat: 'Between Stories',
}

export function PlatformSelector({
  value,
  onToggle,
  recommended,
}: {
  value: ChannelId[]
  onToggle: (c: ChannelId) => void
  recommended: ChannelId[]
}) {
  const all: ChannelId[] = ['instagram', 'facebook', 'tiktok', 'snapchat']
  return (
    <div className="ad-stack" role="group" aria-label="Where your ad appears">
      {all.map((c) => (
        <OptionCard
          key={c}
          multi
          selected={value.includes(c)}
          onSelect={() => onToggle(c)}
          icon={<ChannelLogo channel={c} size={36} />}
          title={channelLabels[c]}
          body={channelNotes[c]}
          badge={recommended.includes(c) ? <span className="ad-pill ad-pill--good">Recommended</span> : undefined}
        />
      ))}
    </div>
  )
}

export function BudgetSelector({
  presets,
  value,
  onChange,
  suffix,
}: {
  presets: number[]
  value: number
  onChange: (n: number) => void
  suffix: string
}) {
  const custom = !presets.includes(value)
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className="ad-budget">
      <div className="ad-budget__amount">
        <span aria-hidden="true">₦</span>
        <input
          ref={input}
          className="num"
          inputMode="numeric"
          aria-label={`Budget ${suffix}`}
          value={value ? value.toLocaleString('en-NG') : ''}
          onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '').slice(0, 8)) || 0)}
        />
        <span className="ad-budget__suffix">{suffix}</span>
      </div>
      <div className="ad-budget__presets">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={value === p}
            className={`q-chip ${value === p ? 'is-on' : ''}`}
            onClick={() => {
              haptic()
              onChange(p)
            }}
          >
            {formatNaira(p)}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={custom}
          className={`q-chip ${custom ? 'is-on' : ''}`}
          onClick={() => {
            input.current?.focus()
            input.current?.select()
          }}
        >
          Custom
        </button>
      </div>
    </div>
  )
}
