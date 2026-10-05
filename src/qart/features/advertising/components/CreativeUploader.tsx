import { useRef, useState } from 'react'
import type { CallToAction, CampaignDraft, CreativeMedia, CreativeTemplate } from '../types'
import { Icon } from '../../../ui/Icon'
import { BottomSheet } from '../../../ui/primitives'
import { haptic, toast } from '../../../ui/feedback'
import { MediaThumb } from './MediaThumb'
import { productArt } from '../data/productArt'
import { products } from '../data/seed'
import { aiService, type AdCopy } from '../services/aiService'

const MAX_MEDIA = 5
const ctas: CallToAction[] = ['Shop now', 'Order now', 'Send message', 'Learn more', 'Visit store']

const uid = () => Math.random().toString(36).slice(2, 10)

/** Downscale photos to 1080px JPEG so drafts and campaigns stay small enough to store. */
async function toStoredImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const scale = Math.min(1, 1080 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.82)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function CreativeUploader({
  draft,
  update,
}: {
  draft: CampaignDraft
  update: (fn: (d: CampaignDraft) => CampaignDraft) => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [picker, setPicker] = useState(false)
  const [designing, setDesigning] = useState(false)
  const media = draft.creative.media

  const setMedia = (next: CreativeMedia[]) => update((d) => ({ ...d, creative: { ...d.creative, media: next } }))

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    const room = MAX_MEDIA - media.length
    const list = [...files].slice(0, room)
    const added: CreativeMedia[] = []
    for (const f of list) {
      if (f.type.startsWith('video/')) {
        if (f.size > 200 * 1024 * 1024) {
          toast('That video is over 200 MB. Try a shorter clip.', 'bad')
          continue
        }
        added.push({ id: uid(), type: 'video', url: URL.createObjectURL(f), name: f.name })
      } else if (f.type.startsWith('image/')) {
        try {
          added.push({ id: uid(), type: 'image', url: await toStoredImage(f), name: f.name })
        } catch {
          toast(`We couldn’t open ${f.name}. Try a JPG or PNG.`, 'bad')
        }
      }
    }
    if (files.length > room) toast(`You can add up to ${MAX_MEDIA} photos or videos.`, 'info')
    if (added.length) {
      setMedia([...media, ...added])
      haptic()
    }
  }

  const productImages = products.map((p) => ({ key: p.art, name: p.name }))

  return (
    <div className="ad-stack">
      <div className="ad-uploader">
        {media.length > 0 && (
          <ul className="ad-uploader__grid">
            {media.map((m, i) => (
              <li key={m.id}>
                <MediaThumb media={m} alt={m.name ?? `Image ${i + 1}`} />
                {m.type === 'video' && (
                  <span className="ad-uploader__tag">
                    <Icon name="video" size={12} /> Video
                  </span>
                )}
                <button
                  type="button"
                  className="ad-uploader__remove"
                  aria-label={`Remove ${m.name ?? `item ${i + 1}`}`}
                  onClick={() => setMedia(media.filter((x) => x.id !== m.id))}
                >
                  <Icon name="close" size={14} strokeWidth={2.4} />
                </button>
              </li>
            ))}
            {media.length < MAX_MEDIA && (
              <li>
                <button type="button" className="ad-uploader__add" onClick={() => fileInput.current?.click()}>
                  <Icon name="plus" />
                  <span>Add</span>
                </button>
              </li>
            )}
          </ul>
        )}

        {media.length === 0 && (
          <button type="button" className="ad-uploader__drop" onClick={() => fileInput.current?.click()}>
            <span className="ad-uploader__dropicon">
              <Icon name="upload" size={24} />
            </span>
            <strong>Upload photos or a video</strong>
            <span>JPG, PNG or MP4 · up to {MAX_MEDIA} files</span>
          </button>
        )}

        <input
          ref={fileInput}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => {
            onFiles(e.target.files)
            e.target.value = ''
          }}
        />

        <div className="ad-uploader__actions">
          <button type="button" className="q-btn q-btn--ghost q-btn--sm" onClick={() => setPicker(true)}>
            <Icon name="products" size={18} /> Product photos
          </button>
          <button type="button" className="q-btn q-btn--soft q-btn--sm" onClick={() => setDesigning(true)}>
            <Icon name="sparkle" size={18} /> Design with AI
          </button>
        </div>
      </div>

      <CopyEditor draft={draft} update={update} />

      <BottomSheet open={picker} onClose={() => setPicker(false)} title="Choose from your products">
        <div className="ad-products ad-products--compact">
          {productImages.map((p) => {
            const on = media.some((m) => m.art === p.key)
            return (
              <button
                key={p.key}
                type="button"
                aria-pressed={on}
                className={`ad-product ${on ? 'is-on' : ''}`}
                onClick={() => {
                  haptic()
                  if (on) setMedia(media.filter((m) => m.art !== p.key))
                  else if (media.length < MAX_MEDIA)
                    setMedia([...media, { id: uid(), type: 'image', url: productArt[p.key], art: p.key, name: p.name }])
                }}
              >
                <span className="ad-product__img">
                  <img src={productArt[p.key]} alt="" />
                  {on && (
                    <span className="ad-product__tick" aria-hidden="true">
                      <Icon name="check" size={14} strokeWidth={2.6} />
                    </span>
                  )}
                </span>
                <span className="ad-product__name">{p.name}</span>
              </button>
            )
          })}
        </div>
      </BottomSheet>

      <DesignSheet open={designing} onClose={() => setDesigning(false)} draft={draft} update={update} />
    </div>
  )
}

function CopyEditor({
  draft,
  update,
}: {
  draft: CampaignDraft
  update: (fn: (d: CampaignDraft) => CampaignDraft) => void
}) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [options, setOptions] = useState<AdCopy[]>([])
  const c = draft.creative
  const setCopy = (patch: Partial<typeof c>) => update((d) => ({ ...d, creative: { ...d.creative, ...patch } }))

  async function generate() {
    setBusy(true)
    setOptions([])
    try {
      setOptions(await aiService.generateCopy(prompt || `Promote my ${draft.promoted?.name ?? 'store'}`, draft.objective ?? 'customers', draft.promoted))
    } catch {
      toast('Qart AI is busy right now. Try again in a moment.', 'bad')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ad-copy">
      <div className="ad-copy__head">
        <h3>Ad text</h3>
        <button
          type="button"
          className="q-btn q-btn--soft q-btn--sm"
          onClick={() => {
            setPrompt(draft.promoted ? `Promote my ${draft.promoted.name.toLowerCase()}` : '')
            setOpen(true)
          }}
        >
          <Icon name="sparkle" size={16} /> Write with AI
        </button>
      </div>
      <label className="q-field">
        <span>Headline</span>
        <input
          className="q-input"
          value={c.headline}
          maxLength={40}
          placeholder="e.g. New season. New energy."
          onChange={(e) => setCopy({ headline: e.target.value })}
        />
        <span className="q-hint num">{c.headline.length}/40</span>
      </label>
      <label className="q-field">
        <span>Main text</span>
        <textarea
          className="q-textarea"
          value={c.primaryText}
          maxLength={500}
          placeholder="Tell people what makes this special and what to do next."
          onChange={(e) => setCopy({ primaryText: e.target.value })}
        />
        <span className="q-hint num">{c.primaryText.length}/500</span>
      </label>
      <div className="q-field">
        <span>Button</span>
        <div className="ad-chips" role="radiogroup" aria-label="Button text">
          {ctas.map((x) => (
            <button
              key={x}
              type="button"
              role="radio"
              aria-checked={c.callToAction === x}
              className={`q-chip ${c.callToAction === x ? 'is-on' : ''}`}
              onClick={() => setCopy({ callToAction: x })}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Write with AI">
        <div className="ad-stack">
          <label className="q-field">
            <span>What should the ad say?</span>
            <textarea
              className="q-textarea"
              value={prompt}
              placeholder="e.g. Promote my new brown cargo shorts"
              onChange={(e) => setPrompt(e.target.value)}
            />
          </label>
          <button type="button" className="q-btn q-btn--dark q-btn--block" onClick={generate} disabled={busy}>
            <Icon name="sparkle" size={18} />
            {busy ? 'Writing…' : options.length ? 'Write again' : 'Write my ad'}
          </button>
          {busy && (
            <div className="ad-stack" aria-hidden="true">
              {[0, 1].map((i) => (
                <div key={i} className="ad-ai-option">
                  <span className="q-skel" style={{ height: 16, width: '55%', borderRadius: 8 }} />
                  <span className="q-skel" style={{ height: 12, borderRadius: 6, marginTop: 10 }} />
                  <span className="q-skel" style={{ height: 12, width: '80%', borderRadius: 6, marginTop: 6 }} />
                </div>
              ))}
            </div>
          )}
          {options.map((o, i) => (
            <button
              key={i}
              type="button"
              className="ad-ai-option"
              onClick={() => {
                haptic()
                setCopy({ headline: o.headline, primaryText: o.primaryText })
                setOpen(false)
                toast('Added to your ad. You can edit it any time.')
              }}
            >
              <strong>{o.headline}</strong>
              <span>{o.primaryText}</span>
              <span className="ad-ai-option__use">Use this</span>
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}

const templates: { id: CreativeTemplate; name: string; note: string }[] = [
  { id: 'clean', name: 'Clean', note: 'Your photo with a soft caption' },
  { id: 'bold', name: 'Bold', note: 'Big headline, brand colours' },
  { id: 'sale', name: 'Offer', note: 'Built for discounts and promos' },
]

function DesignSheet({
  open,
  onClose,
  draft,
  update,
}: {
  open: boolean
  onClose: () => void
  draft: CampaignDraft
  update: (fn: (d: CampaignDraft) => CampaignDraft) => void
}) {
  const [busy, setBusy] = useState<CreativeTemplate | null>(null)

  async function apply(t: CreativeTemplate) {
    setBusy(t)
    let headline = draft.creative.headline
    let primaryText = draft.creative.primaryText
    if (!headline) {
      const [first] = await aiService.generateCopy(`Promote my ${draft.promoted?.name ?? 'store'}`, draft.objective ?? 'customers', draft.promoted)
      headline = first.headline
      primaryText = primaryText || first.primaryText
    } else {
      await new Promise((r) => setTimeout(r, 700))
    }
    const art = draft.promoted?.art ?? 'storefront'
    update((d) => ({
      ...d,
      creative: {
        ...d.creative,
        headline,
        primaryText,
        template: t,
        media: d.creative.media.length
          ? d.creative.media
          : [{ id: uid(), type: 'image', url: productArt[art], art, name: d.promoted?.name }],
      },
    }))
    setBusy(null)
    onClose()
    toast('Your ad design is ready')
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Design with AI">
      <p className="ad-muted" style={{ marginBottom: 14 }}>
        Qart lays out your photo and headline for you. Pick a style.
      </p>
      <div className="ad-stack">
        {templates.map((t) => (
          <button key={t.id} type="button" className="ad-template" onClick={() => apply(t.id)} disabled={busy !== null}>
            <span className={`ad-template__swatch ad-template__swatch--${t.id}`} aria-hidden="true">
              Aa
            </span>
            <span>
              <strong>{t.name}</strong>
              <span>{t.note}</span>
            </span>
            {busy === t.id ? <span className="ad-spinner" aria-label="Designing" /> : <Icon name="chevron-right" size={18} />}
          </button>
        ))}
        {draft.creative.template && (
          <button
            type="button"
            className="q-btn q-btn--ghost q-btn--block"
            onClick={() => {
              update((d) => ({ ...d, creative: { ...d.creative, template: undefined } }))
              onClose()
            }}
          >
            Use my photo as it is
          </button>
        )}
      </div>
    </BottomSheet>
  )
}
