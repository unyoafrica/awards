import { award, nav } from '../content'
import { Arrow } from './Arrow'
import masterLogo from '../assets/brand/unyo-master-stacked.png'
import './Footer.css'

export function Footer({ page = 'home' }: { page?: 'home' | 'nominate' }) {
  const home = page === 'home' ? '' : 'index.html'
  return (
    <footer className="footer">
      <div className="footer__main grain">
      <div className="wrap">
        <div className="footer__top">
          <p className="footer__line">
            {award.shortName} {award.year}. Presented {award.date}, {award.city}.
          </p>
          {page === 'home' && (
            <a className="btn btn--gold" href="nominate.html">
              Apply now
              <Arrow />
            </a>
          )}
        </div>

        <nav className="footer__nav" aria-label="Footer">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={home + item.href}>{item.label}</a>
              </li>
            ))}
            <li>
              <a href="#">Back to top</a>
            </li>
          </ul>
        </nav>
      </div>
      </div>

      <div className="footer__brand">
        <div className="wrap footer__brand-inner">
          <img
            className="footer__logo"
            src={masterLogo}
            alt={award.organiser}
            width="800"
            height="800"
            loading="lazy"
          />
          <div className="footer__base">
            <p className="meta">{award.foundation}</p>
            <p className="meta">{award.organiser} is a Comemakewego.africa brand</p>
            <p className="meta">unyo.africa</p>
            <p className="meta">
              © {award.year} {award.organiser}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
