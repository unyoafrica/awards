import { useState } from 'react'
import { culture } from '../content'
import { getShot, type ShotKey } from '../images'
import { Photo } from './Photo'
import './Culture.css'

export function Culture() {
  const [active, setActive] = useState(0)
  const tone = getShot(culture.areas[active].image as ShotKey).tone

  return (
    <section className={`culture grain culture--${tone}`} aria-labelledby="culture-title">
      <div className="wrap culture__grid">
        <header className="culture__head">
          <h2 id="culture-title" className="culture__title" data-reveal="lines">
            <span className="line-mask">
              <span>{culture.heading}</span>
            </span>
          </h2>
          <p className="culture__intro" data-reveal="fade">
            {culture.intro}
          </p>
        </header>

        <ul className="culture__list" data-reveal="stagger">
          {culture.areas.map((area, i) => (
            <li key={area.title} className={i === active ? 'is-active' : undefined}>
              <button
                type="button"
                className="culture__item"
                aria-pressed={i === active}
                aria-controls="culture-preview"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <span className="culture__item-title">{area.title}</span>
              </button>
              <Photo shot={area.image as ShotKey} className="culture__inline-photo" />
            </li>
          ))}
        </ul>

        <div className="culture__preview" id="culture-preview">
          {culture.areas.map((area, i) => (
            <div key={area.title} className="culture__frame" data-active={i === active} aria-hidden={i !== active}>
              <Photo shot={area.image as ShotKey} preload />
            </div>
          ))}
          <p className="culture__caption meta" aria-hidden="true">
            {culture.areas[active].title}
          </p>
        </div>
      </div>
    </section>
  )
}
