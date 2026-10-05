import { useEffect } from 'react'
import { match } from '../../../app/router'
import { AdsHomeScreen } from './AdsHomeScreen'
import { CreateAdScreen } from './CreateAdScreen'
import { PaymentScreen } from './PaymentScreen'
import { LaunchScreen } from './LaunchScreen'
import { CampaignDetailsScreen } from './CampaignDetailsScreen'
import { InsightsScreen } from './InsightsScreen'
import { AccountsScreen } from './AccountsScreen'
import { adsService } from '../services/adsService'
import '../advertising.css'

export function AdsRouter({ path }: { path: string }) {
  useEffect(() => adsService.resumeReviews(), [])
  const [pathname, query = ''] = path.split('?')
  const fromReview = new URLSearchParams(query).get('from') === 'review'

  if (pathname === '/ads/create/pay') return <PaymentScreen />
  if (pathname === '/ads/create/launch') return <LaunchScreen />
  const step = match('/ads/create/:step', pathname)
  if (step) return <CreateAdScreen key={step.step} step={Number(step.step) || 1} fromReview={fromReview} />
  const campaign = match('/ads/campaigns/:id', pathname)
  if (campaign) return <CampaignDetailsScreen key={campaign.id} id={campaign.id} />
  if (pathname === '/ads/insights') return <InsightsScreen />
  if (pathname === '/ads/accounts') return <AccountsScreen />
  return <AdsHomeScreen />
}
