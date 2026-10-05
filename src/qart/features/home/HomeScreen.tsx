import { useState } from 'react'
import { navigate } from '../../app/router'
import { Icon } from '../../ui/Icon'
import { SectionLabel } from '../../ui/primitives'
import { toast } from '../../ui/feedback'
import { useAdsState, startNewAd } from '../advertising'
import './home.css'

const quick: { icon: string; label: string; to?: string; tag?: string }[] = [
  { icon: 'products', label: 'Add product', to: '/products' },
  { icon: 'ads', label: 'Run ads', to: '/ads', tag: 'New' },
  { icon: 'bike', label: 'Logistics' },
  { icon: 'headset', label: 'Support' },
  { icon: 'megaphone', label: 'Broadcast' },
  { icon: 'pie', label: 'Insights' },
  { icon: 'coins', label: 'Loans' },
  { icon: 'ledger', label: 'Credit ledger' },
]

const naira = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function HomeScreen() {
  const { balance, campaigns } = useAdsState()
  const [hidden, setHidden] = useState(false)
  const running = campaigns.filter((c) => c.status === 'running')
  const weekReach = running.reduce((t, c) => t + c.daily.slice(-7).reduce((s, d) => s + d.reach, 0), 0)
  const weekResults = running.reduce((t, c) => t + c.daily.slice(-7).reduce((s, d) => s + d.results, 0), 0)

  return (
    <div className="q-screen home">
      <header className="home__top">
        <div className="home__avatar" aria-hidden="true">
          D<span className="home__plan-dot" />
        </div>
        <div className="home__hello">
          <strong>
            Hi, dalmont <Icon name="chevron-down" size={18} strokeWidth={2.4} />
          </strong>
          <span>Qart Basic</span>
        </div>
        <button type="button" className="home__bell" aria-label="Notifications, 9 unread">
          <Icon name="bell" />
          <span className="home__badge">9</span>
        </button>
      </header>

      <div className="home__pair">
        <button type="button" className="q-btn q-btn--soft" onClick={() => toast('Opening qart.shop/dalmont', 'info')}>
          Visit store <Icon name="store" size={20} />
        </button>
        <button
          type="button"
          className="q-btn q-btn--soft"
          onClick={() => {
            navigator.clipboard?.writeText('https://qart.shop/dalmont').catch(() => undefined)
            toast('Store link copied')
          }}
        >
          Share link <Icon name="link" size={20} />
        </button>
      </div>

      <div className="home__pair home__pair--plain">
        <button type="button" className="home__pill">
          <Icon name="store" size={20} />
          All locations
          <Icon name="chevron-down" size={18} />
        </button>
        <button type="button" className="home__pill">
          <Icon name="clock" size={20} />
          Closed
          <Icon name="chevron-right" size={18} />
        </button>
      </div>

      <section className="home__wallet">
        <span className="home__currency">
          <span aria-hidden="true">🇳🇬</span> Nigerian Naira <Icon name="chevron-down" size={16} />
        </span>
        <div className="home__amount">
          <strong className="num">{hidden ? '₦ ••••••' : naira(balance)}</strong>
          <button type="button" onClick={() => setHidden((h) => !h)} aria-label={hidden ? 'Show balance' : 'Hide balance'}>
            <Icon name="eye" size={24} />
          </button>
        </div>
        <div className="home__wallet-art" aria-hidden="true" />
      </section>

      <SectionLabel icon="bolt">Quick actions</SectionLabel>
      <div className="home__quick">
        {quick.map((q) => (
          <button
            key={q.label}
            type="button"
            className="home__tile"
            onClick={() => (q.to ? navigate(q.to) : toast(`${q.label} is outside this prototype`, 'info'))}
          >
            {q.tag && <span className="home__tag">{q.tag}</span>}
            <Icon name={q.icon} size={26} />
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {running.length > 0 ? (
        <button type="button" className="home__ads" onClick={() => navigate('/ads')}>
          <span className="home__ads-icon">
            <Icon name="ads" size={26} />
          </span>
          <span className="home__ads-text">
            <strong>
              {running.length} {running.length === 1 ? 'ad is' : 'ads are'} live
            </strong>
            <span className="num">
              {weekReach.toLocaleString('en-NG')} people reached and {weekResults} customers this week
            </span>
          </span>
          <Icon name="chevron-right" size={20} />
        </button>
      ) : (
        <div className="home__ads home__ads--promo">
          <span className="home__ads-icon">
            <Icon name="ads" size={26} />
          </span>
          <span className="home__ads-text">
            <strong>Get more customers with ads</strong>
            <span>Show your products on Instagram, TikTok and more.</span>
          </span>
          <button type="button" className="q-btn q-btn--primary q-btn--sm" onClick={startNewAd}>
            Start
          </button>
        </div>
      )}

      <SectionLabel
        icon="calendar"
        action={
          <button type="button" className="q-link">
            See all <Icon name="chevron-right" size={18} />
          </button>
        }
      >
        My business today
      </SectionLabel>
      <div className="home__today">
        <div className="home__stat">
          <span className="home__stat-icon">₦</span>
          <div>
            <span>Total sales</span>
            <strong className="num">₦48,500</strong>
          </div>
        </div>
        <div className="home__stat home__stat--warm">
          <span className="home__stat-icon">
            <Icon name="products" size={20} />
          </span>
          <div>
            <span>Total orders</span>
            <strong className="num">3</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
