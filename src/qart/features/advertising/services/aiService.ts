import type { GoalId, PromotedItem } from '../types'
import { formatNaira } from '../utils/format'

/**
 * Mocked Qart AI writer. Swap the body of generateCopy for the Qart AI endpoint;
 * the screens only depend on the AdCopy shape.
 */
export interface AdCopy {
  headline: string
  primaryText: string
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function subjectFrom(prompt: string, promoted?: PromotedItem) {
  const cleaned = prompt
    .replace(/^(please\s+)?(promote|advertise|sell|push|market)\s+(my\s+|our\s+|the\s+)?/i, '')
    .replace(/[.!]+$/, '')
    .trim()
  return cleaned || promoted?.name || 'our latest collection'
}

export const aiService = {
  async generateCopy(prompt: string, goal: GoalId, promoted?: PromotedItem): Promise<AdCopy[]> {
    await wait(1400)
    const subject = subjectFrom(prompt, promoted)
    const Subject = capitalise(subject)
    const price = promoted?.price ? ` Just ${formatNaira(promoted.price)}.` : ''
    const action =
      goal === 'messages' ? 'Send us a message to order.' : goal === 'visits' || goal === 'awareness' ? 'Tap to see more.' : 'Shop now.'
    return [
      {
        headline: 'New season. New energy.',
        primaryText: `Our ${subject} ${/s$/i.test(subject) ? 'are' : 'is'} here.${price} ${action}`,
      },
      {
        headline: `${Subject.length > 28 ? 'Made for you' : Subject}, made for Lagos`.slice(0, 40),
        primaryText: `Quality you can feel, delivered to your door.${price} Limited stock. ${action}`,
      },
      {
        headline: 'Your new favourite is here',
        primaryText: `Everyone is asking about our ${subject}. Get yours before it sells out.${price} ${action}`,
      },
    ]
  },
}
