import { useMemo, useRef, useState } from 'react'
import { formatDay } from '../utils/dates'

interface Point {
  date: string
  value: number
}

/**
 * Single-series daily bar chart. One measure at a time (switched by the caller),
 * so there is only ever one y-axis. Tap or hover a day for its value; the same
 * readout is reachable by keyboard.
 */
export function PerformanceChart({
  points,
  format,
  label,
}: {
  points: Point[]
  format: (n: number) => string
  label: string
}) {
  const [active, setActive] = useState<number | null>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const W = 340
  const H = 168
  const pad = { t: 12, r: 4, b: 24, l: 4 }
  const innerW = W - pad.l - pad.r
  const innerH = H - pad.t - pad.b

  const { max, ticks } = useMemo(() => {
    const raw = Math.max(1, ...points.map((p) => p.value))
    const step = niceStep(raw / 3)
    const top = Math.ceil(raw / step) * step
    return { max: top, ticks: [step, step * 2, top].filter((t, i, a) => a.indexOf(t) === i && t <= top) }
  }, [points])

  if (points.length === 0) {
    return (
      <div className="ad-chart ad-chart--empty">
        <p>Results will show here once your ad starts running.</p>
      </div>
    )
  }

  const slot = innerW / points.length
  const barW = Math.max(4, Math.min(22, slot - 4))
  const y = (v: number) => pad.t + innerH - (v / max) * innerH
  const labelEvery = Math.ceil(points.length / 6)
  const shown = active ?? points.length - 1
  const total = points.reduce((t, p) => t + p.value, 0)

  const pick = (clientX: number) => {
    const box = wrap.current?.getBoundingClientRect()
    if (!box) return
    const x = ((clientX - box.left) / box.width) * W - pad.l
    setActive(Math.max(0, Math.min(points.length - 1, Math.floor(x / slot))))
  }

  return (
    <div className="ad-chart">
      <div className="ad-chart__readout" aria-live="polite">
        <strong className="num">{format(points[shown].value)}</strong>
        <span>
          {label} · {formatDay(points[shown].date)}
        </span>
      </div>
      <div
        ref={wrap}
        className="ad-chart__plot"
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setActive(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label} per day, ${format(total)} in total`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="ad-chart__grid" />
              <text x={W - pad.r} y={y(t) - 4} textAnchor="end" className="ad-chart__tick">
                {format(t)}
              </text>
            </g>
          ))}
          <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} className="ad-chart__base" />
          {points.map((p, i) => {
            const cx = pad.l + slot * i + slot / 2
            const h = Math.max(p.value > 0 ? 2 : 0, y(0) - y(p.value))
            const r = Math.min(4, h / 2, barW / 2)
            const x0 = cx - barW / 2
            const top = y(0) - h
            return (
              <g key={p.date}>
                <path
                  d={`M${x0} ${y(0)}V${top + r}Q${x0} ${top} ${x0 + r} ${top}H${x0 + barW - r}Q${x0 + barW} ${top} ${x0 + barW} ${top + r}V${y(0)}Z`}
                  className={`ad-chart__bar ${i === shown ? 'is-on' : ''}`}
                />
                {i % labelEvery === 0 && (
                  <text x={cx} y={H - 6} textAnchor="middle" className="ad-chart__tick">
                    {formatDay(p.date)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      <div className="sr-only">
        <table>
          <caption>{label} per day</caption>
          <tbody>
            {points.map((p) => (
              <tr key={p.date}>
                <th scope="row">{formatDay(p.date)}</th>
                <td>{format(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <input
        type="range"
        className="ad-chart__scrub"
        min={0}
        max={points.length - 1}
        value={shown}
        onChange={(e) => setActive(Number(e.target.value))}
        aria-label={`Choose a day to see ${label.toLowerCase()}`}
        aria-valuetext={`${formatDay(points[shown].date)}: ${format(points[shown].value)}`}
      />
    </div>
  )
}

function niceStep(raw: number) {
  const mag = 10 ** Math.floor(Math.log10(Math.max(raw, 1)))
  const n = raw / mag
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag
}
