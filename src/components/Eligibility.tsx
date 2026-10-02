import { eligibility } from '../content'
import type { ShotKey } from '../images'
import { Photo } from './Photo'
import './Eligibility.css'

export function Eligibility() {
  return (
    <section className="qualify" id="qualify" aria-labelledby="qualify-title">
      <div className="wrap qualify__grid">
        <header className="qualify__aside">
          <div className="qualify__sticky">
            <h2 id="qualify-title" className="qualify__title" data-reveal="lines">
              <span className="line-mask">
                <span>{eligibility.heading}</span>
              </span>
            </h2>
            <p className="qualify__intro" data-reveal="fade">
              {eligibility.intro}
            </p>
          </div>
        </header>

        <ol className="qualify__list">
          {eligibility.items.map((item, i) => (
            <li key={item.n} className={`qualify__item qualify__item--${i + 1}`}>
              <div className="qualify__text" data-reveal="stagger">
                <span className="qualify__n" aria-hidden="true">
                  {item.n}
                </span>
                <h3 className="qualify__item-title">{item.title}</h3>
                <p className="qualify__detail">{item.detail}</p>
              </div>
              <Photo shot={item.image as ShotKey} parallax className="qualify__photo" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
