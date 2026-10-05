import type {
  AgeBand,
  Audience,
  Campaign,
  ChannelId,
  DailyPoint,
  PlatformId,
  PlatformStats,
  Product,
} from '../types'
import { productArt } from './productArt'
import { addDays, isoDate, today } from '../utils/dates'
import { fees } from '../utils/estimates'

export const products: Product[] = [
  { id: 'p-bag', name: 'Classic Leather Bag', price: 45000, stock: 14, category: 'Bags', art: 'bag' },
  { id: 'p-shorts', name: 'Brown Cargo Shorts', price: 18500, stock: 32, category: 'Clothing', art: 'shorts' },
  { id: 'p-ankara', name: 'Ankara Wrap Dress', price: 27000, stock: 6, category: 'Clothing', art: 'ankara' },
  { id: 'p-sneakers', name: 'Canvas Sneakers', price: 22000, stock: 0, category: 'Shoes', art: 'sneakers' },
  { id: 'p-shea', name: 'Whipped Shea Butter 250g', price: 6500, stock: 48, category: 'Beauty', art: 'shea' },
  { id: 'p-phone', name: 'Tecno Spark 20 Pro', price: 189000, stock: 3, category: 'Electronics', art: 'phone' },
]

/** Small deterministic PRNG so seeded charts look the same on every load. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

interface SeriesSpec {
  seed: number
  days: number
  start: string
  dailySpend: number
  cpm: number
  ctr: number
  cvr: number
  aov: number
}

function series({ seed, days, start, dailySpend, cpm, ctr, cvr, aov }: SeriesSpec): DailyPoint[] {
  const r = rng(seed)
  return Array.from({ length: days }, (_, i) => {
    // Delivery ramps over the first days while platforms learn, then wobbles.
    const ramp = Math.min(1, 0.55 + i * 0.15)
    const spend = Math.round(dailySpend * ramp * (0.85 + r() * 0.3))
    const impressions = Math.round((spend / cpm) * 1000)
    const reach = Math.round(impressions * (0.62 + r() * 0.1))
    const clicks = Math.round(impressions * ctr * (0.8 + r() * 0.4))
    const results = Math.round(clicks * cvr * (0.75 + r() * 0.5))
    const revenue = Math.round((results * aov * (0.8 + r() * 0.4)) / 100) * 100
    return { date: addDays(start, i), spend, reach, impressions, clicks, results, revenue }
  })
}

function sum(points: DailyPoint[]) {
  return points.reduce(
    (t, p) => ({
      spend: t.spend + p.spend,
      reach: t.reach + p.reach,
      impressions: t.impressions + p.impressions,
      clicks: t.clicks + p.clicks,
      results: t.results + p.results,
      revenue: t.revenue + p.revenue,
    }),
    { spend: 0, reach: 0, impressions: 0, clicks: 0, results: 0, revenue: 0 },
  )
}

/** Splits totals across platforms. Shares are per platform; cost multipliers skew cost per result. */
function split(
  totals: ReturnType<typeof sum>,
  shares: Partial<Record<PlatformId, { spend: number; efficiency: number }>>,
): PlatformStats[] {
  const entries = Object.entries(shares) as [PlatformId, { spend: number; efficiency: number }][]
  const weight = entries.reduce((t, [, s]) => t + s.spend * s.efficiency, 0)
  return entries.map(([platform, s]) => {
    const resultShare = (s.spend * s.efficiency) / weight
    return {
      platform,
      spend: Math.round(totals.spend * s.spend),
      reach: Math.round(totals.reach * s.spend),
      impressions: Math.round(totals.impressions * s.spend),
      clicks: Math.round(totals.clicks * resultShare),
      results: Math.round(totals.results * resultShare),
      revenue: Math.round(totals.revenue * resultShare),
    }
  })
}

const lagos: Audience = {
  mode: 'auto',
  country: 'Nigeria',
  state: 'Lagos',
  city: 'Lagos',
  radiusKm: 20,
  ages: ['18-24', '25-34', '35-44'],
  gender: 'all',
  interests: [],
}

const insights = (top: [string, number][], ages: number[], women: number) => ({
  topLocations: top.map(([name, share]) => ({ name, share })),
  ages: (['18-24', '25-34', '35-44', '45-54', '55+'] as AgeBand[]).map((band, i) => ({ band, share: ages[i] })),
  gender: { women, men: 1 - women },
})

const art = (key: string) => ({ id: `m-${key}`, type: 'image' as const, url: productArt[key], art: key })

interface Seed {
  id: string
  name: string
  objective: Campaign['objective']
  status: Campaign['status']
  channels: ChannelId[]
  productId: string
  headline: string
  primaryText: string
  callToAction: Campaign['creative']['callToAction']
  audience?: Partial<Audience>
  budget: Campaign['budget']
  startOffset: number
  deliveredDays: number
  spec: Omit<SeriesSpec, 'days' | 'start'>
  shares: Partial<Record<PlatformId, { spend: number; efficiency: number }>>
  insights?: Campaign['insights']
  issue?: Campaign['issue']
  template?: Campaign['creative']['template']
}

function build(s: Seed): Campaign {
  const product = products.find((p) => p.id === s.productId)!
  const start = addDays(today(), s.startOffset)
  const daily = s.deliveredDays > 0 ? series({ ...s.spec, days: s.deliveredDays, start }) : []
  const totals = sum(daily)
  const total = s.budget.type === 'daily' ? s.budget.amount * s.budget.durationDays : s.budget.amount
  const created = `${addDays(start, -1)}T10:24:00.000Z`
  return {
    id: s.id,
    name: s.name,
    objective: s.objective,
    status: s.status,
    channels: s.channels,
    promoted: { kind: 'product', productId: product.id, name: product.name, price: product.price, art: product.art },
    creative: {
      media: [art(product.art)],
      headline: s.headline,
      primaryText: s.primaryText,
      callToAction: s.callToAction,
      template: s.template,
    },
    audience: { ...lagos, ...s.audience },
    budget: s.budget,
    startDate: start,
    endDate: addDays(start, s.budget.durationDays - 1),
    paid: s.status === 'failed' ? 0 : fees(total).total,
    ...totals,
    daily,
    byPlatform: daily.length ? split(totals, s.shares) : [],
    insights: s.insights,
    issue: s.issue,
    createdAt: created,
    updatedAt: `${isoDate(new Date())}T08:00:00.000Z`,
  }
}

export function seedCampaigns(): Campaign[] {
  const seeds: Seed[] = [
    {
      id: 'c-summer',
      name: 'Summer Collection',
      objective: 'customers',
      status: 'running',
      channels: ['instagram', 'facebook', 'tiktok'],
      productId: 'p-bag',
      headline: 'The bag that goes everywhere',
      primaryText: 'Hand-finished leather, built for Lagos days. Free delivery on the mainland this week.',
      callToAction: 'Shop now',
      budget: { type: 'total', amount: 50000, durationDays: 10 },
      startOffset: -6,
      deliveredDays: 7,
      spec: { seed: 11, dailySpend: 5600, cpm: 1050, ctr: 0.021, cvr: 0.24, aov: 1520 },
      shares: { meta: { spend: 0.58, efficiency: 0.85 }, tiktok: { spend: 0.42, efficiency: 1.25 } },
      insights: insights([['Lekki', 0.31], ['Ikeja', 0.24], ['Yaba', 0.17], ['Surulere', 0.12]], [0.22, 0.41, 0.24, 0.09, 0.04], 0.64),
    },
    {
      id: 'c-cargo',
      name: 'Cargo Shorts Launch',
      objective: 'product',
      status: 'running',
      channels: ['tiktok', 'snapchat'],
      productId: 'p-shorts',
      headline: 'New season. New energy.',
      primaryText: 'Our premium brown cargo shorts are here. Six pockets, zero stress. Shop now.',
      callToAction: 'Shop now',
      template: 'bold',
      audience: { mode: 'manual', ages: ['18-24', '25-34'], gender: 'men', interests: ['Streetwear', 'Football'], radiusKm: 30 },
      budget: { type: 'daily', amount: 3200, durationDays: 7 },
      startOffset: -5,
      deliveredDays: 6,
      spec: { seed: 29, dailySpend: 4000, cpm: 760, ctr: 0.018, cvr: 0.13, aov: 18500 },
      shares: { tiktok: { spend: 0.66, efficiency: 1.3 }, snapchat: { spend: 0.34, efficiency: 0.75 } },
      insights: insights([['Yaba', 0.28], ['Ikeja', 0.22], ['Ajah', 0.19], ['Festac', 0.11]], [0.46, 0.38, 0.1, 0.04, 0.02], 0.18),
    },
    {
      id: 'c-shea',
      name: 'Shea Butter Chats',
      objective: 'messages',
      status: 'in_review',
      channels: ['instagram'],
      productId: 'p-shea',
      headline: 'Soft skin, naturally',
      primaryText: 'Whipped shea butter from Kwara, made in small batches. Send us a message to order.',
      callToAction: 'Send message',
      budget: { type: 'daily', amount: 3000, durationDays: 7 },
      startOffset: 0,
      deliveredDays: 0,
      spec: { seed: 3, dailySpend: 0, cpm: 1, ctr: 0, cvr: 0, aov: 0 },
      shares: {},
    },
    {
      id: 'c-store',
      name: 'Visit Dalmont Store',
      objective: 'awareness',
      status: 'paused',
      channels: ['facebook', 'instagram'],
      productId: 'p-ankara',
      headline: 'Everything Dalmont, one link',
      primaryText: 'Bags, clothing and beauty, delivered across Lagos. See what is new this week.',
      callToAction: 'Visit store',
      budget: { type: 'total', amount: 30000, durationDays: 14 },
      startOffset: -12,
      deliveredDays: 5,
      spec: { seed: 41, dailySpend: 2100, cpm: 620, ctr: 0.009, cvr: 0.06, aov: 21000 },
      shares: { meta: { spend: 1, efficiency: 1 } },
      insights: insights([['Ikeja', 0.27], ['Lekki', 0.2], ['Ikorodu', 0.16], ['Yaba', 0.14]], [0.2, 0.37, 0.25, 0.12, 0.06], 0.58),
    },
    {
      id: 'c-ankara',
      name: 'Ankara Independence Sale',
      objective: 'customers',
      status: 'completed',
      channels: ['instagram', 'tiktok'],
      productId: 'p-ankara',
      headline: '20% off for Independence Day',
      primaryText: 'Celebrate in colour. Our Ankara wrap dresses are 20% off until 3 October.',
      callToAction: 'Order now',
      template: 'sale',
      budget: { type: 'daily', amount: 5000, durationDays: 7 },
      startOffset: -11,
      deliveredDays: 7,
      spec: { seed: 7, dailySpend: 5000, cpm: 980, ctr: 0.019, cvr: 0.09, aov: 26000 },
      shares: { meta: { spend: 0.5, efficiency: 0.9 }, tiktok: { spend: 0.5, efficiency: 1.1 } },
      insights: insights([['Lekki', 0.26], ['Ikeja', 0.23], ['Victoria Island', 0.2], ['Yaba', 0.1]], [0.18, 0.44, 0.26, 0.09, 0.03], 0.81),
    },
    {
      id: 'c-sneakers',
      name: 'Sneaker Drop',
      objective: 'product',
      status: 'rejected',
      channels: ['instagram', 'facebook'],
      productId: 'p-sneakers',
      headline: 'Best price in Nigeria',
      primaryText: 'Canvas sneakers at the best price in Nigeria, guaranteed. Limited pairs.',
      callToAction: 'Shop now',
      budget: { type: 'daily', amount: 3000, durationDays: 5 },
      startOffset: -1,
      deliveredDays: 0,
      spec: { seed: 5, dailySpend: 0, cpm: 1, ctr: 0, cvr: 0, aov: 0 },
      shares: {},
      issue: {
        title: 'Meta didn’t approve this ad',
        detail:
          'Phrases like “best price in Nigeria, guaranteed” are treated as claims Meta can’t check. Remove them and resubmit. Your ₦15,484 is still in your campaign and hasn’t been spent.',
        platform: 'meta',
        action: 'edit_creative',
      },
    },
    {
      id: 'c-phone',
      name: 'Spark 20 Pro Deals',
      objective: 'messages',
      status: 'failed',
      channels: ['snapchat'],
      productId: 'p-phone',
      headline: 'Spark 20 Pro in stock',
      primaryText: 'Brand new, sealed, with 12-month warranty. Chat with us for today’s price.',
      callToAction: 'Send message',
      budget: { type: 'daily', amount: 2500, durationDays: 5 },
      startOffset: 0,
      deliveredDays: 0,
      spec: { seed: 9, dailySpend: 0, cpm: 1, ctr: 0, cvr: 0, aov: 0 },
      shares: {},
      issue: {
        title: 'We couldn’t publish your ad to Snapchat',
        detail: 'There was a problem connecting to Snapchat. Your money hasn’t been charged.',
        platform: 'snapchat',
        action: 'retry',
      },
    },
  ]
  return seeds.map(build)
}
