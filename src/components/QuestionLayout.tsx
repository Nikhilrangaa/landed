import { type ReactNode } from 'react'
import { ProgressBar } from './ProgressBar'

interface QuestionLayoutProps {
  questionNumber: number
  totalQuestions: number
  question: string
  subtext?: string
  children: ReactNode
  onBack?: () => void
  onContinue?: () => void
  continueDisabled?: boolean
  continueLabel?: string
  animClass?: string
}

export function QuestionLayout({
  questionNumber,
  totalQuestions,
  question,
  subtext,
  children,
  onBack,
  onContinue,
  continueDisabled = false,
  continueLabel = 'Continue',
  animClass = 'slide-enter-right',
}: QuestionLayoutProps) {
  return (
    <div className={`flex flex-col min-h-screen bg-bg ${animClass}`}>
      {/* Top progress */}
      <ProgressBar current={questionNumber} total={totalQuestions} />

      {/* Nav row */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-body text-sm text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Go back"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        ) : (
          <div />
        )}
        <span className="font-mono text-xs text-text-muted">{questionNumber} / {totalQuestions}</span>
        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 py-10 overflow-y-auto scroll-area">
        <div className="w-full max-w-lg">
          <h1 className="font-display text-3xl sm:text-4xl text-text-primary leading-tight mb-2">
            {question}
          </h1>
          {subtext && (
            <p className="font-body text-sm text-text-secondary mb-8 leading-relaxed">{subtext}</p>
          )}
          {!subtext && <div className="mb-8" />}

          {children}
        </div>
      </div>

      {/* Continue CTA */}
      {onContinue && (
        <div className="px-6 py-5 border-t border-border/50 flex justify-center">
          <div className="w-full max-w-lg">
            <button
              onClick={onContinue}
              disabled={continueDisabled}
              className="w-full py-3.5 bg-accent text-white font-body font-semibold text-base rounded-xl
                disabled:opacity-30 disabled:cursor-not-allowed
                hover:bg-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/15"
            >
              {continueLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
