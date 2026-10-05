import { useState } from 'react'
import type { Campaign, PaymentMethodId } from '../types'
import { BottomSheet, Chip } from '../../../ui/primitives'
import { toast } from '../../../ui/feedback'
import { PaymentSummary } from './PaymentSummary'
import { PaymentMethods } from '../screens/PaymentScreen'
import { adsService } from '../services/adsService'
import { useAdsState } from '../hooks/useAds'
import { fees, dailyAmount } from '../utils/estimates'
import { formatNaira } from '../utils/format'

export type BudgetAction = { kind: 'increase'; amount?: number } | { kind: 'extend'; days?: number }

/** Add money to a live campaign: more per day, or more days. Shows exactly what will be charged. */
export function BudgetActionSheet({
  campaign,
  action,
  onClose,
}: {
  campaign?: Campaign
  action: BudgetAction | null
  onClose: () => void
}) {
  const { balance } = useAdsState()
  // Choices start from what the suggestion proposed; the merchant's picks override them until the sheet closes.
  const [pickedPerDay, setPerDay] = useState<number | null>(null)
  const [pickedDays, setDays] = useState<number | null>(null)
  const [method, setMethod] = useState<PaymentMethodId>('balance')
  const perDay = pickedPerDay ?? (action?.kind === 'increase' ? action.amount : undefined) ?? 5000
  const days = pickedDays ?? (action?.kind === 'extend' ? action.days : undefined) ?? 3
  const close = () => {
    setPerDay(null)
    setDays(null)
    onClose()
  }

  if (!campaign) return null
  const remainingDays = Math.max(1, campaign.budget.durationDays - campaign.daily.length)
  const extra = action?.kind === 'extend' ? Math.round(dailyAmount(campaign.budget) * days) : perDay * remainingDays
  const charge = fees(extra).total
  const short = method === 'balance' && balance < charge

  const confirm = () => {
    if (!action) return
    if (action.kind === 'increase') adsService.increaseBudget(campaign.id, perDay, method)
    else adsService.extend(campaign.id, days, method)
    close()
    toast(`${formatNaira(extra)} has been added to ${campaign.name}.`)
  }

  return (
    <BottomSheet
      open={!!action}
      onClose={close}
      title={action?.kind === 'extend' ? 'Keep your ad running' : 'Increase your budget'}
      footer={
        <button type="button" className="q-btn q-btn--primary" onClick={confirm} disabled={short}>
          Pay {formatNaira(charge)}
        </button>
      }
    >
      <div className="ad-stack">
        {action?.kind === 'increase' ? (
          <>
            <p className="ad-muted">
              Now {formatNaira(dailyAmount(campaign.budget))} a day. Add more for the remaining {remainingDays}{' '}
              {remainingDays === 1 ? 'day' : 'days'}.
            </p>
            <div className="ad-chips">
              {[2000, 5000, 10000, 20000].map((n) => (
                <Chip key={n} on={perDay === n} onClick={() => setPerDay(n)}>
                  +{formatNaira(n)}/day
                </Chip>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="ad-muted">Add days at {formatNaira(dailyAmount(campaign.budget))} a day.</p>
            <div className="ad-chips">
              {[3, 7, 14].map((n) => (
                <Chip key={n} on={days === n} onClick={() => setDays(n)}>
                  +{n} days
                </Chip>
              ))}
            </div>
          </>
        )}
        <PaymentSummary budget={extra} label="Added budget" />
        <PaymentMethods value={method} onChange={setMethod} amount={charge} />
        <p className="ad-confirm ad-confirm--inline">
          You are about to add <strong className="num">{formatNaira(extra)}</strong> to this campaign.
        </p>
      </div>
    </BottomSheet>
  )
}
