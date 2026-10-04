import { useId, useState } from 'react'
import { faq } from '../content'
import './Faq.css'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const baseId = useId()

  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="wrap faq__grid">
        <h2 id="faq-title" className="faq__title">
          Before you nominate.
        </h2>
        <div className="faq__list">
          {faq.map((item, i) => {
            const isOpen = open === i
            const btnId = `${baseId}-q${i}`
            const panelId = `${baseId}-a${i}`
            return (
              <div key={item.q} className={`faq__item ${isOpen ? 'is-open' : ''}`}>
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    className="faq__q"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span>{item.q}</span>
                    <span className="faq__icon" aria-hidden="true" />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={btnId} className="faq__a" inert={!isOpen}>
                  <div>
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
