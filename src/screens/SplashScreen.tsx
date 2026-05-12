interface Props {
  onStart: () => void
}

export function SplashScreen({ onStart }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Nav */}
      <nav className="px-8 py-5 flex items-center justify-between border-b border-border/60">
        <span className="font-display text-xl font-semibold text-text-primary select-none">
          Landed.
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-text-muted tracking-wide">Credit Navigator</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl text-center">
          {/* Eyebrow */}
          <p className="splash-eyebrow font-mono text-xs text-accent tracking-[0.18em] uppercase mb-6">
            AI-Personalized · No Templates · Real Cards Only
          </p>

          {/* Headline */}
          <h1 className="splash-title font-display text-5xl sm:text-6xl font-semibold text-text-primary leading-[1.08] mb-6">
            The credit guide built<br />
            <span className="italic text-accent">for your exact situation.</span>
          </h1>

          {/* Subheadline */}
          <p className="splash-body font-body text-lg text-text-secondary leading-relaxed max-w-lg mx-auto mb-10">
            Not generic advice. Not a template. Landed reads your profile — visa, income, credit history —
            and gives you a plan that actually fits.
          </p>

          {/* Feature pills */}
          <div className="splash-pills flex flex-wrap justify-center gap-2.5 mb-12">
            {[
              { label: 'Personalized card matches', icon: '✦' },
              { label: 'Field-by-field walkthrough', icon: '◆' },
              { label: 'International student ready', icon: '◇' },
              { label: 'Post-approval roadmap', icon: '●' },
            ].map(({ label, icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface text-text-secondary font-body text-sm shadow-card"
              >
                <span className="text-accent text-[10px]">{icon}</span>
                {label}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="splash-cta flex flex-col items-center gap-3">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-body font-semibold text-base rounded-xl
                hover:bg-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/20"
            >
              Get my personalized matches
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <p className="font-mono text-xs text-text-muted tracking-wide">
              7 questions · under 2 minutes · no account needed
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-8 py-5 border-t border-border/60 flex items-center justify-between">
        <p className="font-mono text-xs text-text-muted">
          Built for first-year students
        </p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="font-mono text-xs text-text-muted">AI-powered · Always free</span>
        </div>
      </div>
    </div>
  )
}
