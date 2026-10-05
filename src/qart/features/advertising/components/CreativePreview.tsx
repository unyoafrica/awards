import { useState } from 'react'
import type { ChannelId, Creative } from '../types'
import { MediaThumb } from './MediaThumb'
import { ChannelLogo } from './PlatformLogo'
import { Icon } from '../../../ui/Icon'
import { haptic } from '../../../ui/feedback'

export type Placement = 'ig_feed' | 'fb_feed' | 'ig_story' | 'tiktok' | 'snap'

const placements: { id: Placement; label: string; channel: ChannelId }[] = [
  { id: 'ig_feed', label: 'Instagram Feed', channel: 'instagram' },
  { id: 'ig_story', label: 'Stories & Reels', channel: 'instagram' },
  { id: 'fb_feed', label: 'Facebook Feed', channel: 'facebook' },
  { id: 'tiktok', label: 'TikTok Feed', channel: 'tiktok' },
  { id: 'snap', label: 'Snap Ads', channel: 'snapchat' },
]

const BUSINESS = 'Dalmont Store'
const HANDLE = 'dalmont.store'

/** The creative itself: media, plus the AI-designed layout when one was chosen. */
export function CreativeCanvas({ creative, tall = false }: { creative: Creative; tall?: boolean }) {
  const [index, setIndex] = useState(0)
  const media = creative.media
  const current = media[Math.min(index, media.length - 1)]
  return (
    <div className={`ad-canvas ${tall ? 'ad-canvas--tall' : ''} ${creative.template ? `ad-canvas--${creative.template}` : ''}`}>
      {current ? (
        <MediaThumb media={current} alt={creative.headline || 'Ad image'} />
      ) : (
        <div className="ad-canvas__placeholder">
          <Icon name="image" size={30} />
          <span>Your photo or video</span>
        </div>
      )}
      {creative.template && creative.headline && (
        <div className="ad-canvas__overlay">
          {creative.template === 'sale' && <span className="ad-canvas__stamp">Limited offer</span>}
          <strong>{creative.headline}</strong>
          <span className="ad-canvas__brand">{BUSINESS}</span>
        </div>
      )}
      {media.length > 1 && (
        <>
          <div className="ad-canvas__dots" aria-hidden="true">
            {media.map((m, i) => (
              <span key={m.id} className={i === index ? 'is-on' : ''} />
            ))}
          </div>
          <button
            type="button"
            className="ad-canvas__next"
            aria-label="Next image"
            onClick={() => setIndex((i) => (i + 1) % media.length)}
          >
            <Icon name="chevron-right" size={16} />
          </button>
        </>
      )}
    </div>
  )
}

function Caption({ text, max = 90 }: { text: string; max?: number }) {
  const [open, setOpen] = useState(false)
  if (!text) return <span className="ad-pv__muted">Your ad text will appear here.</span>
  if (open || text.length <= max) return <>{text}</>
  return (
    <>
      {text.slice(0, max).trimEnd()}…{' '}
      <button type="button" className="ad-pv__more" onClick={() => setOpen(true)}>
        more
      </button>
    </>
  )
}

function Avatar({ size = 32 }: { size?: number }) {
  return (
    <span className="ad-pv__avatar" style={{ width: size, height: size }} aria-hidden="true">
      D
    </span>
  )
}

export function CreativePreview({ creative, channels }: { creative: Creative; channels: ChannelId[] }) {
  const available = placements.filter((p) => channels.length === 0 || channels.includes(p.channel))
  const [picked, setActive] = useState<Placement>(available[0]?.id ?? 'ig_feed')
  // Fall back to the first placement when the merchant deselects the picked one's platform.
  const active = available.some((p) => p.id === picked) ? picked : (available[0]?.id ?? 'ig_feed')

  const cta = creative.callToAction
  return (
    <div className="ad-preview">
      <div className="ad-preview__tabs" role="tablist" aria-label="Preview placement">
        {available.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={active === p.id}
            className={active === p.id ? 'is-on' : ''}
            onClick={() => {
              haptic()
              setActive(p.id)
            }}
          >
            <ChannelLogo channel={p.channel} size={18} />
            {p.label}
          </button>
        ))}
      </div>

      <div className="ad-preview__stage" role="tabpanel">
        {active === 'ig_feed' && (
          <div className="ad-pv ad-pv--ig">
            <div className="ad-pv__bar">
              <Avatar />
              <div>
                <strong>{HANDLE}</strong>
                <span>Sponsored</span>
              </div>
              <Icon name="more" size={20} strokeWidth={3} />
            </div>
            <CreativeCanvas creative={creative} />
            <div className="ad-pv__cta ad-pv__cta--ig">
              {cta}
              <Icon name="chevron-right" size={16} />
            </div>
            <div className="ad-pv__icons">
              <Icon name="heart" />
              <Icon name="comment" />
              <Icon name="send" />
              <Icon name="bookmark" style={{ marginLeft: 'auto' }} />
            </div>
            <p className="ad-pv__text">
              <strong>{HANDLE}</strong> <Caption text={creative.primaryText} />
            </p>
          </div>
        )}

        {active === 'fb_feed' && (
          <div className="ad-pv ad-pv--fb">
            <div className="ad-pv__bar">
              <Avatar size={36} />
              <div>
                <strong>{BUSINESS}</strong>
                <span>Sponsored · 🌐</span>
              </div>
              <Icon name="more" size={20} strokeWidth={3} />
            </div>
            <p className="ad-pv__text ad-pv__text--top">
              <Caption text={creative.primaryText} max={120} />
            </p>
            <CreativeCanvas creative={creative} />
            <div className="ad-pv__fbfoot">
              <div>
                <span>QART.SHOP</span>
                <strong>{creative.headline || 'Your headline'}</strong>
              </div>
              <span className="ad-pv__fbbtn">{cta}</span>
            </div>
          </div>
        )}

        {(active === 'ig_story' || active === 'tiktok' || active === 'snap') && (
          <div className={`ad-pv ad-pv--vertical ad-pv--${active}`}>
            <CreativeCanvas creative={creative} tall />
            <div className="ad-pv__shade" />
            {active === 'ig_story' && (
              <>
                <div className="ad-pv__progress">
                  <span />
                </div>
                <div className="ad-pv__vtop">
                  <Avatar size={28} />
                  <strong>{HANDLE}</strong>
                  <span>Sponsored</span>
                </div>
                <div className="ad-pv__vbottom">
                  <p>
                    <Caption text={creative.primaryText} max={70} />
                  </p>
                  <span className="ad-pv__swipe">
                    <Icon name="chevron-down" size={16} style={{ transform: 'rotate(180deg)' }} />
                    {cta}
                  </span>
                </div>
              </>
            )}
            {active === 'tiktok' && (
              <>
                <div className="ad-pv__rail" aria-hidden="true">
                  <Avatar size={40} />
                  <span>
                    <Icon name="heart" size={26} />
                    12.4K
                  </span>
                  <span>
                    <Icon name="comment" size={26} />
                    318
                  </span>
                  <span>
                    <Icon name="share" size={26} />
                    Share
                  </span>
                </div>
                <div className="ad-pv__vbottom ad-pv__vbottom--tt">
                  <strong>@{HANDLE}</strong>
                  <p>
                    <Caption text={creative.primaryText} max={80} />
                  </p>
                  <span className="ad-pv__sponsored">Sponsored</span>
                  <span className="ad-pv__ttbtn">{cta}</span>
                  <span className="ad-pv__music">
                    <Icon name="music" size={14} /> Promoted music
                  </span>
                </div>
              </>
            )}
            {active === 'snap' && (
              <>
                <div className="ad-pv__vtop">
                  <Avatar size={30} />
                  <div>
                    <strong>{BUSINESS}</strong>
                    <span>Ad</span>
                  </div>
                </div>
                <div className="ad-pv__vbottom ad-pv__vbottom--snap">
                  <strong className="ad-pv__snaphead">{creative.headline || 'Your headline'}</strong>
                  <span className="ad-pv__snapbtn">{cta}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <p className="ad-preview__note">
        <Icon name="eye" size={14} /> Qart preview. The final look may vary slightly on each app.
      </p>
    </div>
  )
}
