import type { ChannelId, GoalId, PlatformId } from '../../types'
import type { AdPlatformAdapter, PublishResult } from './types'

export type { AdPlatformAdapter, CreativeCheck, PublishResult } from './types'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function mockPublish(prefix: string): Promise<PublishResult> {
  await wait(700)
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { ok: false, rawError: `${prefix.toUpperCase()}_NETWORK_UNREACHABLE` }
  }
  return { ok: true, externalId: `${prefix}_${Math.random().toString(36).slice(2, 10)}` }
}

const meta: AdPlatformAdapter = {
  id: 'meta',
  name: 'Meta',
  channels: ['instagram', 'facebook'],
  minDailyBudget: 1000,
  mapObjective: (goal: GoalId) =>
    ({
      customers: 'OUTCOME_SALES',
      visits: 'OUTCOME_TRAFFIC',
      messages: 'OUTCOME_ENGAGEMENT',
      product: 'OUTCOME_SALES',
      awareness: 'OUTCOME_AWARENESS',
    })[goal],
  checkCreative: (draft) =>
    draft.creative.primaryText.length > 500
      ? { ok: false, message: 'Instagram and Facebook cut off very long text. Keep it under 500 characters.' }
      : { ok: true },
  publish: () => mockPublish('meta'),
}

const tiktok: AdPlatformAdapter = {
  id: 'tiktok',
  name: 'TikTok',
  channels: ['tiktok'],
  minDailyBudget: 2500,
  mapObjective: (goal: GoalId) =>
    ({
      customers: 'WEB_CONVERSIONS',
      visits: 'TRAFFIC',
      messages: 'COMMUNITY_INTERACTION',
      product: 'PRODUCT_SALES',
      awareness: 'REACH',
    })[goal],
  checkCreative: (draft) =>
    draft.creative.media.length === 0
      ? { ok: false, message: 'TikTok needs a photo or video.' }
      : { ok: true },
  publish: () => mockPublish('tiktok'),
}

const snapchat: AdPlatformAdapter = {
  id: 'snapchat',
  name: 'Snapchat',
  channels: ['snapchat'],
  minDailyBudget: 2000,
  mapObjective: (goal: GoalId) =>
    ({
      customers: 'SALES',
      visits: 'TRAFFIC',
      messages: 'ENGAGEMENT',
      product: 'SALES',
      awareness: 'AWARENESS',
    })[goal],
  checkCreative: (draft) =>
    draft.creative.headline.length > 34
      ? { ok: false, message: 'Snapchat headlines must be 34 characters or fewer.' }
      : { ok: true },
  publish: () => mockPublish('snapchat'),
}

export const platformAdapters: Record<PlatformId, AdPlatformAdapter> = { meta, tiktok, snapchat }

export const channelPlatform: Record<ChannelId, PlatformId> = {
  instagram: 'meta',
  facebook: 'meta',
  tiktok: 'tiktok',
  snapchat: 'snapchat',
}

export const channelLabels: Record<ChannelId, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
}

export const platformLabels: Record<PlatformId, string> = {
  meta: 'Meta',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
}

export function platformsFor(channels: ChannelId[]): PlatformId[] {
  return [...new Set(channels.map((c) => channelPlatform[c]))]
}
