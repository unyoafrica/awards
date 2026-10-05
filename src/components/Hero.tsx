import { award, hero } from '../content'
import trophy from '../assets/hero-trophy.webp'
import { Arrow } from './Arrow'
import './Hero.css'

export function Hero() {
  return (
    <section className="hero grain" id="top" aria-labelledby="hero-title">
      <div className="hero__grid wrap">
        <p className="hero__rail meta" data-hero-fade>
          <span>{award.edition}</span>
          <span className="hero__rail-year">{award.year}</span>
        </p>

        <p className="hero__slogan" aria-label={hero.lines.join(' ')}>
          {hero.lines.map((line, i) => (
            <span key={line} className={`line-mask hero__line hero__line--${i + 1}`} data-hero-line aria-hidden="true">
              <span>{line}</span>
            </span>
          ))}
        </p>

        <div className="hero__media" data-hero-media>
          <img
            className="hero__trophy"
            src={trophy}
            alt="The Cultural Tourism Impact Award 2026: an Africa-shaped wooden award bearing the Únyọ logo, on a plinth engraved ‘Recognising cultural impact’"
            width="900"
            height="1166"
            fetchPriority="high"
          />
        </div>

        <div className="hero__intro">
          <h1 id="hero-title" className="hero__title" data-hero-fade>
            {award.name}
          </h1>
          <p className="hero__lede" data-hero-fade>
            {hero.intro}
          </p>
          <div className="hero__actions" data-hero-fade>
            <a className="btn btn--gold" href="nominate.html">
              {hero.primaryCta}
              <Arrow />
            </a>
            <a className="btn btn--ghost" href="#award">
              {hero.secondaryCta}
            </a>
          </div>
          <p className="hero__note" data-hero-fade>
            {hero.note}
          </p>
        </div>

        <dl className="hero__facts" data-hero-fade>
          <div>
            <dt className="meta">Winner receives</dt>
            <dd>
              {award.grant} development support grant
              <span className="hero__facts-extra">+ Award plaque + Certificate of recognition</span>
            </dd>
          </div>
          <div>
            <dt className="meta">Presented</dt>
            <dd>{award.date}</dd>
          </div>
          <div>
            <dt className="meta">Where</dt>
            <dd>{award.city}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
