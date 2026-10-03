import { useId, useRef, useState, type FormEvent } from 'react'
import { award } from '../content'
import { googleForm, nominationPage as page, sections, submissionKeys, type Field } from '../nomination'
import partnerLogo from '../assets/brand/comemakewego-logo.png'
import './NominationForm.css'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'error'; message: string } | { kind: 'done'; reference: string; organisation: string; email: string; date: string }

function newReference() {
  return `UNYO-2026-${crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`
}

async function sendToGoogleForm(values: Record<string, string>) {
  const body = new URLSearchParams()
  for (const key of submissionKeys) {
    const entry = googleForm.entries[key]
    if (entry && values[key]) body.append(entry, values[key])
  }
  // Google Forms does not send CORS headers, so the response is opaque:
  // a resolved request means it reached Google; a network failure throws.
  await fetch(`https://docs.google.com/forms/d/e/${googleForm.formId}/formResponse`, {
    method: 'POST',
    mode: 'no-cors',
    body,
  })
}

export function NominationForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const messageRef = useRef<HTMLParagraphElement>(null)
  const confirmRef = useRef<HTMLElement>(null)
  const [nominationType, setNominationType] = useState('My own initiative')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const referenceRef = useRef(newReference())

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return

    const data = new FormData(form)
    if (data.get('companyWebsite')) return // honeypot

    const values: Record<string, string> = { submissionId: referenceRef.current }
    for (const key of submissionKeys) {
      if (key === 'submissionId') continue
      const el = form.elements.namedItem(key)
      if (el instanceof HTMLInputElement && el.type === 'checkbox') values[key] = el.checked ? 'Yes' : ''
      else values[key] = String(data.get(key) ?? '').trim()
    }
    if (values.nominationType !== 'Another initiative') values.relationship = ''

    const showError = (message: string) => {
      setStatus({ kind: 'error', message })
      requestAnimationFrame(() => messageRef.current?.focus())
    }

    if (!googleForm.formId) {
      showError('Online submissions are not connected yet, so this nomination was not sent. Your answers are still here.')
      return
    }

    setStatus({ kind: 'sending' })
    try {
      await sendToGoogleForm(values)
      setStatus({
        kind: 'done',
        reference: values.submissionId,
        organisation: values.organisation,
        email: values.nominatorEmail,
        date: new Date().toISOString(),
      })
      requestAnimationFrame(() => {
        confirmRef.current?.focus()
        confirmRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch {
      showError('Unable to connect. Your answers are still here. Please check your connection and try again.')
    }
  }

  function downloadReceipt() {
    if (status.kind !== 'done') return
    const text = `${award.name.toUpperCase()} ${award.year}\nNomination confirmation\n\nReference: ${status.reference}\nInitiative: ${status.organisation}\nSubmitted: ${status.date}\nNominator email: ${status.email}\n\n${page.confirmation.body} ${page.confirmation.footnote}\n\n${award.organiser} is a Comemakewego.africa brand.\n`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'Unyo-Nomination-Confirmation.txt'
    document.body.append(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const done = status.kind === 'done'

  return (
    <main id="main" className="nom">
      <div className="wrap nom__grid">
        <aside className="nom__aside grain">
          <div className="nom__aside-inner">
            <p className="meta nom__eyebrow">Nominations {award.year}</p>
            <h1 className="nom__title">{page.title}</h1>
            <p className="nom__intro">{page.intro}</p>
            <div className="nom__prize">
              <strong>{award.grant}</strong>
              <span>
                Development support grant
                <br />+ award plaque and certificate
              </span>
            </div>
            <p className="nom__note">{page.juryNote}</p>
            <nav aria-label="Form sections" className="nom__toc">
              <ol>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>
                      <span className="meta">{s.n}</span> {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <p className="nom__note">{page.readyNote}</p>
            <div className="nom__partner">
              <img src={partnerLogo} alt="ComeMakeWeGo Tourism Africa Foundation" width="788" height="180" />
              <p className="nom__note">{award.organiser} is a Comemakewego.africa brand.</p>
            </div>
          </div>
        </aside>

        <div className="nom__main">
          {!done && (
            <div className="nom__heading">
              <h2>{page.formHeading}</h2>
              <p>{page.formIntro}</p>
            </div>
          )}

          <form ref={formRef} id="nomination-form" className="nom__form" onSubmit={onSubmit} hidden={done}>
            {sections.map((section) => (
              <fieldset key={section.id} id={section.id} className="nom__section">
                <legend>
                  <span className="nom__n">{section.n}</span>
                  {section.title}
                </legend>
                {section.intro && <p className="nom__section-intro">{section.intro}</p>}

                <div className="nom__fields">
                  {section.fields.map((field) =>
                    field.name === 'relationship' && nominationType !== 'Another initiative' ? null : (
                      <FieldControl
                        key={field.name}
                        field={field}
                        count={counts[field.name] ?? 0}
                        onCount={(n) => setCounts((c) => ({ ...c, [field.name]: n }))}
                        onChange={field.name === 'nominationType' ? setNominationType : undefined}
                      />
                    ),
                  )}
                </div>

                {section.note && <p className="nom__hint nom__section-note">{section.note}</p>}

                {section.id === 'declaration' && (
                  <>
                    <div className="nom__trap" aria-hidden="true">
                      <label htmlFor="companyWebsite">Leave this empty</label>
                      <input id="companyWebsite" name="companyWebsite" tabIndex={-1} autoComplete="off" />
                    </div>
                    <div className="nom__submit">
                      <button className="btn btn--gold" type="submit" disabled={status.kind === 'sending'}>
                        {status.kind === 'sending' ? page.submitting : page.submit}
                      </button>
                      <p className="nom__hint">{page.submitNote}</p>
                    </div>
                    {status.kind === 'error' && (
                      <p ref={messageRef} className="nom__message" role="alert" tabIndex={-1}>
                        {status.message}
                      </p>
                    )}
                  </>
                )}
              </fieldset>
            ))}
          </form>

          {done && (
            <section ref={confirmRef} className="nom__confirm" tabIndex={-1} aria-labelledby="confirm-title">
              <p className="meta nom__eyebrow">{page.confirmation.eyebrow}</p>
              <h2 id="confirm-title">{page.confirmation.heading}</h2>
              <p>{page.confirmation.body}</p>
              <p className="meta nom__ref-label">{page.confirmation.referenceLabel}</p>
              <p className="nom__ref">{status.reference}</p>
              <button type="button" className="btn btn--ink" onClick={downloadReceipt}>
                Download confirmation
              </button>
              <p className="nom__hint">{page.confirmation.footnote}</p>
              <a className="nom__back" href="index.html">
                {page.confirmation.back}
              </a>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}

function FieldControl({
  field,
  count,
  onCount,
  onChange,
}: {
  field: Field
  count: number
  onCount: (n: number) => void
  onChange?: (value: string) => void
}) {
  const id = field.name
  const hintId = useId()
  const label = (
    <>
      {field.label}
      {field.required ? <span aria-hidden="true"> *</span> : <span className="nom__optional"> (optional)</span>}
    </>
  )

  if (field.kind === 'checkbox') {
    return (
      <label className="nom__check" htmlFor={id}>
        <input id={id} name={id} type="checkbox" required={field.required} />
        <span>
          {field.label}
          {field.required && <span aria-hidden="true"> *</span>}
        </span>
      </label>
    )
  }

  const hint = 'hint' in field ? field.hint : undefined
  const half = 'half' in field && field.half

  return (
    <div className={`nom__field ${half ? 'nom__field--half' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {field.kind === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          rows={field.rows}
          maxLength={field.maxLength}
          required={field.required}
          placeholder={field.placeholder}
          aria-describedby={hintId}
          onInput={(e) => onCount(e.currentTarget.value.length)}
        />
      ) : field.kind === 'select' ? (
        <select
          id={id}
          name={id}
          required={field.required}
          defaultValue={field.placeholder ? '' : field.options[0].value}
          aria-describedby={hint ? hintId : undefined}
          onChange={(e) => onChange?.(e.target.value)}
        >
          {field.placeholder && <option value="">{field.placeholder}</option>}
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.kind === 'number' ? (
        <input id={id} name={id} type="number" inputMode="numeric" min={field.min} max={field.max} step={1} required={field.required} />
      ) : (
        <input
          id={id}
          name={id}
          type={field.kind}
          maxLength={field.maxLength}
          required={field.required}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          aria-describedby={hint ? hintId : undefined}
        />
      )}
      {(hint || field.kind === 'textarea') && (
        <p className="nom__hint" id={hintId}>
          {hint}
          {field.kind === 'textarea' && (
            <span className="nom__count">
              {count.toLocaleString('en-GB')} / {field.maxLength.toLocaleString('en-GB')}
            </span>
          )}
        </p>
      )}
    </div>
  )
}
