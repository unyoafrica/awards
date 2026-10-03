/**
 * Builds the nomination confirmation PDF in the browser. Loaded on demand
 * from the success screen, so pdf-lib and the fonts stay out of the main bundle.
 * Fonts and logo are inlined (data URIs) so the file builds without extra requests.
 */
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { award } from './content'
import { nominationPage, sections } from './nomination'
import displayFontUrl from './assets/fonts/bricolage-700-pdf.ttf?inline'
import bodyFontUrl from './assets/fonts/source-serif-400-pdf.ttf?inline'
import bodyStrongFontUrl from './assets/fonts/source-serif-600-pdf.ttf?inline'
import wordmarkUrl from './assets/brand/unyo-wordmark.png?inline'

export type Confirmation = {
  reference: string
  date: string
  organisation: string
  nominatorName: string
  email: string
  nominationType: string
  leadName: string
  location: string
  category: string
}

const hex = (h: string) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255)
const c = {
  forest: hex('#16352a'),
  forestDeep: hex('#003d1c'),
  gold: hex('#e89c0c'),
  goldDark: hex('#b5780a'),
  cotton: hex('#faf3ea'),
  paper: hex('#fffaf3'),
  ink: hex('#15140f'),
  inkSoft: hex('#3b382e'),
  muted: hex('#5f594a'),
  rule: hex('#ddd3c4'),
}

const A4 = { w: 595.28, h: 841.89 }
const M = 48 // page margin

function bytes(dataUrl: string) {
  const bin = atob(dataUrl.slice(dataUrl.indexOf(',') + 1))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

/** Swaps characters a font cannot draw for their unaccented form, then for "?". */
function safe(font: PDFFont, text: string) {
  const chars = new Set(font.getCharacterSet())
  return [...text.normalize('NFC')]
    .map((ch) => {
      if (chars.has(ch.codePointAt(0)!)) return ch
      const base = ch.normalize('NFD')[0]
      return chars.has(base.codePointAt(0)!) ? base : '?'
    })
    .join('')
}

type Glyph = { advanceWidth: number; bbox: { minX: number; maxX: number } }
type FontkitFont = { unitsPerEm: number; xHeight: number; capHeight: number; glyphForCodePoint(cp: number): Glyph }

const isMark = (ch: string) => /\p{M}/u.test(ch)
const below = new Set([0x323, 0x324, 0x325, 0x326, 0x327, 0x328, 0x331])

/**
 * pdf-lib does not position combining marks, so letters with no precomposed form
 * (Yoruba ọ́, ẹ̀ and similar) are drawn as base letter plus each mark centred over it.
 */
function drawText(page: PDFPage, font: PDFFont, text: string, opts: { x: number; y: number; size: number; color: ReturnType<typeof rgb> }) {
  const fk = (font as unknown as { embedder: { font: FontkitFont } }).embedder.font
  const scale = opts.size / fk.unitsPerEm
  let x = opts.x
  let base = { x: 0, width: 0, tall: false }
  for (const ch of safe(font, text)) {
    const cp = ch.codePointAt(0)!
    if (isMark(ch)) {
      const g = fk.glyphForCodePoint(cp)
      const markCentre = ((g.bbox.minX + g.bbox.maxX) / 2) * scale
      const lift = !below.has(cp) && base.tall ? (fk.capHeight - fk.xHeight) * scale : 0
      page.drawText(ch, { x: base.x + base.width / 2 - markCentre, y: opts.y + lift, size: opts.size, font, color: opts.color })
      continue
    }
    const width = font.widthOfTextAtSize(ch, opts.size)
    page.drawText(ch, { x, y: opts.y, size: opts.size, font, color: opts.color })
    base = { x, width, tall: /[\p{Lu}bdfhklt]/u.test(ch) }
    x += width
  }
}

function wrap(font: PDFFont, text: string, size: number, width: number) {
  const lines: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const word of para.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(next, size) <= width || !line) line = next
      else {
        lines.push(line)
        line = word
      }
    }
    lines.push(line)
  }
  return lines
}

/** Draws wrapped text from a top y, returns the y below the last line. */
function para(page: PDFPage, font: PDFFont, text: string, opts: { x: number; y: number; size: number; width: number; leading?: number; color?: ReturnType<typeof rgb>; maxLines?: number }) {
  const leading = opts.leading ?? opts.size * 1.45
  let lines = wrap(font, safe(font, text), opts.size, opts.width)
  if (opts.maxLines && lines.length > opts.maxLines) {
    lines = lines.slice(0, opts.maxLines)
    let last = lines[opts.maxLines - 1]
    while (last && font.widthOfTextAtSize(`${last}…`, opts.size) > opts.width) last = last.slice(0, -1)
    lines[opts.maxLines - 1] = `${last.trimEnd()}…`
  }
  let y = opts.y
  for (const line of lines) {
    y -= leading
    drawText(page, font, line, { x: opts.x, y: y + (leading - opts.size) * 0.5, size: opts.size, color: opts.color ?? c.ink })
  }
  return y
}

/** Small tracked capitals, like the site's `.meta` labels. */
function label(page: PDFPage, font: PDFFont, text: string, x: number, y: number, color = c.muted, size = 7.2, align: 'left' | 'right' = 'left') {
  const t = safe(font, text.toUpperCase())
  const tracking = size * 0.14
  const width = [...t].reduce((w, ch) => w + font.widthOfTextAtSize(ch, size) + tracking, -tracking)
  let cx = align === 'right' ? x - width : x
  for (const ch of t) {
    page.drawText(ch, { x: cx, y, size, font, color })
    cx += font.widthOfTextAtSize(ch, size) + tracking
  }
  return width
}

export async function buildConfirmationPdf(data: Confirmation) {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  doc.setTitle(`Nomination confirmation ${data.reference}`)
  doc.setAuthor(award.organiser)
  doc.setSubject(`${award.name} ${award.year}`)
  doc.setCreator(award.organiser)

  const display = await doc.embedFont(bytes(displayFontUrl), { subset: true })
  const body = await doc.embedFont(bytes(bodyFontUrl), { subset: true })
  const strong = await doc.embedFont(bytes(bodyStrongFontUrl), { subset: true })
  const logo = await doc.embedPng(bytes(wordmarkUrl))

  const page = doc.addPage([A4.w, A4.h])
  const inner = A4.w - M * 2
  page.drawRectangle({ x: 0, y: 0, width: A4.w, height: A4.h, color: c.cotton })

  // Header: approved wordmark and document label.
  const logoH = 40
  const logoW = (logo.width / logo.height) * logoH
  page.drawImage(logo, { x: M - 4, y: A4.h - 30 - logoH, width: logoW, height: logoH })
  label(page, display, 'Nomination confirmation', A4.w - M, A4.h - 46, c.forest, 7.5, 'right')
  label(page, display, `${award.shortName} ${award.year}`, A4.w - M, A4.h - 59, c.muted, 7, 'right')

  // Layout runs top-down: `top(n)` is n points below the page's top edge.
  const top = (n: number) => A4.h - n

  // Forest band with the thank-you message and a seal.
  const bandTop = 92
  const bandH = 196
  page.drawRectangle({ x: 0, y: top(bandTop + bandH), width: A4.w, height: bandH, color: c.forest })
  page.drawRectangle({ x: 0, y: top(bandTop + 3), width: A4.w, height: 3, color: c.gold })

  const sealX = A4.w - M - 62
  const sealY = top(bandTop + 92)
  for (const [r, o] of [[90, 0.1], [72, 0.16], [55, 0.26]] as const) {
    page.drawCircle({ x: sealX, y: sealY, size: r, borderColor: c.gold, borderWidth: 0.8, opacity: 0, borderOpacity: o })
  }
  page.drawCircle({ x: sealX, y: sealY, size: 38, color: c.gold })
  page.drawSvgPath('M -14 1 L -5 10 L 15 -11', { x: sealX, y: sealY, borderColor: c.forest, borderWidth: 5, borderLineCap: 1 })

  label(page, display, nominationPage.confirmation.eyebrow, M, top(bandTop + 40), c.gold, 8)
  const headingEnd = para(page, display, nominationPage.confirmation.heading, { x: M, y: top(bandTop + 48), size: 31, leading: 33, width: 300, color: c.cotton })
  para(page, body, 'Keep your reference number for any follow-up.', { x: M, y: headingEnd - 6, size: 10.5, width: 300, color: hex('#e8dfcf') })

  // Reference card overlapping the band.
  const cardTop = bandTop + bandH - 28
  const cardH = 78
  page.drawRectangle({ x: M, y: top(cardTop + cardH), width: inner, height: cardH, color: c.paper, borderColor: c.rule, borderWidth: 0.6 })
  page.drawRectangle({ x: M, y: top(cardTop + cardH), width: 4, height: cardH, color: c.gold })
  label(page, display, nominationPage.confirmation.referenceLabel, M + 24, top(cardTop + 24))
  drawText(page, display, data.reference, { x: M + 24, y: top(cardTop + 56), size: 22, color: c.forest })

  // Submission time in West Africa Time, the award's home time zone.
  const submitted = new Date(data.date)
  const day = submitted.toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'long', year: 'numeric' })
  const time = submitted.toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' })
  const colX = M + inner - 150
  page.drawLine({ start: { x: colX - 22, y: top(cardTop + 16) }, end: { x: colX - 22, y: top(cardTop + cardH - 16) }, thickness: 0.6, color: c.rule })
  label(page, display, 'Submitted', colX, top(cardTop + 24))
  drawText(page, strong, day, { x: colX, y: top(cardTop + 44), size: 11.5, color: c.ink })
  drawText(page, body, `${time} WAT`, { x: colX, y: top(cardTop + 59), size: 9.5, color: c.muted })

  // Nomination summary.
  let y = top(cardTop + cardH + 32)
  label(page, display, 'Nomination summary', M, y, c.forest, 8)
  y -= 10
  const optionLabel = (name: string, value: string) => {
    for (const s of sections) for (const f of s.fields) if (f.name === name && f.kind === 'select') return f.options.find((o) => o.value === value)?.label ?? value
    return value
  }
  const rows: [string, string, number][] = [
    ['Initiative', data.organisation, 2],
    ['Founder or team lead', data.leadName, 1],
    ['Location', data.location, 2],
    ['Area of work', data.category ? optionLabel('category', data.category) : '', 1],
    ['Nominated by', data.nominatorName, 1],
    ['Nominator email', data.email, 1],
    ['Nomination type', optionLabel('nominationType', data.nominationType), 1],
  ]
  const keyW = 150
  for (const [k, v, maxLines] of rows) {
    if (!v) continue
    page.drawLine({ start: { x: M, y }, end: { x: A4.w - M, y }, thickness: 0.5, color: c.rule })
    label(page, display, k, M, y - 14.5, c.muted, 6.6)
    y = para(page, body, v, { x: M + keyW, y: y - 3, size: 10, leading: 14, width: inner - keyW, color: c.ink, maxLines }) - 5
  }
  page.drawLine({ start: { x: M, y }, end: { x: A4.w - M, y }, thickness: 0.5, color: c.rule })

  // What happens next: wording taken from the form and site copy.
  y -= 30
  label(page, display, 'What happens next', M, y, c.forest, 8)
  y -= 12
  const steps: [string, string][] = [
    ['Review', nominationPage.confirmation.body.split('. ')[0] + '.'],
    ['Verification', sections.find((s) => s.id === 'declaration')?.intro ?? ''],
    ['Judging', nominationPage.juryNote],
  ]
  const gap = 18
  const stepW = (inner - gap * 2) / 3
  steps.forEach(([title, text], i) => {
    const x = M + i * (stepW + gap)
    page.drawRectangle({ x, y: y - 2, width: stepW, height: 2, color: i === 0 ? c.gold : c.forest })
    page.drawText(`0${i + 1}`, { x, y: y - 20, size: 8.5, font: display, color: c.goldDark })
    page.drawText(title, { x: x + 19, y: y - 20, size: 10.5, font: display, color: c.forest })
    para(page, body, text, { x, y: y - 26, size: 8.6, leading: 12.4, width: stepW, color: c.inkSoft, maxLines: 5 })
  })

  // Award facts strip, fixed above the footer.
  const stripTop = 694
  const stripH = 56
  page.drawRectangle({ x: M, y: top(stripTop + stripH), width: inner, height: stripH, color: c.forestDeep })
  const facts: [string, string][] = [
    [award.grantLabel, award.grant],
    ['Presented', award.date],
    ['Venue', award.city],
  ]
  const factW = inner / 3
  facts.forEach(([k, v], i) => {
    const x = M + 20 + i * factW
    label(page, display, k, x, top(stripTop + 21), c.gold, 6.4)
    drawText(page, display, v, { x, y: top(stripTop + 41), size: i === 0 ? 16 : 12.5, color: c.cotton })
    if (i) page.drawLine({ start: { x: x - 20, y: top(stripTop + 12) }, end: { x: x - 20, y: top(stripTop + stripH - 12) }, thickness: 0.5, color: c.gold, opacity: 0.4 })
  })
  label(page, display, `At the ${award.forum}`, M, top(stripTop + stripH + 15), c.muted, 6.4)

  // Footer.
  const footTop = 782
  page.drawLine({ start: { x: M, y: top(footTop) }, end: { x: A4.w - M, y: top(footTop) }, thickness: 0.5, color: c.rule })
  para(page, body, nominationPage.confirmation.footnote, { x: M, y: top(footTop + 6), size: 8.2, leading: 11.5, width: inner - 170, color: c.muted })
  label(page, display, 'unyo.africa', A4.w - M, top(footTop + 16), c.forest, 7.5, 'right')
  const copy = `© ${award.year} ${award.organiser}`
  drawText(page, body, copy, { x: A4.w - M - body.widthOfTextAtSize(copy, 7.5), y: top(footTop + 29), size: 7.5, color: c.muted })

  return doc.save()
}

export async function downloadConfirmationPdf(data: Confirmation) {
  const pdf = await buildConfirmationPdf(data)
  const url = URL.createObjectURL(new Blob([pdf as BlobPart], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `Unyo-Nomination-${data.reference}.pdf`
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
