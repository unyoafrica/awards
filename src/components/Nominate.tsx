import { nominate } from '../content'
import { Photo } from './Photo'
import { Arrow } from './Arrow'
import './Nominate.css'

export function Nominate() {
  const [statusA, ...statusRest] = nominate.status.split(' ')

  return (
    <section className="nominate grain" id="nominate" aria-labelledby="nominate-title">
      <div className="wrap nominate__grid">
        <h2 id="nominate-title" className="nominate__title" data-reveal="lines">
          <span className="line-mask">
            <span>{nominate.heading}</span>
          </span>
        </h2>

        <Photo shot="nominate" parallax className="nominate__photo" />

        <div className="nominate__status" data-reveal="fade">
          <p className="nominate__status-text">
            <span>{statusA}</span> <span>{statusRest.join(' ')}</span>
          </p>
          <ul className="nominate__routes">
            {nominate.routes.map((r) => (
              <li key={r.title}>
                <h3>{r.title}</h3>
                <p>{r.detail}</p>
              </li>
            ))}
          </ul>
          <a className="btn btn--ink" href="nominate.html">
            {nominate.cta}
            <Arrow />
          </a>
        </div>
      </div>

      <div className="nominate__prepare wrap" id="prepare">
        <header className="nominate__prepare-head">
          <h3 className="nominate__prepare-title">{nominate.checklistHeading}</h3>
          <p>{nominate.checklistIntro}</p>
        </header>
        <ol className="checklist" data-reveal="stagger">
          {nominate.checklist.map((item, i) => (
            <li key={item.key} className="checklist__item">
              <p className="checklist__key meta">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <span aria-hidden="true">/</span>
                <span>{item.key}</span>
              </p>
              <h4 className="checklist__title">{item.title}</h4>
              <p className="checklist__detail">{item.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
