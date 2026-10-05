import type { Recommendation } from '../utils/recommendations'
import { Icon } from '../../../ui/Icon'

export function AIRecommendationCard({
  rec,
  onAction,
  onDismiss,
}: {
  rec: Recommendation
  onAction: (rec: Recommendation, which: 'primary' | 'secondary') => void
  onDismiss: () => void
}) {
  return (
    <article className={`ad-rec ad-rec--${rec.tone}`}>
      <div className="ad-rec__head">
        <span className="ad-rec__badge">
          <Icon name="sparkle" size={14} />
          Qart suggests
        </span>
        <button type="button" className="ad-rec__close" onClick={onDismiss} aria-label="Dismiss suggestion">
          <Icon name="close" size={16} />
        </button>
      </div>
      <h3>{rec.title}</h3>
      <p>{rec.body}</p>
      <div className="ad-rec__actions">
        <button type="button" className="q-btn q-btn--dark q-btn--sm" onClick={() => onAction(rec, 'primary')}>
          {rec.primary.label}
        </button>
        {rec.secondary && (
          <button type="button" className="q-btn q-btn--ghost q-btn--sm" onClick={() => onAction(rec, 'secondary')}>
            {rec.secondary.label}
          </button>
        )}
      </div>
    </article>
  )
}
