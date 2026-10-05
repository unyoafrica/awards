/**
 * Flat product illustrations standing in for merchant product photos in the demo
 * catalogue. Real merchants' Qart product images replace these.
 */
const svg = (bg: string, body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/>${body}</svg>`,
  )}`

export const productArt: Record<string, string> = {
  bag: svg(
    '#F3E6D6',
    `<ellipse cx="200" cy="330" rx="130" ry="14" fill="#000" opacity=".08"/>
     <path d="M140 150c0-50 25-80 60-80s60 30 60 80" fill="none" stroke="#5A3420" stroke-width="14" stroke-linecap="round"/>
     <rect x="80" y="140" width="240" height="185" rx="28" fill="#8B4E2B"/>
     <rect x="80" y="140" width="240" height="60" rx="28" fill="#9C5A33"/>
     <rect x="180" y="190" width="40" height="30" rx="6" fill="#D9A441"/>
     <path d="M100 300h200" stroke="#6E3C20" stroke-width="4" stroke-dasharray="8 8"/>`,
  ),
  shorts: svg(
    '#E8E2D4',
    `<ellipse cx="200" cy="335" rx="120" ry="12" fill="#000" opacity=".08"/>
     <path d="M110 90h180l25 230h-95l-20-140-20 140H85z" fill="#7A5A3A"/>
     <rect x="110" y="90" width="180" height="26" fill="#654829"/>
     <rect x="100" y="190" width="60" height="55" rx="6" fill="#6B4E31"/>
     <rect x="240" y="190" width="60" height="55" rx="6" fill="#6B4E31"/>
     <path d="M200 116v60" stroke="#4E371F" stroke-width="4"/>`,
  ),
  sneakers: svg(
    '#DCEFE6',
    `<ellipse cx="200" cy="300" rx="150" ry="14" fill="#000" opacity=".08"/>
     <path d="M70 280c0-60 30-110 80-120l50 50c40 10 110 20 130 40 10 10 5 30-10 30H85c-10 0-15-0-15 0z" fill="#FAFAF7"/>
     <path d="M70 280h270v18H70z" fill="#18A957"/>
     <path d="M150 160l50 50" stroke="#1E1E1E" stroke-width="6"/>
     <path d="M165 190l12-12M180 205l12-12M195 220l12-12" stroke="#1E1E1E" stroke-width="5" stroke-linecap="round"/>
     <path d="M230 235c30 4 60 10 85 22" stroke="#F5C542" stroke-width="10" fill="none" stroke-linecap="round"/>`,
  ),
  jollof: svg(
    '#FCE9D2',
    `<ellipse cx="200" cy="320" rx="140" ry="16" fill="#000" opacity=".08"/>
     <ellipse cx="200" cy="230" rx="150" ry="80" fill="#FFFFFF"/>
     <ellipse cx="200" cy="215" rx="115" ry="55" fill="#E0622A"/>
     <circle cx="160" cy="200" r="9" fill="#F59E42"/><circle cx="230" cy="195" r="8" fill="#F59E42"/>
     <circle cx="200" cy="230" r="7" fill="#3C9A4F"/><circle cx="250" cy="225" r="6" fill="#3C9A4F"/>
     <path d="M250 180c30-10 55 0 60 20-25 10-50 5-60-20z" fill="#C2410C"/>
     <ellipse cx="135" cy="225" rx="28" ry="16" fill="#F4C27A"/>`,
  ),
  shea: svg(
    '#F7F1E3',
    `<ellipse cx="200" cy="320" rx="110" ry="12" fill="#000" opacity=".08"/>
     <rect x="110" y="170" width="180" height="150" rx="22" fill="#FFFDF7"/>
     <rect x="100" y="130" width="200" height="50" rx="14" fill="#18A957"/>
     <rect x="135" y="215" width="130" height="62" rx="10" fill="#F5C542"/>
     <path d="M160 246h80" stroke="#1E1E1E" stroke-width="6" stroke-linecap="round"/>
     <circle cx="200" cy="108" r="14" fill="#6BBF7A"/>`,
  ),
  ankara: svg(
    '#FDF0E6',
    `<ellipse cx="200" cy="345" rx="110" ry="12" fill="#000" opacity=".08"/>
     <path d="M160 70h80l15 40 40 20-20 60-25-10 30 160H120l30-160-25 10-20-60 40-20z" fill="#2563A8"/>
     <circle cx="170" cy="200" r="16" fill="#F5C542"/><circle cx="230" cy="250" r="16" fill="#F5C542"/>
     <circle cx="185" cy="300" r="14" fill="#E0622A"/><circle cx="240" cy="160" r="12" fill="#E0622A"/>
     <circle cx="150" cy="270" r="10" fill="#18A957"/><circle cx="215" cy="210" r="9" fill="#18A957"/>`,
  ),
  phone: svg(
    '#E6E9EF',
    `<ellipse cx="200" cy="345" rx="90" ry="12" fill="#000" opacity=".08"/>
     <rect x="125" y="60" width="150" height="280" rx="28" fill="#1F2430"/>
     <rect x="137" y="78" width="126" height="244" rx="18" fill="#2F6FEB"/>
     <path d="M137 260c40-40 80-60 126-50v94a18 18 0 0 1-18 18H155a18 18 0 0 1-18-18z" fill="#18A957"/>
     <rect x="180" y="86" width="40" height="8" rx="4" fill="#1F2430"/>`,
  ),
  storefront: svg(
    '#E7F6EE',
    `<rect x="70" y="150" width="260" height="170" rx="14" fill="#FFFFFF"/>
     <path d="M60 120h280l-12 50H72z" fill="#18A957"/>
     <path d="M60 120h70l-6 50H72zM200 120h70l-4 50h-62zM130 120h70v50h-70z" fill="#F5C542"/>
     <rect x="100" y="200" width="80" height="120" rx="8" fill="#0E7A3F"/>
     <rect x="210" y="200" width="90" height="60" rx="8" fill="#D6EFE1"/>`,
  ),
}
