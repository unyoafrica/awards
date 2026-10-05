import { useState } from 'react'
import { navigate } from '../../app/router'
import { Icon } from '../../ui/Icon'
import { toast } from '../../ui/feedback'
import { adsStore } from '../advertising'
import './home.css'

interface Row {
  icon: string
  label: string
  to?: string
  tag?: string
  run?: () => void
}

const sections: { title: string; rows: Row[] }[] = [
  {
    title: 'Marketing',
    rows: [
      { icon: 'ads', label: 'Ads', to: '/ads', tag: 'New' },
      { icon: 'megaphone', label: 'Broadcast' },
      { icon: 'trophy', label: 'Milestones & Goals' },
    ],
  },
  {
    title: 'Operations',
    rows: [
      { icon: 'truck', label: 'Logistics' },
      { icon: 'user-plus', label: 'Staff Account' },
      { icon: 'clock', label: 'Open and Close Time' },
      { icon: 'location', label: 'Locations' },
      { icon: 'shield', label: 'Membership' },
      { icon: 'wallet', label: 'Wallet' },
    ],
  },
  {
    title: 'Prototype data',
    rows: [
      {
        icon: 'refresh',
        label: 'Reset ads demo data',
        run: () => {
          adsStore.reset()
          toast('Demo campaigns restored')
        },
      },
      {
        icon: 'trash',
        label: 'Start with no campaigns',
        run: () => {
          adsStore.reset(true)
          toast('Cleared. Open Ads to see the first-time experience.', 'info')
        },
      },
    ],
  },
]

export function MoreScreen() {
  const [open, setOpen] = useState<Record<string, boolean>>({ Marketing: true, Operations: true, 'Prototype data': true })
  return (
    <div className="q-screen more">
      <header className="q-header">
        <span className="q-header__spacer" />
        <div className="q-header__title">
          <h1>More Services</h1>
        </div>
        <span className="home__avatar home__avatar--sm" aria-hidden="true">
          D
        </span>
      </header>

      <button type="button" className="more__upgrade" onClick={() => toast('Plans are outside this prototype', 'info')}>
        <Icon name="trophy" size={30} />
        <span>
          <strong>Upgrade to Premium plan</strong>
          <span>Unlock the full benefit of Qart</span>
        </span>
        <Icon name="chevron-right" />
      </button>

      {sections.map((s) => (
        <section key={s.title} className="more__section">
          <button
            type="button"
            className="more__title"
            aria-expanded={open[s.title]}
            onClick={() => setOpen((o) => ({ ...o, [s.title]: !o[s.title] }))}
          >
            {s.title}
            <Icon name="chevron-down" size={20} style={{ transform: open[s.title] ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} />
          </button>
          {open[s.title] && (
            <ul>
              {s.rows.map((r) => (
                <li key={r.label}>
                  <button
                    type="button"
                    className="more__row"
                    onClick={() => (r.run ? r.run() : r.to ? navigate(r.to) : toast(`${r.label} is outside this prototype`, 'info'))}
                  >
                    <span className="more__icon">
                      <Icon name={r.icon} />
                    </span>
                    <span className="more__label">
                      {r.label}
                      {r.tag && <span className="home__tag home__tag--inline">{r.tag}</span>}
                    </span>
                    <Icon name="chevron-right" size={20} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

export function PlaceholderScreen({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="q-screen">
      <header className="q-header">
        <span className="q-header__spacer" />
        <div className="q-header__title">
          <h1>{title}</h1>
        </div>
        <span className="q-header__spacer" />
      </header>
      <div className="placeholder">
        <Icon name={icon} size={36} />
        <p>{title} works as it does in the Qart app today. This prototype covers Ads.</p>
        <button type="button" className="q-btn q-btn--soft" onClick={() => navigate('/ads')}>
          Go to Ads
        </button>
      </div>
    </div>
  )
}
