import { manifesto } from '../content'
import { Photo } from './Photo'
import './Manifesto.css'

export function Manifesto() {
  const [rooted, built] = manifesto.lines
  return (
    <section className="manifesto" aria-labelledby="manifesto-title">
      <div className="wrap">
        <h2 id="manifesto-title" className="manifesto__title" data-reveal="lines">
          <span className="line-mask manifesto__a">
            <span>{rooted}</span>
          </span>
          <span className="line-mask manifesto__b">
            <span>{built}</span>
          </span>
        </h2>
      </div>

      <Photo shot="manifesto" parallax className="manifesto__photo" />

      <div className="manifesto__body wrap">
        <blockquote className="manifesto__statement" data-reveal="fade">
          <p>{manifesto.statement}</p>
        </blockquote>
        <div className="manifesto__copy" data-reveal="fade">
          {manifesto.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
