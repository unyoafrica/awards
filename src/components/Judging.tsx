import { judging } from '../content'
import './Judging.css'

export function Judging() {
  const total = judging.criteria.reduce((sum, c) => sum + c.weight, 0)

  return (
    <section className="judging" id="judging" aria-labelledby="judging-title">
      <div className="wrap">
        <header className="judging__head">
          <h2 id="judging-title" className="judging__title" data-reveal="lines">
            <span className="line-mask">
              <span>{judging.heading}</span>
            </span>
          </h2>
          <p className="judging__intro" data-reveal="fade">
            {judging.intro}
          </p>
        </header>

        {/* The whole score at a glance: six segments summing to 100%. */}
        <div className="judging__whole" aria-hidden="true">
          {judging.criteria.map((c, i) => (
            <span key={c.title} className={`judging__seg judging__seg--${i + 1}`} style={{ flexGrow: c.weight }} data-bar />
          ))}
        </div>
        <p className="judging__whole-label meta" aria-hidden="true">
          <span>Total score</span>
          <span>{total}%</span>
        </p>

        <ol className="judging__list">
          {judging.criteria.map((c, i) => (
            <li
              key={c.title}
              className={`judging__row judging__row--${i + 1}`}
              style={{ '--w': c.weight } as React.CSSProperties}
            >
              <p className="judging__weight" aria-hidden="true">
                <span data-count={c.weight}>{c.weight}</span>
                <span className="judging__pct">%</span>
              </p>
              <h3 className="judging__name">
                {c.title}
                <span className="visually-hidden">, {c.weight}% of the total score</span>
              </h3>
              <div className="judging__track" aria-hidden="true">
                <span className="judging__bar" data-bar />
              </div>
            </li>
          ))}
        </ol>
        <p className="judging__note" data-reveal="fade">
          {judging.juryNote}
        </p>
      </div>
    </section>
  )
}
