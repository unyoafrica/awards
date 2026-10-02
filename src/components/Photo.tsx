import { getShot, type ShotKey } from '../images'
import './Photo.css'

type Props = {
  shot: ShotKey
  className?: string
  /** Eager-load images in the first viewport. */
  priority?: boolean
  /** Adds a low-amplitude scroll parallax to the image inside the frame. */
  parallax?: boolean
  /** Decorative images are hidden from assistive tech. */
  decorative?: boolean
}

export function Photo({ shot, className = '', priority, parallax, decorative }: Props) {
  const { src, alt, brief, tone, focus } = getShot(shot)

  return (
    <div className={`photo photo--${tone} grain ${className}`} data-photo>
      {src ? (
        <img
          src={src}
          alt={decorative ? '' : alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          style={focus ? { objectPosition: focus } : undefined}
          data-parallax={parallax ? '' : undefined}
        />
      ) : (
        <div
          className="photo__plate"
          role={decorative ? undefined : 'img'}
          aria-label={decorative ? undefined : alt}
          aria-hidden={decorative ? true : undefined}
          data-parallax={parallax ? '' : undefined}
        >
          <span className="photo__plate-label meta" aria-hidden="true">
            Photograph to come
          </span>
          <span className="photo__plate-brief" aria-hidden="true">
            {brief}
          </span>
        </div>
      )}
    </div>
  )
}
