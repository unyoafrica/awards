import { useState } from 'react'
import type { PlatformId } from '../types'
import { back } from '../../../app/router'
import { Icon } from '../../../ui/Icon'
import { BottomSheet, ScreenHeader } from '../../../ui/primitives'
import { toast } from '../../../ui/feedback'
import { ChannelLogo } from '../components/PlatformLogo'
import { platformAdapters } from '../services/platforms'
import { joinList } from '../utils/format'
import { channelLabels } from '../services/platforms'

/**
 * By default Qart runs ads through its own managed accounts, so merchants never
 * need a Business Manager. Connecting their own account is optional.
 */
export function AccountsScreen() {
  const [own, setOwn] = useState<Record<PlatformId, string | null>>({ meta: null, tiktok: null, snapchat: null })
  const [connecting, setConnecting] = useState<PlatformId | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <div className="q-screen">
      <ScreenHeader title="Ad accounts" onBack={() => back('/ads')} />
      <div className="ad-tip">
        <Icon name="shield" size={18} />
        <div>
          <strong>You don’t need your own ad accounts</strong>
          <span>Qart publishes your ads through Qart’s verified business accounts and handles billing, so you can launch straight away.</span>
        </div>
      </div>

      <ul className="ad-accounts">
        {(Object.keys(platformAdapters) as PlatformId[]).map((p) => {
          const a = platformAdapters[p]
          const mine = own[p]
          return (
            <li key={p}>
              <ChannelLogo channel={p} size={40} />
              <div>
                <strong>{a.name}</strong>
                <span>{joinList(a.channels.map((c) => channelLabels[c]))}</span>
                <span className={`ad-pill ${mine ? 'ad-pill--good' : 'ad-pill--neutral'}`}>{mine ? `Your account · ${mine}` : 'Managed by Qart'}</span>
              </div>
              {mine ? (
                <button
                  type="button"
                  className="q-btn q-btn--ghost q-btn--sm"
                  onClick={() => {
                    setOwn((o) => ({ ...o, [p]: null }))
                    toast(`${a.name} switched back to Qart’s account`, 'info')
                  }}
                >
                  Disconnect
                </button>
              ) : (
                <button type="button" className="q-btn q-btn--soft q-btn--sm" onClick={() => setConnecting(p)}>
                  Connect mine
                </button>
              )}
            </li>
          )
        })}
      </ul>
      <p className="q-hint" style={{ marginTop: 12 }}>
        Connect your own account if you already advertise there and want results to show in your own {joinList(['Meta', 'TikTok', 'Snapchat'])}{' '}
        dashboards too. Your Qart campaigns keep working either way.
      </p>

      <BottomSheet
        open={!!connecting}
        onClose={() => setConnecting(null)}
        title={connecting ? `Connect your ${platformAdapters[connecting].name} account` : ''}
        footer={
          <button
            type="button"
            className="q-btn q-btn--primary"
            disabled={busy}
            onClick={async () => {
              if (!connecting) return
              setBusy(true)
              await new Promise((r) => setTimeout(r, 1200))
              setOwn((o) => ({ ...o, [connecting]: 'Dalmont Store' }))
              setBusy(false)
              toast(`${platformAdapters[connecting].name} connected`)
              setConnecting(null)
            }}
          >
            {busy ? 'Connecting…' : `Continue to ${connecting ? platformAdapters[connecting].name : ''}`}
          </button>
        }
      >
        <ul className="ad-checklist">
          <li>
            <Icon name="check" size={16} /> You’ll sign in on {connecting ? platformAdapters[connecting].name : ''} and come straight back here.
          </li>
          <li>
            <Icon name="check" size={16} /> Qart can create and manage ads. We never post to your page without you.
          </li>
          <li>
            <Icon name="check" size={16} /> You can disconnect any time.
          </li>
        </ul>
      </BottomSheet>
    </div>
  )
}
