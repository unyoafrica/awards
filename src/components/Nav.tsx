import { useEffect, useRef, useState } from 'react'
import { award, nav } from '../content'
import headIcon from '../assets/brand/unyo-head-icon.png'
import wordmark from '../assets/brand/unyo-wordmark.png'
import './Nav.css'

export function Nav({ page = 'home' }: { page?: 'home' | 'nominate' }) {
  // Section links live on the home page; from other pages they go back to it.
  const home = page === 'home' ? '' : 'index.html'
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [open])

  return (
    <header className={`nav ${solid ? 'is-solid' : ''} ${open ? 'is-open' : ''}`}>
      <div className="nav__bar wrap">
        <a className="nav__brand" href={`${home}#top`}>
          <img className="nav__icon" src={headIcon} alt="" width="240" height="240" />
          <img className="nav__wordmark" src={wordmark} alt={`${award.organiser}, back to top`} width="640" height="240" />
        </a>

        <nav className="nav__links" aria-label="Sections">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={home + item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <a className="nav__cta" href={page === 'nominate' ? '#nomination-form' : 'nominate.html'}>
          Nominate now
        </a>

        <button
          ref={toggleRef}
          className="nav__toggle"
          type="button"
          aria-expanded={open}
          aria-controls="nav-sheet"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="nav__toggle-lines" aria-hidden="true" />
        </button>
      </div>

      <div id="nav-sheet" className="nav__sheet" hidden={!open}>
        <nav aria-label="Sections">
          <ul>
            {nav.map((item, i) => (
              <li key={item.href} style={{ '--i': i } as React.CSSProperties}>
                <a href={home + item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="nav__sheet-foot meta">
          {award.date}, {award.city}
        </p>
      </div>
    </header>
  )
}
