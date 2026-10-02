import { award, prize } from '../content'
import { Photo } from './Photo'
import './Award.css'

export function Award() {
  return (
    <section className="award" id="award" aria-labelledby="award-title">
      <div className="wrap">
        <header className="award__head">
          <h2 id="award-title" className="award__title" data-reveal="lines">
            <span className="line-mask">
              <span>{prize.heading}</span>
            </span>
          </h2>
          <p className="award__intro" data-reveal="fade">
            {prize.intro}
          </p>
        </header>

        <figure className="award__grant" data-reveal="fade">
          <p className="award__amount" aria-label={`${award.grant} ${award.grantLabel.toLowerCase()}`}>
            <span aria-hidden="true">{award.grant}</span>
          </p>
          <figcaption className="award__grant-caption">
            <span className="meta">{award.grantLabel}</span>
            <span className="meta">
              {award.shortName}, {award.year}
            </span>
          </figcaption>
        </figure>

        <div className="award__kit">
          <Photo shot="award-plaque" className="award__plaque" />
          <ul className="award__items" data-reveal="stagger">
            {prize.items.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="award__stage grain">
        <div className="wrap award__stage-inner" data-reveal="fade">
          <p className="award__stage-label meta">{prize.presentation.label}</p>
          <p className="award__stage-forum">{prize.presentation.forum}</p>
          <dl className="award__stage-facts">
            <div>
              <dt className="visually-hidden">Date</dt>
              <dd>{prize.presentation.date}</dd>
            </div>
            <div>
              <dt className="visually-hidden">City</dt>
              <dd>{prize.presentation.city}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
