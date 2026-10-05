import type { AgeBand, Audience, CampaignStatus, GoalId } from '../types'

/** Merchant language for each goal. The platform objective it maps to stays inside the adapters. */
export const goals: Record<
  GoalId,
  { title: string; body: string; icon: string; resultLabel: string; resultOne: string; costLabel: string }
> = {
  customers: {
    title: 'Get more customers',
    body: 'Reach people who are likely to buy.',
    icon: 'cart',
    resultLabel: 'Customers',
    resultOne: 'customer',
    costLabel: 'Cost per customer',
  },
  visits: {
    title: 'Get more website visits',
    body: 'Send people to your website or storefront.',
    icon: 'cursor',
    resultLabel: 'Store visits',
    resultOne: 'visit',
    costLabel: 'Cost per visit',
  },
  messages: {
    title: 'Get more messages',
    body: 'Encourage customers to chat with you.',
    icon: 'chat',
    resultLabel: 'Messages',
    resultOne: 'message',
    costLabel: 'Cost per message',
  },
  product: {
    title: 'Promote a product',
    body: 'Put a specific product in front of more people.',
    icon: 'tag',
    resultLabel: 'Customers',
    resultOne: 'customer',
    costLabel: 'Cost per customer',
  },
  awareness: {
    title: 'Grow awareness',
    body: 'Help more people discover your business.',
    icon: 'megaphone',
    resultLabel: 'Store visits',
    resultOne: 'visit',
    costLabel: 'Cost per visit',
  },
}

export const goalOrder: GoalId[] = ['customers', 'visits', 'messages', 'product', 'awareness']

export const statusCopy: Record<CampaignStatus, { label: string; tone: string; explain: string }> = {
  draft: { label: 'Draft', tone: 'neutral', explain: 'This ad hasn’t been submitted yet.' },
  processing: { label: 'Processing', tone: 'info', explain: 'Qart is preparing your ad for each platform.' },
  in_review: {
    label: 'Under review',
    tone: 'info',
    explain: 'The platforms are checking your ad. This usually takes a few hours and can take up to 24.',
  },
  running: { label: 'Running', tone: 'good', explain: 'Your ad is live and people are seeing it.' },
  paused: { label: 'Paused', tone: 'warn', explain: 'Your ad is paused. Nothing is being spent until you resume it.' },
  completed: { label: 'Completed', tone: 'neutral', explain: 'This campaign has ended.' },
  rejected: { label: 'Not approved', tone: 'bad', explain: 'A platform didn’t approve this ad. See why below.' },
  failed: { label: 'Couldn’t publish', tone: 'bad', explain: 'Something went wrong on our side. Your money is safe.' },
}

export const ageBands: AgeBand[] = ['18-24', '25-34', '35-44', '45-54', '55+']

export const nigerianStates = [
  'Lagos',
  'Abuja (FCT)',
  'Rivers',
  'Oyo',
  'Kano',
  'Enugu',
  'Delta',
  'Kaduna',
  'Ogun',
  'Anambra',
  'Edo',
  'Kwara',
]

export const citiesByState: Record<string, string[]> = {
  Lagos: ['Lagos', 'Lekki', 'Ikeja', 'Yaba', 'Surulere', 'Ikorodu', 'Ajah'],
  'Abuja (FCT)': ['Abuja', 'Wuse', 'Garki', 'Maitama', 'Gwarinpa', 'Kubwa'],
  Rivers: ['Port Harcourt', 'Obio-Akpor', 'Bonny'],
  Oyo: ['Ibadan', 'Ogbomoso', 'Oyo'],
  Kano: ['Kano', 'Wudil'],
  Enugu: ['Enugu', 'Nsukka'],
  Delta: ['Asaba', 'Warri', 'Sapele'],
  Kaduna: ['Kaduna', 'Zaria'],
  Ogun: ['Abeokuta', 'Sagamu', 'Ijebu-Ode'],
  Anambra: ['Awka', 'Onitsha', 'Nnewi'],
  Edo: ['Benin City', 'Auchi'],
  Kwara: ['Ilorin', 'Offa'],
}

export const interestOptions = [
  'Fashion',
  'Streetwear',
  'Beauty & skincare',
  'Hair care',
  'Food & drink',
  'Restaurants',
  'Football',
  'Music',
  'Afrobeats',
  'Weddings',
  'Parenting',
  'Fitness',
  'Technology',
  'Phones & gadgets',
  'Home décor',
  'Travel',
  'Small business',
  'Online shopping',
  'Nollywood',
  'Church & faith',
]

export function describeAudience(a: Audience): string {
  const place = a.city && a.city !== a.state ? `${a.city}, ${a.state}` : a.state
  if (a.mode === 'auto') return `${place} · Chosen by Qart`
  const ages = a.ages.length === 0 || a.ages.length === ageBands.length ? 'All ages' : ageSummary(a.ages)
  const gender = a.gender === 'all' ? 'All genders' : a.gender === 'men' ? 'Men' : 'Women'
  return `${place} · ${ages} · ${gender}`
}

function ageSummary(ages: AgeBand[]): string {
  const sorted = [...ages].sort((x, y) => ageBands.indexOf(x) - ageBands.indexOf(y))
  const contiguous = sorted.every((b, i) => i === 0 || ageBands.indexOf(b) === ageBands.indexOf(sorted[i - 1]) + 1)
  if (!contiguous) return sorted.join(', ')
  const lo = sorted[0].split('-')[0].replace('+', '')
  const last = sorted[sorted.length - 1]
  return last === '55+' ? `${lo}+` : `${lo}–${last.split('-')[1]}`
}
