import { impact } from '../content'
import './Impact.css'

export function Impact() {
  return (
    <section className="impact grain" aria-labelledby="impact-title" data-impact>
      <div className="wrap">
        <h2 id="impact-title" className="impact__compare">
          <span className="visually-hidden">{impact.statement}</span>
          <span className="impact__a" data-impact-a aria-hidden="true">
            {impact.a}
          </span>
          <span className="impact__sign" data-impact-sign aria-hidden="true">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="square">
              <path d="M18 14 82 50 18 86" />
            </svg>
          </span>
          <span className="impact__b" data-impact-b aria-hidden="true">
            {impact.b}
          </span>
        </h2>
        <p className="impact__detail" data-reveal="fade">
          {impact.detail}
        </p>
      </div>
    </section>
  )
}
