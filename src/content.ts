/**
 * All page copy lives here so it can be checked line by line against the
 * source site (unyo-cultural-tourism-award.miztaatabo.chatgpt.site).
 *
 * Facts (grant, date, venue, forum, eligibility, criteria, weights) are taken
 * from the project brief and must not change. Strings marked `VERIFY` are
 * short connective copy written for this build because the source could not
 * be reached; replace them with the source wording where it differs.
 */

export const award = {
  name: 'Únyọ Africa Cultural Tourism Impact Award',
  shortName: 'Cultural Tourism Impact Award',
  year: '2026',
  edition: 'Inaugural edition',
  grant: '₦100,000',
  grantLabel: 'Development support grant',
  date: '29 October 2026',
  city: 'Ibadan, Nigeria',
  forum: '14th Youth Tourism & Hospitality Leaders Forum',
  organiser: 'Únyọ Africa',
  foundation: 'Comemakewego Tourism Africa Foundation',
}

export const hero = {
  lines: ['Our culture.', 'Our stories.', 'Your impact.'],
  // VERIFY: supporting line.
  intro:
    'An award for youth-led Nigerian initiatives using cultural tourism to keep heritage alive and create real impact in their communities.',
  primaryCta: 'Prepare your nomination',
  secondaryCta: 'See who qualifies',
}

export const manifesto = {
  lines: ['Rooted in heritage.', 'Built for the future.'],
  statement:
    'Culture is not something we preserve behind glass. It is something people are actively carrying forward.',
  // VERIFY: body copy.
  body: [
    'Across Nigeria, young people are guiding heritage walks, staging festivals, cooking the food of their grandparents and teaching crafts to visitors. That work protects culture and brings tourism home to communities.',
    'The Únyọ Africa Cultural Tourism Impact Award exists to recognise it.',
  ],
}

export const prize = {
  // VERIFY: section heading and intro.
  heading: 'What the winner receives',
  intro:
    'One initiative will be recognised for the impact of its cultural tourism work.',
  items: [
    { title: 'Development support grant', detail: '₦100,000 to support the next stage of the work.' },
    { title: 'Award plaque', detail: 'A plaque marking the inaugural award.' },
    { title: 'Certificate of recognition', detail: 'Formal recognition of the initiative and the people behind it.' },
  ],
  presentation: {
    label: 'Presented at the',
    forum: award.forum,
    date: award.date,
    city: award.city,
  },
}

export const eligibility = {
  heading: 'Who qualifies',
  // VERIFY: intro and the detail line under each requirement.
  intro: 'Initiatives must meet all three requirements.',
  items: [
    {
      n: '01',
      title: 'Youth-led & Nigerian',
      detail: 'The initiative is led by young people and based in Nigeria.',
      image: 'eligibility-youth',
    },
    {
      n: '02',
      title: 'Active in the past two years',
      detail: 'The work has been running within the last two years.',
      image: 'eligibility-active',
    },
    {
      n: '03',
      title: 'Evidence of impact',
      detail: 'You can show what the work has changed, for people and for culture.',
      image: 'eligibility-impact',
    },
  ],
}

export const culture = {
  heading: 'Culture in action',
  // VERIFY: intro.
  intro: 'The award celebrates cultural tourism in all its forms, including:',
  areas: [
    { title: 'Heritage tours', image: 'culture-heritage' },
    { title: 'Festivals & traditions', image: 'culture-festivals' },
    { title: 'Food & culinary experiences', image: 'culture-food' },
    { title: 'Arts & crafts', image: 'culture-crafts' },
    { title: 'Cultural storytelling', image: 'culture-storytelling' },
    { title: 'Community tourism', image: 'culture-community' },
  ],
}

export const judging = {
  heading: 'How we judge',
  // VERIFY: intro.
  intro: 'Every eligible nomination is scored against six weighted criteria.',
  criteria: [
    { weight: 25, title: 'Cultural preservation & promotion' },
    { weight: 25, title: 'Demonstrated impact' },
    { weight: 15, title: 'Consistency of activity' },
    { weight: 15, title: 'Community involvement & local benefit' },
    { weight: 10, title: 'Innovation & quality of approach' },
    { weight: 10, title: 'Potential for continued impact' },
  ],
}

export const impact = {
  a: 'Impact',
  b: 'Popularity',
  statement: 'Impact over popularity.',
  detail: 'No public voting. Followers and likes do not determine the winner.',
}

export const nominate = {
  heading: 'Know an initiative worth recognising?',
  status: 'Nominations opening soon',
  // VERIFY: wording of the two nomination routes.
  routes: [
    { title: 'Nominate yourself', detail: 'Self-nominations are welcome.' },
    { title: 'Nominate someone else', detail: 'You can nominate an initiative you know.' },
  ],
  cta: 'Prepare your nomination',
  checklistHeading: 'What to prepare',
  checklistIntro: 'Get these four things ready before nominations open.',
  // VERIFY: the detail line under each checklist item.
  checklist: [
    { key: 'People', title: 'The people behind the work', detail: 'Who leads the initiative, and who makes it happen.' },
    { key: 'Story', title: 'Your cultural tourism story', detail: 'What you do, where, and the culture it carries forward.' },
    { key: 'Evidence', title: 'Evidence we can see', detail: 'Photos, links, numbers or testimonies that show the work and its impact.' },
    { key: 'Next step', title: 'The next step', detail: 'Where the initiative goes next, and how the grant would help.' },
  ],
}

// VERIFY: replace with the source FAQ wording. Every answer below restates
// facts already given in the brief; nothing new is claimed.
export const faq = [
  {
    q: 'Who can be nominated?',
    a: 'Youth-led Nigerian initiatives that have been active in the past two years and can show evidence of impact.',
  },
  {
    q: 'Can I nominate my own initiative?',
    a: 'Yes. Self-nominations are welcome, and you can also nominate an initiative run by someone else.',
  },
  {
    q: 'Is there public voting?',
    a: 'No. There is no public voting, and followers and likes do not determine the winner. Nominations are judged on six weighted criteria.',
  },
  {
    q: 'What does the winner receive?',
    a: 'A ₦100,000 development support grant, an award plaque and a certificate of recognition.',
  },
  {
    q: 'When and where is the award presented?',
    a: 'On 29 October 2026 in Ibadan, Nigeria, at the 14th Youth Tourism & Hospitality Leaders Forum.',
  },
  {
    q: 'When do nominations open?',
    a: 'Nominations are opening soon. Use the checklist on this page to prepare in the meantime.',
  },
]

export const nav = [
  { href: '#award', label: 'The award' },
  { href: '#qualify', label: 'Who qualifies' },
  { href: '#judging', label: 'Judging' },
  { href: '#nominate', label: 'Nominate' },
  { href: '#faq', label: 'FAQ' },
]
