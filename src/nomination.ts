/**
 * Nomination form: questions, wording and limits match the existing
 * nomination form (unyo-cultural-tourism-award.miztaatabo.chatgpt.site/nominate).
 *
 * Submissions go to a Google Form. To connect one, follow
 * docs/google-form-setup.md, then fill in `googleForm` below:
 * `formId` is the long id in the form's public link (…/forms/d/e/<formId>/viewform)
 * and each `entries` value is that question's `entry.123456789` name, taken
 * from the form's "Get pre-filled link".
 */

export type Field =
  | { kind: 'text' | 'email' | 'tel' | 'url' | 'month'; name: string; label: string; required?: boolean; maxLength?: number; placeholder?: string; hint?: string; autoComplete?: string; half?: boolean }
  | { kind: 'number'; name: string; label: string; required?: boolean; min: number; max: number; hint?: string; half?: boolean }
  | { kind: 'textarea'; name: string; label: string; required?: boolean; maxLength: number; rows: number; placeholder?: string; hint?: string }
  | { kind: 'select'; name: string; label: string; required?: boolean; options: { value: string; label: string }[]; placeholder?: string; hint?: string; half?: boolean }
  | { kind: 'checkbox'; name: string; label: string; required?: boolean }

export type Section = {
  id: string
  n: string
  title: string
  intro?: string
  fields: Field[]
  note?: string
}

export const nominationPage = {
  title: 'Let the work be seen.',
  intro: 'Nominate a youth-led Nigerian venture promoting our culture, heritage and traditions through tourism.',
  juryNote:
    'An independent jury will prioritise demonstrated impact, consistent activity and community benefit. There is no public vote.',
  readyNote:
    'Have your evidence links ready. Fields marked * are required. Answers remain on this page if submission fails; they are not saved as a draft when you leave.',
  formHeading: 'Nomination form',
  formIntro:
    'Tell us what the initiative does and show us the difference it makes. Specific examples are more useful than broad claims.',
  submit: 'Submit nomination',
  submitting: 'Submitting…',
  submitNote: 'A submission is complete only when a confirmation and reference number appear below.',
  confirmation: {
    eyebrow: 'Nomination received',
    heading: 'Thank you for sharing the work.',
    body: 'Your nomination has been sent for award-team review. Keep your reference number for any follow-up.',
    referenceLabel: 'Your submission reference',
    footnote: 'This confirms receipt, not selection for the award. The team may contact you to verify the nomination.',
    back: 'Return to the award page',
  },
}

const categoryOptions = [
  'Heritage tours and experiences',
  'Festivals and traditions',
  'Food and culinary tourism',
  'Traditional arts, crafts and textiles',
  'Cultural storytelling and documentation',
  'Community-based tourism',
  'Digital cultural tourism platforms',
  'Other cultural tourism work',
]

const organisationTypes = [
  'Startup or company',
  'Social enterprise',
  'Community initiative',
  'Informal initiative or collective',
  'Other',
]

const opt = (values: string[]) => values.map((v) => ({ value: v, label: v }))

export const sections: Section[] = [
  {
    id: 'your-details',
    n: '01',
    title: 'Your details',
    intro: 'You can nominate your own organisation or another eligible initiative.',
    fields: [
      {
        kind: 'select',
        name: 'nominationType',
        label: 'Who are you nominating?',
        required: true,
        options: [
          { value: 'My own initiative', label: 'My own initiative' },
          { value: 'Another initiative', label: 'Another initiative' },
        ],
      },
      { kind: 'text', name: 'nominatorName', label: 'Your full name', required: true, maxLength: 150, autoComplete: 'name', half: true },
      { kind: 'email', name: 'nominatorEmail', label: 'Your email address', required: true, maxLength: 254, autoComplete: 'email', half: true },
      { kind: 'tel', name: 'nominatorPhone', label: 'Your phone number', maxLength: 40, autoComplete: 'tel' },
      {
        kind: 'textarea',
        name: 'relationship',
        label: 'How do you know this initiative?',
        maxLength: 500,
        rows: 2,
        hint: 'Please have permission to share the nominee’s contact details.',
      },
    ],
  },
  {
    id: 'initiative',
    n: '02',
    title: 'The initiative',
    fields: [
      { kind: 'text', name: 'organisation', label: 'Organisation or initiative name', required: true, maxLength: 180 },
      { kind: 'text', name: 'leadName', label: 'Founder or team lead’s full name', required: true, maxLength: 150, half: true },
      { kind: 'number', name: 'leadAge', label: 'Founder or team lead’s age', required: true, min: 1, max: 120, half: true },
      { kind: 'email', name: 'email', label: 'Initiative’s contact email', required: true, maxLength: 254, half: true },
      { kind: 'tel', name: 'phone', label: 'Initiative’s phone number', maxLength: 40, half: true },
      {
        kind: 'text',
        name: 'location',
        label: 'Location and area of operation in Nigeria',
        required: true,
        maxLength: 180,
        placeholder: 'Town/city, state and communities served',
      },
      { kind: 'select', name: 'organisationType', label: 'Type of initiative', options: opt(organisationTypes), placeholder: 'Select one', half: true },
      { kind: 'month', name: 'startDate', label: 'When did its activities begin?', half: true },
      {
        kind: 'url',
        name: 'socialLink',
        label: 'Main social media profile link',
        required: true,
        maxLength: 1000,
        placeholder: 'https://',
        hint: 'This is evidence of activity, not a follower-count requirement.',
      },
      { kind: 'url', name: 'website', label: 'Website link', maxLength: 1000, placeholder: 'https://' },
      { kind: 'select', name: 'category', label: 'Main area of cultural tourism work', options: opt(categoryOptions), placeholder: 'Select the closest fit' },
      {
        kind: 'checkbox',
        name: 'nigerian',
        required: true,
        label:
          'I confirm that the initiative is founded or substantially led by a young Nigerian and has its main cultural tourism impact in Nigeria.',
      },
    ],
  },
  {
    id: 'work',
    n: '03',
    title: 'Work & impact',
    intro: 'Focus on activities carried out during the past two years. Link to evidence the jury can access.',
    fields: [
      {
        kind: 'textarea',
        name: 'activities',
        label: 'What does the initiative do, and what has it done during the past two years?',
        required: true,
        maxLength: 4000,
        rows: 6,
        hint: 'Include examples, dates, locations and frequency of activity.',
      },
      {
        kind: 'textarea',
        name: 'culturalImpact',
        label: 'How does the work preserve or promote Nigerian culture, heritage or traditions?',
        required: true,
        maxLength: 4000,
        rows: 5,
        hint: 'Name the traditions, cultural practices or heritage involved and explain the role of tourism.',
      },
      {
        kind: 'textarea',
        name: 'communityBenefit',
        label: 'Who benefits, and what difference has the work made?',
        required: true,
        maxLength: 3000,
        rows: 5,
        hint: 'Describe involvement of communities or cultural practitioners, local income, skills, preservation or other outcomes.',
      },
      {
        kind: 'textarea',
        name: 'reach',
        label: 'What can you show about participation or reach?',
        maxLength: 1500,
        rows: 3,
        hint: 'Include numbers where available and explain their source. Depth of impact matters as well as scale.',
      },
      {
        kind: 'textarea',
        name: 'innovation',
        label: 'What is distinctive about the approach?',
        maxLength: 2000,
        rows: 3,
        hint: 'Explain the quality, creativity or innovation in the work.',
      },
      {
        kind: 'textarea',
        name: 'evidenceLinks',
        label: 'Evidence links',
        required: true,
        maxLength: 3000,
        rows: 5,
        placeholder: 'https://example.com/activity-one\nhttps://example.com/activity-two',
        hint: 'Add up to 10 links, one per line, to relevant posts, videos, reports, press coverage or other evidence. Use links the jury can view without requesting access.',
      },
      {
        kind: 'checkbox',
        name: 'active',
        required: true,
        label:
          'I confirm that this initiative has carried out cultural tourism activities during the past two years and that evidence of those activities is included.',
      },
    ],
  },
  {
    id: 'support',
    n: '04',
    title: 'The next chapter',
    fields: [
      {
        kind: 'textarea',
        name: 'grantUse',
        label: 'How would the initiative use the ₦100,000 development support grant?',
        required: true,
        maxLength: 2000,
        rows: 5,
        hint: 'Give a practical breakdown and the outcome it would support. If nominating someone else, share what you know or discuss this with them.',
      },
      {
        kind: 'textarea',
        name: 'futurePlans',
        label: 'How could the work continue or grow?',
        maxLength: 2000,
        rows: 3,
        hint: 'Describe realistic next steps and how impact can be sustained.',
      },
    ],
  },
  {
    id: 'declaration',
    n: '05',
    title: 'Check & submit',
    intro:
      'The award team and jury will use the information and evidence provided to assess the nomination and may contact you or the initiative to verify it.',
    fields: [
      {
        kind: 'checkbox',
        name: 'accurate',
        required: true,
        label:
          'I confirm that the information is accurate to the best of my knowledge and that supporting evidence fairly represents the initiative’s work.',
      },
      {
        kind: 'checkbox',
        name: 'consent',
        required: true,
        label:
          'I agree to share these details with the award team and jury for assessment and verification. If nominating someone else, I have permission to share their contact details.',
      },
    ],
    note: 'Please do not include bank details, identification documents or sensitive personal information. This form does not authorise publication of private contact details.',
  },
]

/** Every field name, in form order, plus the generated reference. */
export const submissionKeys = ['submissionId', ...sections.flatMap((s) => s.fields.map((f) => f.name))] as const

/**
 * Google Form connection. Leave `formId` empty until the form exists:
 * the page then explains that submissions are not connected yet.
 */
export const googleForm: { formId: string; entries: Partial<Record<string, string>> } = {
  // "Únyọ Award 2026 nominations", owned by unyo.africa@gmail.com.
  formId: '1FAIpQLSc2OU350Stgerp26eO6HkVSPSrssxrvTSEDtogmdNa0XdC6cQ',
  entries: {
    submissionId: 'entry.969664315',
    nominationType: 'entry.1913703048',
    nominatorName: 'entry.536015413',
    nominatorEmail: 'entry.1091988940',
    nominatorPhone: 'entry.609297318',
    relationship: 'entry.1657265935',
    organisation: 'entry.844925667',
    leadName: 'entry.1444180846',
    leadAge: 'entry.854716908',
    email: 'entry.959759532',
    phone: 'entry.1055242374',
    location: 'entry.560173784',
    organisationType: 'entry.2053703415',
    startDate: 'entry.1494931099',
    socialLink: 'entry.1653420638',
    website: 'entry.916680224',
    category: 'entry.1253231788',
    nigerian: 'entry.721579680',
    activities: 'entry.1557101123',
    culturalImpact: 'entry.2058732681',
    communityBenefit: 'entry.1422739241',
    reach: 'entry.249719882',
    innovation: 'entry.1853347304',
    evidenceLinks: 'entry.691088829',
    active: 'entry.437740038',
    grantUse: 'entry.993748018',
    futurePlans: 'entry.597635100',
    accurate: 'entry.448265492',
    consent: 'entry.1658103190',
  },
}
