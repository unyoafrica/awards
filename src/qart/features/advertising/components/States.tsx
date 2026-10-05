import type { ReactNode } from 'react'
import { Icon } from '../../../ui/Icon'

export function EmptyState({
  title,
  body,
  action,
  art = 'megaphone',
}: {
  title: string
  body: string
  action?: ReactNode
  art?: string
}) {
  return (
    <div className="ad-empty">
      <div className="ad-empty__art" aria-hidden="true">
        <span className="ad-empty__ring" />
        <span className="ad-empty__icon">
          <Icon name={art} size={30} />
        </span>
        <span className="ad-empty__spark">
          <Icon name="sparkle" size={16} />
        </span>
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  )
}

/** Human-readable failure with a way forward. Raw platform errors never reach this component. */
export function ErrorState({
  title,
  body,
  primary,
  secondary,
}: {
  title: string
  body: string
  primary?: ReactNode
  secondary?: ReactNode
}) {
  return (
    <div className="ad-error" role="alert">
      <span className="ad-error__icon" aria-hidden="true">
        <Icon name="alert" size={26} />
      </span>
      <h3>{title}</h3>
      <p>{body}</p>
      <div className="ad-error__actions">
        {primary}
        {secondary}
      </div>
    </div>
  )
}
