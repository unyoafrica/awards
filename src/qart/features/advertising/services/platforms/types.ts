import type { CampaignDraft, ChannelId, GoalId, PlatformId } from '../../types'

export interface CreativeCheck {
  ok: boolean
  /** Merchant-facing explanation when the creative won't work on this platform. */
  message?: string
}

export interface PublishResult {
  ok: boolean
  externalId?: string
  /** Raw platform error, kept for support logs. Never shown to the merchant. */
  rawError?: string
}

/**
 * Everything platform-specific sits behind this interface. Screens only ever
 * talk about goals, channels and budgets; each adapter translates them into
 * its own objectives, placements and limits.
 */
export interface AdPlatformAdapter {
  id: PlatformId
  name: string
  channels: ChannelId[]
  /** Smallest daily spend the platform will deliver against, in naira. */
  minDailyBudget: number
  /** Platform objective the merchant's goal maps to. Internal only. */
  mapObjective(goal: GoalId): string
  checkCreative(draft: CampaignDraft): CreativeCheck
  publish(draft: CampaignDraft): Promise<PublishResult>
}
