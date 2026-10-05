/**
 * Image manifest and shot list.
 *
 * Drop a photo into `src/assets/photos/` named after its key
 * (e.g. `hero-guide.jpg`, `.jpeg`, `.webp` or `.avif`) and it replaces the
 * placeholder plate automatically. `alt` describes the intended photograph;
 * update it to describe the real one when the file lands.
 *
 * Direction: documentary, natural light, real Nigerian people and places.
 * Current photos are free-licence Freepik stock (see docs/photo-shortlist.md);
 * replace with Únyọ's own photography as it becomes available.
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
    alt: 'A dancer in a coral-bead headdress and checked wrapper performs with a fly-whisk beside a drummer',
    brief: 'Portrait crop. A young Nigerian guide mid-story, visitors blurred behind. Late-afternoon light.',
    tone: 'earth',
    focus: '58% 35%',
  },
  'hero-detail': {
    alt: 'Close-up of hands wringing cloth over a bowl of natural dye',
    brief: 'Tight detail. Hands at work on a craft: adire dyeing, beadwork or weaving.',
    tone: 'forest',
    focus: '50% 40%',
  },
  'award-plaque': {
    alt: 'A smiling woman in a green and gold headwrap holds the Africa-shaped Únyọ Cultural Tourism Impact Award 2026 on stage',
    brief: 'The award plaque held on stage, the Únyọ logo on screen behind.',
    tone: 'gold',
    focus: '45% 45%',
  },
  'culture-heritage': {
    alt: 'Musicians in traditional dress play drums in front of carved wooden shutters',
    brief: 'Heritage tour: a historic site, palace, shrine or old quarter with a guide.',
    tone: 'earth',
    focus: '55% 50%',
  },
  'culture-festivals': {
    alt: 'Festival dancers in checked wrappers, a drummer behind them',
    brief: 'Festival or traditional ceremony, colour and movement.',
    tone: 'gold',
    focus: '50% 55%',
  },
  'culture-food': {
    alt: 'Grilled meat skewers, chicken and roast plantain with pounded yam and a fresh salad on a banana leaf',
    brief: 'Food: hands, fire, pots, a dish being shared.',
    tone: 'earth',
    focus: '50% 45%',
  },
  'culture-crafts': {
    alt: 'A woman weaves on a wooden hand loom',
    brief: 'Craft: weaving, carving, dyeing, beadwork, pottery.',
    tone: 'forest',
    focus: '45% 50%',
  },
  'culture-storytelling': {
    alt: 'Drummers in coral beads and red caps play hand drums',
    brief: 'Storytelling: a griot, elder or young creator telling a story to listeners.',
    tone: 'ink',
    focus: '60% 50%',
  },
  'culture-community': {
    alt: 'Three people talk and laugh together in a green farm field',
    brief: 'Community tourism: a village or neighbourhood hosting visitors.',
    tone: 'forest',
    focus: '50% 45%',
  },
  'nominate': {
    alt: 'A woman in an ankara-print jacket holds a large green leaf against a clear sky',
    brief: 'A confident portrait of a young cultural entrepreneur in their own setting.',
    tone: 'forest',
    focus: '55% 70%',
  },
} satisfies Record<string, Shot>

export type ShotKey = keyof typeof shots

export function getShot(key: ShotKey): Shot & { src?: string } {
  return { ...shots[key], src: byKey[key] }
}
