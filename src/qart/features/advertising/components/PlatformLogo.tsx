import type { ChannelId, PlatformId } from '../types'

/** Simplified channel marks so merchants recognise where their ad will appear. */
export function ChannelLogo({ channel, size = 28 }: { channel: ChannelId | PlatformId; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 32 32', 'aria-hidden': true } as const
  switch (channel) {
    case 'instagram':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#FEC53A" />
              <stop offset=".45" stopColor="#F2453D" />
              <stop offset="1" stopColor="#8E3AE0" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="9" fill="url(#ig)" />
          <rect x="8" y="8" width="16" height="16" rx="5" fill="none" stroke="#fff" strokeWidth="2.2" />
          <circle cx="16" cy="16" r="3.8" fill="none" stroke="#fff" strokeWidth="2.2" />
          <circle cx="21" cy="11" r="1.2" fill="#fff" />
        </svg>
      )
    case 'facebook':
      return (
        <svg {...common}>
          <rect width="32" height="32" rx="9" fill="#1877F2" />
          <path d="M18 32V20h4l.6-4.5H18v-3c0-1.3.4-2.2 2.3-2.2h2.4V6.3A32 32 0 0 0 19.2 6c-3.4 0-5.7 2.1-5.7 5.9v3.6h-3.8V20h3.8v12z" fill="#fff" />
        </svg>
      )
    case 'meta':
      return (
        <svg {...common}>
          <rect width="32" height="32" rx="9" fill="#0866FF" />
          <path
            d="M7 19.5c0-4.5 2.2-8 4.6-8 1.8 0 3.2 1.6 4.4 3.8 1.2-2.2 2.6-3.8 4.4-3.8 2.4 0 4.6 3.5 4.6 8 0 1.8-.8 3-2.2 3-1.8 0-3-2.2-4.6-5.3L16 14.8m0 0c-1.6 3.1-3 7.7-6.8 7.7C7.8 22.5 7 21.3 7 19.5"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'tiktok':
      return (
        <svg {...common}>
          <rect width="32" height="32" rx="9" fill="#111" />
          <path d="M18.5 7v11.5a3.6 3.6 0 1 1-3.6-3.6" fill="none" stroke="#25F4EE" strokeWidth="2.6" strokeLinecap="round" transform="translate(-.8 -.6)" />
          <path d="M18.5 7c.4 2.6 2 4.2 4.6 4.5" fill="none" stroke="#25F4EE" strokeWidth="2.6" strokeLinecap="round" transform="translate(-.8 -.6)" />
          <path d="M18.5 7v11.5a3.6 3.6 0 1 1-3.6-3.6" fill="none" stroke="#FE2C55" strokeWidth="2.6" strokeLinecap="round" transform="translate(.8 .6)" />
          <path d="M18.5 7c.4 2.6 2 4.2 4.6 4.5" fill="none" stroke="#FE2C55" strokeWidth="2.6" strokeLinecap="round" transform="translate(.8 .6)" />
          <path d="M18.5 7v11.5a3.6 3.6 0 1 1-3.6-3.6M18.5 7c.4 2.6 2 4.2 4.6 4.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      )
    case 'snapchat':
      return (
        <svg {...common}>
          <rect width="32" height="32" rx="9" fill="#FFFC00" />
          <path
            d="M16 7.5c3.2 0 5 2.4 5 5v2.3l1.6-.5c.6 0 .9.6.4 1l-2 1c.5 1.6 1.8 2.8 3.4 3.3-.3.8-1.5 1-2.6 1.2l-.4 1.2c-1.2-.2-2.3.1-3.2.8-.8.6-1.4.9-2.2.9s-1.4-.3-2.2-.9c-.9-.7-2-1-3.2-.8l-.4-1.2c-1.1-.2-2.3-.4-2.6-1.2 1.6-.5 2.9-1.7 3.4-3.3l-2-1c-.5-.4-.2-1 .4-1l1.6.5v-2.3c0-2.6 1.8-5 5-5z"
            fill="#fff"
            stroke="#111"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}
