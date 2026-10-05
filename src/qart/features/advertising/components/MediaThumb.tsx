import type { CreativeMedia } from '../types'

/** Renders a creative's image or video, filling its box. */
export function MediaThumb({ media, alt = '', className = '' }: { media?: CreativeMedia; alt?: string; className?: string }) {
  if (!media) return <div className={`ad-media ad-media--empty ${className}`} aria-hidden="true" />
  if (media.type === 'video') {
    return <video className={`ad-media ${className}`} src={media.url} muted loop playsInline autoPlay aria-label={alt} />
  }
  return <img className={`ad-media ${className}`} src={media.url} alt={alt} draggable={false} />
}
