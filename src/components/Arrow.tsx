export function Arrow({ direction = 'right' }: { direction?: 'right' | 'down' }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={direction === 'down' ? { transform: 'rotate(90deg)' } : undefined}
    >
      <path d="M3.5 10h13M11 4.5 16.5 10 11 15.5" />
    </svg>
  )
}
