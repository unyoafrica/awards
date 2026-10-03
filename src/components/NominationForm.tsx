import { useEffect, useId, useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { award } from '../content'
import { googleForm, nominationPage as page, sections, submissionKeys, type Field } from '../nomination'
import partnerLogo from '../assets/brand/comemakewego-logo.png'
import type { Confirmation } from '../confirmationPdf'
import { Photo } from './Photo'
import './NominationForm.css'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'error'; message: string } | ({ kind: 'done' } & Confirmation)

const liveFormUrl = 'https://award.unyo.africa/nominate.html'

/** Today's date in the visitor's time zone, as yyyy-mm-dd, the latest allowed start date. */
const today = new Date().toLocaleDateString('en-CA')

function newReference() {
  return `UNYO-2026-${crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`
}

async function sendToGoogleForm(values: Record<string, string>) {
  const body = new URLSearchParams()
  for (const key of submissionKeys) {
    const entry = googleForm.entries[key]
    if (entry && values[key]) body.append(entry, values[key])
  }
  const url = `https://docs.google.com/forms/d/e/${googleForm.formId}/formResponse`
  try {
    // Google Forms does not send CORS headers, so the response is opaque:
    // a resolved request means it reached Google; a network failure throws.
    await fetch(url, { method: 'POST', mode: 'no-cors', body })
  } catch {
    // Some hosts and embedded previews block script requests to other sites
    // but still allow an ordinary form post, so try that before giving up.
    await postThroughFrame(url, body)
  }
}

/** Posts the answers as a plain HTML form into a hidden frame. Resolves once the frame loads the response. */
function postThroughFrame(url: string, body: URLSearchParams) {
  return new Promise<void>((resolve, reject) => {
    const name = `google-form-${Date.now()}`
    const frame = document.createElement('iframe')
    frame.name = name
    frame.title = 'Nomination submission'
    frame.hidden = true

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = url
    form.target = name
    form.hidden = true
    for (const [key, value] of body) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value
      form.append(input)
    }

    let blocked = false
    const onViolation = (e: SecurityPolicyViolationEvent) => {
      // Only a blocked form post or frame matters here, not the earlier blocked request.
      if (/^(form-action|frame-src|child-src)$/.test(e.effectiveDirective) && e.blockedURI.includes('docs.google.com')) blocked = true
    }
    let timer = 0
    const finish = (ok: boolean) => {
      window.clearTimeout(timer)
      document.removeEventListener('securitypolicyviolation', onViolation)
      form.remove()
      frame.remove()
      if (ok && !blocked) resolve()
      else reject(new Error(blocked ? 'blocked' : 'timeout'))
    }

    document.body.append(frame, form)
    document.addEventListener('securitypolicyviolation', onViolation)
    // Added after insertion so the frame's initial blank load is not counted.
    frame.addEventListener('load', () => window.setTimeout(() => finish(true), 300), { once: true })
    timer = window.setTimeout(() => finish(false), 15000)
    form.submit()
  })
}

export function NominationForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const messageRef = useRef<HTMLParagraphElement>(null)
  const confirmRef = useRef<HTMLHeadingElement>(null)
  const [copied, setCopied] = useState(false)
  const [pdfState, setPdfState] = useState<'idle' | 'working' | 'failed'>('idle')
  const [nominationType, setNominationType] = useState('My own initiative')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const referenceRef = useRef(newReference())

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void submit(e.currentTarget)
  }

  // Sandboxed frames without form permission never fire the submit event,
  // so the button runs the submission itself.
  function onSubmitClick(e: MouseEvent<HTMLButtonElement>) {
    if (!e.currentTarget.form) return
    e.preventDefault()
    void submit(e.currentTarget.form)
  }

  async function submit(form: HTMLFormElement) {
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
        date: new Date().toISOString(),
        organisation: values.organisation,
        nominatorName: values.nominatorName,
        email: values.nominatorEmail,
        nominationType: values.nominationType,
        leadName: values.leadName,
        location: values.location,
        category: values.category,
      })
    } catch (err) {
      showError(
        err instanceof Error && err.message === 'blocked'
          ? `This page is not allowed to send nominations (this happens in previews). Please submit on ${liveFormUrl}.`
          : 'Unable to connect. Your answers are still here. Please check your connection and try again.',
      )
    }
  }

  async function downloadReceipt() {
    if (status.kind !== 'done') return
    setPdfState('working')
    try {
      const { downloadConfirmationPdf } = await import('../confirmationPdf')
      await downloadConfirmationPdf(status)
      setPdfState('idle')
    } catch {
      setPdfState('failed')
    }
  }

  const done = status.kind === 'done'

  // The success screen replaces the form: start it at the top of the page.
  useEffect(() => {
    if (!done) return
    window.scrollTo({ top: 0 })
    confirmRef.current?.focus()
  }, [done])

  async function copyReference() {
    if (status.kind !== 'done') return
    try {
      await navigator.clipboard.writeText(status.reference)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  if (status.kind === 'done') {
    const submitted = new Date(status.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    return (
      <main id="main" className="nom nom--done">
        <section className="nom__success grain" aria-labelledby="confirm-title">
          <div className="wrap nom__success-grid">
            <div className="nom__success-text">
              <span className="nom__success-mark" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 25l8 8 16-18" />
                </svg>
              </span>
              <p className="meta nom__eyebrow">{page.confirmation.eyebrow}</p>
              <h1 id="confirm-title" ref={confirmRef} tabIndex={-1} className="nom__success-title">
                {page.confirmation.heading}
              </h1>
              <p className="nom__success-body">{page.confirmation.body}</p>

              <div className="nom__receipt">
                <div className="nom__receipt-ref">
                  <p className="meta">{page.confirmation.referenceLabel}</p>
                  <p className="nom__ref">{status.reference}</p>
                  <button type="button" className="nom__copy" onClick={copyReference}>
                    {copied ? 'Copied' : 'Copy reference'}
                  </button>
                </div>
                <dl className="nom__receipt-facts">
                  <div>
                    <dt className="meta">Initiative</dt>
                    <dd>{status.organisation}</dd>
                  </div>
                  <div>
                    <dt className="meta">Submitted</dt>
                    <dd>{submitted}</dd>
                  </div>
                  <div>
                    <dt className="meta">Confirmation for</dt>
                    <dd>{status.email}</dd>
                  </div>
                </dl>
              </div>

              <p className="nom__success-note">{page.confirmation.footnote}</p>

              <div className="nom__success-actions">
                <a className="btn btn--gold" href="index.html">
                  {page.confirmation.back}
                </a>
                <button type="button" className="btn btn--ghost" onClick={downloadReceipt} disabled={pdfState === 'working'}>
                  {pdfState === 'working' ? 'Preparing PDF…' : 'Download confirmation (PDF)'}
                </button>
              </div>
              {pdfState === 'failed' && (
                <p className="nom__success-note" role="alert">
                  The PDF could not be created. Please note your reference number above.
                </p>
              )}
            </div>
            <Photo shot="nominate" priority className="nom__success-photo" />
          </div>
        </section>
      </main>
    )
  }

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
            </div>
          </div>
        </aside>

        <div className="nom__main">
          <div className="nom__heading">
            <h2>{page.formHeading}</h2>
            <p>{page.formIntro}</p>
          </div>

          <form ref={formRef} id="nomination-form" className="nom__form" onSubmit={onSubmit}>
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
                      <button className="btn btn--gold" type="submit" disabled={status.kind === 'sending'} onClick={onSubmitClick}>
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
          max={field.kind === 'date' ? today : undefined}
          onClick={field.kind === 'date' ? (e) => e.currentTarget.showPicker?.() : undefined}
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
