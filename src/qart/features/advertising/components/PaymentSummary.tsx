import { fees } from '../utils/estimates'
import { formatNaira } from '../utils/format'

/** Every naira itemised: budget, Qart fee, VAT on the fee, total. */
export function PaymentSummary({ budget, label = 'Campaign budget' }: { budget: number; label?: string }) {
  const f = fees(budget)
  return (
    <dl className="ad-pay">
      <div>
        <dt>{label}</dt>
        <dd className="num">{formatNaira(budget)}</dd>
      </div>
      <div>
        <dt>Qart service fee (3%)</dt>
        <dd className="num">{formatNaira(f.service)}</dd>
      </div>
      <div>
        <dt>VAT on fee (7.5%)</dt>
        <dd className="num">{formatNaira(f.vat)}</dd>
      </div>
      <div className="ad-pay__total">
        <dt>Total</dt>
        <dd className="num">{formatNaira(f.total)}</dd>
      </div>
    </dl>
  )
}
