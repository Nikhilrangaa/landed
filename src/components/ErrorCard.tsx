interface Props {
  message: string
  onRetry: () => void
}

export function ErrorCard({ message, onRetry }: Props) {
  const friendly = message.includes('401')
    ? 'API key missing or invalid. Add VITE_ANTHROPIC_API_KEY to .env.local and restart.'
    : message.includes('429')
    ? 'Rate limit hit — wait a moment and try again.'
    : message.includes('Failed to fetch') || message.includes('NetworkError')
    ? 'Network error — check your connection.'
    : 'Something went wrong generating your results.'

  return (
    <div className="p-5 rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warning">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <path d="M12 9v4M12 17h.01" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="font-body text-sm font-medium text-text-primary mb-0.5">Couldn't generate results</p>
          <p className="font-body text-xs text-text-secondary leading-relaxed">{friendly}</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="w-full py-3 rounded-xl border border-border font-body text-sm text-text-secondary
          hover:border-accent hover:text-accent transition-all"
      >
        Try again
      </button>
    </div>
  )
}
