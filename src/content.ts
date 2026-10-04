/**
 * All page copy lives here so it can be checked line by line against the
 * source site (unyo-cultural-tourism-award.miztaatabo.chatgpt.site).
 *
 * Copy follows the source landing page; facts (grant, date, venue, forum,
 * eligibility, criteria, weights) must not change.
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
  intro:
    'For young Nigerians keeping our culture and traditions alive through tourism. One outstanding initiative. Recognition that helps the work continue.',
  note: 'Self-nominations and nominations of others welcome. Nominations are open.',
  primaryCta: 'Nominate now',
  secondaryCta: 'Explore the award',
}

export const manifesto = {
  lines: ['Rooted in heritage.', 'Built for the future.'],
  statement:
    'From community tours to indigenous food, crafts and heritage storytelling, young Nigerians are creating new ways to experience our culture.',
  body: ['This award recognises that work and supports its next chapter.'],
}

export const prize = {
  heading: 'Good work deserves room to grow.',
  intro: 'One outstanding initiative. Recognition that helps the work continue.',
  items: [
    { title: 'Development support grant', detail: '₦100,000 to support the winning venture’s cultural tourism work.' },
    { title: 'Award plaque', detail: 'A lasting recognition of your contribution.' },
    { title: 'Certificate of recognition', detail: 'Celebrating the initiative and the people behind it.' },
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
  intro:
    'Open to youth-led Nigerian startups, companies, social enterprises and organised initiatives with real cultural tourism work to show.',
  items: [
    {
      n: '01',
      title: 'Youth-led & Nigerian',
      detail: 'Founded or substantially led by a young Nigerian, with its main cultural tourism impact in Nigeria.',
      image: 'eligibility-youth',
    },
    {
      n: '02',
      title: 'Active in the past two years',
      detail: 'Show the activities you have carried out during the past two years, beyond an idea or a proposed project.',
      image: 'eligibility-active',
    },
    {
      n: '03',
      title: 'Evidence of impact',
      detail: 'Share social posts, videos, websites or other links that show your work, its consistency and who benefits.',
      image: 'eligibility-impact',
    },
  ],
}

export const culture = {
  heading: 'Culture in action',
  intro: 'Your work could include:',
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
  intro:
    'An independent jury will assess the substance of each nomination using a weighted framework. A small initiative making a deep difference in one community can stand alongside a much larger venture.',
  criteria: [
    { weight: 25, title: 'Cultural preservation & promotion' },
    { weight: 25, title: 'Demonstrated impact' },
    { weight: 15, title: 'Consistency of activity' },
    { weight: 15, title: 'Community involvement & local benefit' },
    { weight: 10, title: 'Innovation & quality of approach' },
    { weight: 10, title: 'Potential for continued impact' },
  ],
  juryNote: 'Jury members will declare relevant relationships and step aside where a conflict of interest exists.',
}

export const impact = {
  a: 'Impact',
  b: 'Popularity',
  statement: 'Impact over popularity.',
  detail:
    'No public voting. Followers and likes do not determine the winner. Social links help verify activity and engagement.',
}

export const nominate = {
  heading: 'Know an initiative worth recognising?',
  status: 'Nominations are open',
  routes: [
    { title: 'Nominate yourself', detail: 'Nominate your own venture.' },
    { title: 'Nominate someone else', detail: 'Or someone whose work deserves a wider audience.' },
  ],
  cta: 'Nominate now',
  checklistHeading: 'What to have ready',
  checklistIntro: 'Start gathering the evidence that tells the story.',
  checklist: [
    { key: 'People', title: 'The people behind the work', detail: 'Organisation name, founder or lead, location and contact details.' },
    { key: 'Story', title: 'Your cultural tourism story', detail: 'What you do, the culture or traditions you promote, and your activities during the past two years.' },
    { key: 'Evidence', title: 'Evidence we can see', detail: 'Social media or website links, examples of activities and evidence of community benefit.' },
    { key: 'Next step', title: 'The next step', detail: 'How the ₦100,000 would support your work if selected.' },
  ],
}

export const faq = [
  {
    q: 'Can I nominate myself?',
    a: 'Yes. You can nominate your own organisation or another eligible initiative. Provide evidence that the jury can review.',
  },
  {
    q: 'Do I need a large social media following?',
    a: 'No. Social links are evidence of activity and engagement. The jury prioritises cultural impact, consistent work and community benefit.',
  },
  {
    q: 'Does the initiative need to be a registered company?',
    a: 'The award welcomes startups, companies, social enterprises and formally or informally organised initiatives. The work must be real, youth-led and verifiable.',
  },
  {
    q: 'What does “active during the past two years” mean?',
    a: 'Share the cultural tourism activities undertaken within the last two years and evidence of consistency. The date of registration alone does not demonstrate activity.',
  },
  {
    q: 'When and where will the award be presented?',
    a: 'The inaugural award is planned for 29 October 2026 at the 14th Youth Tourism & Hospitality Leaders Forum in Ibadan, Nigeria.',
  },
]

export const nav = [
  { href: '#award', label: 'The award' },
  { href: '#qualify', label: 'Who qualifies' },
  { href: '#judging', label: 'Judging' },
  { href: '#nominate', label: 'Nominate' },
  { href: '#faq', label: 'FAQ' },
]
