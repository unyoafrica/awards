import { useEffect, useRef, useState } from 'react'
import { useDraft, draftStore, checkout } from '../hooks/useDraft'
import { adsService, launchSteps, type LaunchError } from '../services/adsService'
import { navigate } from '../../../app/router'
import { Icon } from '../../../ui/Icon'
import { haptic } from '../../../ui/feedback'
import { ErrorState } from '../components/States'
import { totalAmount } from '../utils/estimates'
import { formatNaira, joinList } from '../utils/format'
import { platformLabels, platformsFor } from '../services/platforms'
import type { Campaign } from '../types'

type Phase = { kind: 'running'; step: string } | { kind: 'done'; campaign: Campaign } | { kind: 'error'; error: LaunchError }

export function LaunchScreen() {
  const [draft] = useDraft()
  const steps = launchSteps(draft)
  const [phase, setPhase] = useState<Phase>({ kind: 'running', step: steps[0].id })
  const [attempt, setAttempt] = useState(0)
  const started = useRef(-1)

  useEffect(() => {
    if (started.current === attempt) return
    started.current = attempt
    // Reloading this screen after a launch has nothing left to publish.
    if (!draft.objective) {
      navigate('/ads', { replace: true })
      return
    }
    adsService
      .launch(draft, checkout.method, (step) => setPhase({ kind: 'running', step }), draftStore.editingId())
      .then((res) => {
        if (res.ok) {
          haptic(20)
          setPhase({ kind: 'done', campaign: res.campaign })
          draftStore.reset()
        } else {
          setPhase({ kind: 'error', error: res.error })
        }
      })
  }, [attempt, draft])

  if (phase.kind === 'error') {
    return (
      <div className="q-screen ad-center">
        <ErrorState
          title={phase.error.title}
          body={phase.error.detail}
          primary={
            <button type="button" className="q-btn q-btn--primary q-btn--block" onClick={() => setAttempt((a) => a + 1)}>
              <Icon name="refresh" size={18} /> Try again
            </button>
          }
          secondary={
            <>
              <button type="button" className="q-btn q-btn--ghost q-btn--block" onClick={() => navigate('/ads/create/3', { replace: true })}>
                Edit my ad
              </button>
              <a className="q-link" href="mailto:support@qart.ng?subject=Ad%20didn%E2%80%99t%20publish">
                Contact support
              </a>
            </>
          }
        />
      </div>
    )
  }

  if (phase.kind === 'done') {
    const c = phase.campaign
    const budget = totalAmount(c.budget)
    const platforms = joinList(platformsFor(c.channels).map((p) => platformLabels[p]))
    return (
      <div className="q-screen ad-center ad-success">
        <div className="ad-success__mark" aria-hidden="true">
          <Icon name="check" size={40} strokeWidth={2.6} />
        </div>
        <h2>Your ad has been submitted</h2>
        <p className="ad-success__money">
          <strong className="num">{formatNaira(budget)}</strong> has been added to your campaign.
        </p>

        <ol className="ad-timeline" aria-label="What happens next">
          <li className="is-done">
            <span className="ad-timeline__dot">
              <Icon name="check" size={14} strokeWidth={2.6} />
            </span>
            <div>
              <strong>Submitted</strong>
              <span>Paid and sent to {platforms}</span>
            </div>
          </li>
          <li className="is-now">
            <span className="ad-timeline__dot" />
            <div>
              <strong>Under review</strong>
              <span>{platforms} check every ad. Usually a few hours, at most 24.</span>
            </div>
          </li>
          <li>
            <span className="ad-timeline__dot" />
            <div>
              <strong>Live</strong>
              <span>We’ll notify you as soon as people start seeing it.</span>
            </div>
          </li>
        </ol>

        <div className="ad-success__actions">
          <button type="button" className="q-btn q-btn--primary q-btn--block" onClick={() => navigate(`/ads/campaigns/${c.id}`, { replace: true })}>
            View campaign
          </button>
          <button type="button" className="q-btn q-btn--ghost q-btn--block" onClick={() => navigate('/ads', { replace: true })}>
            Back to Ads
          </button>
        </div>
      </div>
    )
  }

  const currentIndex = steps.findIndex((s) => s.id === phase.step)
  return (
    <div className="q-screen ad-center">
      <div className="ad-launch">
        <div className="ad-launch__orb" aria-hidden="true">
          <Icon name="ads" size={34} />
        </div>
        <h2>Launching your ad</h2>
        <p className="ad-muted">Please keep the app open. This takes a few seconds.</p>
        <ol className="ad-progress" aria-live="polite">
          {steps.map((s, i) => (
            <li key={s.id} className={i < currentIndex ? 'is-done' : i === currentIndex ? 'is-now' : ''}>
              <span className="ad-progress__icon">
                {i < currentIndex ? <Icon name="check" size={14} strokeWidth={2.6} /> : i === currentIndex ? <span className="ad-spinner" /> : null}
              </span>
              {s.label}
              {i === currentIndex ? '…' : ''}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
