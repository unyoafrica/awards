/**
 * Advertising domain model. Platform-specific detail (objectives, ad sets, pixels)
 * lives behind the adapters in services/platforms; these types are what the
 * merchant-facing screens work with.
 */

export type PlatformId = 'meta' | 'tiktok' | 'snapchat'

/** Where an ad appears, in merchant language. Each channel belongs to one platform. */
export type ChannelId = 'instagram' | 'facebook' | 'tiktok' | 'snapchat'

export type GoalId = 'customers' | 'visits' | 'messages' | 'product' | 'awareness'

export type CampaignStatus =
  | 'draft'
  | 'processing'
  | 'in_review'
  | 'running'
  | 'paused'
  | 'completed'
  | 'rejected'
  | 'failed'

export type PromotedKind = 'product' | 'storefront' | 'service' | 'custom'

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  art: string
}

export interface PromotedItem {
  kind: PromotedKind
  productId?: string
  name: string
  price?: number
  art?: string
  url?: string
}

export type MediaType = 'image' | 'video'

export interface CreativeMedia {
  id: string
  type: MediaType
  url: string
  /** Built-in product art key, used when the merchant picks an existing product image. */
  art?: string
  name?: string
}

export type CreativeTemplate = 'clean' | 'bold' | 'sale'

export interface Creative {
  media: CreativeMedia[]
  headline: string
  primaryText: string
  callToAction: CallToAction
  /** Set when the merchant used "Design with AI"; previews render the template over the media. */
  template?: CreativeTemplate
}

export type CallToAction = 'Shop now' | 'Order now' | 'Send message' | 'Learn more' | 'Visit store'

export type Gender = 'all' | 'men' | 'women'
export type AgeBand = '18-24' | '25-34' | '35-44' | '45-54' | '55+'

export interface Audience {
  mode: 'auto' | 'manual'
  country: string
  state: string
  city: string
  radiusKm: number
  ages: AgeBand[]
  gender: Gender
  interests: string[]
}

export interface Budget {
  type: 'daily' | 'total'
  /** Naira. For daily budgets this is per day; for total budgets, the whole campaign. */
  amount: number
  durationDays: number
}

export interface DailyPoint {
  date: string
  spend: number
  reach: number
  impressions: number
  clicks: number
  results: number
  revenue: number
}

export interface PlatformStats {
  platform: PlatformId
  spend: number
  reach: number
  impressions: number
  clicks: number
  results: number
  revenue: number
}

export interface AudienceInsights {
  topLocations: { name: string; share: number }[]
  ages: { band: AgeBand; share: number }[]
  gender: { women: number; men: number }
}

export interface CampaignIssue {
  /** Human-readable title, never a raw platform code. */
  title: string
  detail: string
  platform?: PlatformId
  action: 'edit_creative' | 'retry' | 'contact_support'
}

export interface Campaign {
  id: string
  name: string
  objective: GoalId
  status: CampaignStatus
  channels: ChannelId[]
  promoted: PromotedItem
  creative: Creative
  audience: Audience
  budget: Budget
  startDate: string
  endDate: string
  /** Amount the merchant paid in, including fees. */
  paid: number
  spend: number
  reach: number
  impressions: number
  clicks: number
  results: number
  revenue: number
  daily: DailyPoint[]
  byPlatform: PlatformStats[]
  insights?: AudienceInsights
  issue?: CampaignIssue
  createdAt: string
  updatedAt: string
}

export interface CampaignDraft {
  name: string
  objective?: GoalId
  promoted?: PromotedItem
  creative: Creative
  channels: ChannelId[]
  audience: Audience
  budget: Budget
}

export interface Estimate {
  dailyReach: [number, number]
  totalReach: [number, number]
  results: [number, number]
  resultLabel: string
}

export type PaymentMethodId = 'balance' | 'transfer' | 'card'
