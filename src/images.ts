/**
 * Image manifest and shot list.
 *
 * Drop a photo into `src/assets/photos/` named after its key
 * (e.g. `hero-guide.jpg`, `.jpeg`, `.webp` or `.avif`) and it replaces the
 * placeholder plate automatically. `alt` describes the intended photograph;
 * update it to describe the real one when the file lands.
 *
 * Direction: documentary, natural light, real Nigerian people and places.
 * No staged corporate stock, no safari, no decorative "tribal" graphics.
 */

const files = import.meta.glob<string>('./assets/photos/*.{jpg,jpeg,webp,avif,png}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const byKey: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  const key = path.split('/').pop()!.replace(/\.[^.]+$/, '')
  byKey[key] = url
}

export type Tone = 'forest' | 'gold' | 'earth' | 'ink'

export type Shot = {
  alt: string
  /** What to photograph. Shown on the placeholder plate until a file exists. */
  brief: string
  tone: Tone
  /** CSS object-position for the crop. */
  focus?: string
}

export const shots = {
  'hero-guide': {
    alt: 'A young guide leads visitors through a heritage site in Ibadan',
    brief: 'Portrait crop. A young Nigerian guide mid-story, visitors blurred behind. Late-afternoon light.',
    tone: 'earth',
    focus: '50% 30%',
  },
  'hero-detail': {
    alt: 'Close-up of hands dyeing adire cloth',
    brief: 'Tight detail. Hands at work on a craft: adire dyeing, beadwork or weaving.',
    tone: 'forest',
  },
  'manifesto': {
    alt: 'A festival procession moving through a Nigerian town',
    brief: 'Wide, cinematic. A festival or procession, people carrying tradition through the street.',
    tone: 'ink',
  },
  'award-plaque': {
    alt: 'The Unyo Africa Cultural Tourism Impact Award plaque',
    brief: 'The award plaque, photographed straight on, soft shadow.',
    tone: 'gold',
  },
  'eligibility-youth': {
    alt: 'Young founders of a cultural tourism initiative',
    brief: 'The people behind an initiative: a small youth-led team, candid.',
    tone: 'forest',
  },
  'eligibility-active': {
    alt: 'A cultural tour in progress',
    brief: 'Activity in motion: a tour, a workshop, a market visit.',
    tone: 'earth',
  },
  'eligibility-impact': {
    alt: 'Community members taking part in a cultural tourism activity',
    brief: 'Community benefit: local hosts, artisans or vendors with visitors.',
    tone: 'gold',
  },
  'culture-heritage': {
    alt: 'Visitors on a heritage tour',
    brief: 'Heritage tour: a historic site, palace, shrine or old quarter with a guide.',
    tone: 'earth',
  },
  'culture-festivals': {
    alt: 'Dancers at a traditional festival',
    brief: 'Festival or traditional ceremony, colour and movement.',
    tone: 'gold',
  },
  'culture-food': {
    alt: 'A cook preparing a traditional Nigerian dish',
    brief: 'Food: hands, fire, pots, a dish being shared.',
    tone: 'earth',
  },
  'culture-crafts': {
    alt: 'An artisan at work on a traditional craft',
    brief: 'Craft: weaving, carving, dyeing, beadwork, pottery.',
    tone: 'forest',
  },
  'culture-storytelling': {
    alt: 'A storyteller speaking to a gathered audience',
    brief: 'Storytelling: a griot, elder or young creator telling a story to listeners.',
    tone: 'ink',
  },
  'culture-community': {
    alt: 'Hosts welcoming visitors in their community',
    brief: 'Community tourism: a village or neighbourhood hosting visitors.',
    tone: 'forest',
  },
  'nominate': {
    alt: 'A young cultural entrepreneur looking toward the camera',
    brief: 'A confident portrait of a young cultural entrepreneur in their own setting.',
    tone: 'forest',
    focus: '50% 25%',
  },
} satisfies Record<string, Shot>

export type ShotKey = keyof typeof shots

export function getShot(key: ShotKey): Shot & { src?: string } {
  return { ...shots[key], src: byKey[key] }
}
