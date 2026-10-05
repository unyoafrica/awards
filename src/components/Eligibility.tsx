import { eligibility } from '../content'
import './Eligibility.css'

export function Eligibility() {
  return (
    <section className="qualify" id="qualify" aria-labelledby="qualify-title">
      <div className="wrap">
        <h2 id="qualify-title" className="qualify__title" data-reveal="lines">
          <span className="line-mask">
            <span>{eligibility.heading}</span>
          </span>
        </h2>

        <ol className="qualify__list" data-reveal="stagger">
          {eligibility.items.map((item) => (
            <li key={item.n} className="qualify__item">
              <span className="qualify__n" aria-hidden="true">
                {item.n}
              </span>
              <h3 className="qualify__item-title">{item.title}</h3>
              <p className="qualify__detail">{item.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
