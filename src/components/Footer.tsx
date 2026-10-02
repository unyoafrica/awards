import { award, nav } from '../content'
import { Arrow } from './Arrow'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer grain">
      <div className="wrap">
        <div className="footer__top">
          <p className="footer__line">
            {award.shortName} {award.year}. Presented {award.date}, {award.city}.
          </p>
          <a className="btn btn--gold" href="#prepare">
            Prepare your nomination
            <Arrow />
          </a>
        </div>

        <nav className="footer__nav" aria-label="Footer">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
            <li>
              <a href="#top">Back to top</a>
            </li>
          </ul>
        </nav>

        <p className="footer__mark" aria-label={award.organiser}>
          <span aria-hidden="true">{award.organiser}</span>
        </p>

        <div className="footer__base">
          <p className="meta">{award.foundation}</p>
          <p className="meta">
            © {award.year} {award.organiser}
          </p>
        </div>
      </div>
    </footer>
  )
}
