export function StepIndicator({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div className="ad-steps">
      <div className="ad-steps__text">
        <span className="num">
          {step} of {total}
        </span>
        <span>{label}</span>
      </div>
      <div
        className="ad-steps__track"
        role="progressbar"
        aria-label="Ad setup progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < step ? 'is-done' : ''} />
        ))}
      </div>
    </div>
  )
}
