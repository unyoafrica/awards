import { useState } from 'react'
import type { PaymentMethodId } from '../types'
import { useDraft, draftStore, checkout } from '../hooks/useDraft'
import { amountDue } from '../services/adsService'
import { useAdsState } from '../hooks/useAds'
import { back, navigate } from '../../../app/router'
import { Icon } from '../../../ui/Icon'
import { BottomSheet, ScreenHeader } from '../../../ui/primitives'
import { haptic, toast } from '../../../ui/feedback'
import { OptionCard } from '../components/Selectors'
import { PaymentSummary } from '../components/PaymentSummary'
import { fees, totalAmount } from '../utils/estimates'
import { formatNaira } from '../utils/format'

export function PaymentMethods({
  value,
  onChange,
  amount,
}: {
  value: PaymentMethodId
  onChange: (m: PaymentMethodId) => void
  amount: number
}) {
  const { balance } = useAdsState()
  const short = balance < amount
  return (
    <div className="ad-stack" role="radiogroup" aria-label="Payment method">
      <OptionCard
        selected={value === 'balance'}
        onSelect={() => onChange('balance')}
        icon={<Icon name="wallet" size={22} />}
        title="Qart balance"
        body={
          <span className={short ? 'ad-text-bad' : ''}>
            <span className="num">{formatNaira(balance)}</span> available
            {short && ' · not enough for this payment'}
          </span>
        }
      />
      <OptionCard
        selected={value === 'transfer'}
        onSelect={() => onChange('transfer')}
        icon={<Icon name="bank" size={22} />}
        title="Bank transfer"
        body="Pay from any Nigerian bank app"
      />
      <OptionCard
        selected={value === 'card'}
        onSelect={() => onChange('card')}
        icon={<Icon name="card" size={22} />}
        title="Debit card"
        body={<span className="num">Verve •••• 4821</span>}
      />
    </div>
  )
}

export function PaymentScreen() {
  const [draft] = useDraft()
  const { balance } = useAdsState()
  const budget = totalAmount(draft.budget)
  const { total: fullTotal } = fees(budget)
  const total = amountDue(draft, draftStore.editingId())
  const alreadyPaid = fullTotal - total
  const [method, setMethod] = useState<PaymentMethodId>(balance >= total ? 'balance' : 'transfer')
  const [transferOpen, setTransferOpen] = useState(false)
  const blocked = method === 'balance' && balance < total

  const pay = () => {
    haptic(12)
    if (method === 'transfer') return setTransferOpen(true)
    checkout.method = method
    navigate('/ads/create/launch', { replace: true })
  }

  return (
    <div className="q-screen q-screen--flow">
      <ScreenHeader title="Payment" onBack={() => back('/ads/create/7')} />

      <div className="ad-step__title">
        <h2>Pay for your ad</h2>
        <p>{draft.name || draft.promoted?.name}</p>
      </div>

      <PaymentSummary budget={budget} />
      {alreadyPaid > 0 && (
        <p className="ad-paid-note num">
          You’ve already paid {formatNaira(alreadyPaid)} for this campaign. You only pay the difference: {formatNaira(total)}.
        </p>
      )}

      <section className="ad-sub">
        <h3>Pay with</h3>
        <PaymentMethods value={method} onChange={setMethod} amount={total} />
      </section>

      <div className="ad-tip ad-tip--plain">
        <Icon name="shield" size={18} />
        <div>
          <strong>Your money is protected</strong>
          <span>
            If a platform can’t publish your ad, you won’t be charged. Any budget left unspent when the campaign ends goes back to your Qart
            balance.
          </span>
        </div>
      </div>

      <div className="q-actionbar">
        <p className="ad-confirm">
          You are about to spend <strong className="num">{formatNaira(budget)}</strong> on this campaign.
        </p>
        <button type="button" className="q-btn q-btn--primary" onClick={pay} disabled={blocked}>
          Pay {formatNaira(total)} & launch
        </button>
      </div>

      <BottomSheet
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="Pay by bank transfer"
        footer={
          <button
            type="button"
            className="q-btn q-btn--primary"
            onClick={() => {
              setTransferOpen(false)
              checkout.method = 'transfer'
              navigate('/ads/create/launch', { replace: true })
            }}
          >
            I’ve sent the money
          </button>
        }
      >
        <p className="ad-muted">Transfer exactly this amount. We’ll confirm it automatically, usually within a minute.</p>
        <dl className="ad-transfer">
          <div>
            <dt>Amount</dt>
            <dd className="num">{formatNaira(total)}</dd>
          </div>
          <div>
            <dt>Bank</dt>
            <dd>Wema Bank</dd>
          </div>
          <div>
            <dt>Account number</dt>
            <dd className="num">
              7820 4419 63
              <button
                type="button"
                className="ad-copybtn"
                onClick={() => {
                  navigator.clipboard?.writeText('7820441963').catch(() => undefined)
                  toast('Account number copied', 'info')
                }}
              >
                <Icon name="copy" size={16} /> Copy
              </button>
            </dd>
          </div>
          <div>
            <dt>Account name</dt>
            <dd>Qart Ads – Dalmont Store</dd>
          </div>
        </dl>
        <p className="q-hint">This account is only for this payment and expires in 30 minutes.</p>
      </BottomSheet>
    </div>
  )
}
