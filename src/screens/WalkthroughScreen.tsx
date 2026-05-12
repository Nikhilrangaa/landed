import { useEffect, useState, useRef, useCallback } from 'react'
import { useLandedStore } from '../store'
import { streamAndParse, makeWalkthroughPrompt } from '../utils/ai'
import { GeneratingLoader } from '../components/GeneratingLoader'
import { ErrorCard } from '../components/ErrorCard'
import { type FieldGuidance, type CardRecommendation } from '../types'

interface Props {
  card: CardRecommendation
  onApproved: () => void
  onBack: () => void
}

export function WalkthroughScreen({ card, onApproved, onBack }: Props) {
  const {
    profile, fieldGuidance, setFieldGuidance,
    setFieldGuidanceIncome, setFieldGuidanceRisks,
    fieldGuidanceIncome, fieldGuidanceRisks,
  } = useLandedStore()
  const [streamComplete, setStreamComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentField, setCurrentField] = useState(0)
  const called = useRef(false)

  const runFetch = useCallback(() => {
    called.current = true
    setError(null)
    const prompt = makeWalkthroughPrompt(card.name, card.issuer)
    streamAndParse<{ fields: FieldGuidance[]; incomeTotal: string; flaggedRisks: string[] }>(
      prompt, profile, () => {}, undefined, 1400
    )
      .then((data) => {
        setFieldGuidance(data.fields)
        setFieldGuidanceIncome(data.incomeTotal)
        setFieldGuidanceRisks(data.flaggedRisks ?? [])
        setStreamComplete(true)
      })
      .catch((e: Error) => setError(e.message))
  }, [card, profile, setFieldGuidance, setFieldGuidanceIncome, setFieldGuidanceRisks])

  useEffect(() => {
    if (called.current) return
    if (fieldGuidance) { setStreamComplete(true); return }
    runFetch()
  }, [])

  const fields = fieldGuidance ?? []
  const field = fields[currentField]
  const isFirst = currentField === 0
  const isLast = currentField === fields.length - 1

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-body text-sm text-text-secondary hover:text-text-primary mb-5 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to cards
        </button>
        <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-2">Applying for</p>
        <h1 className="font-display text-3xl text-text-primary leading-tight">{card.name}</h1>
        <p className="font-body text-sm text-text-secondary mt-1">{card.issuer}</p>
      </div>

      {!streamComplete && !error && (
        <GeneratingLoader label="Preparing your field-by-field walkthrough…" lines={7} />
      )}

      {error && (
        <ErrorCard message={error} onRetry={() => { called.current = false; runFetch() }} />
      )}

      {/* Risk flags */}
      {streamComplete && fieldGuidanceRisks.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-warning/40 bg-warning/5">
          <p className="font-mono text-xs text-warning mb-2 tracking-wide">REVIEW BEFORE SUBMITTING</p>
          {fieldGuidanceRisks.map((r, i) => (
            <p key={i} className="font-body text-sm text-text-primary mb-1">• {r}</p>
          ))}
        </div>
      )}

      {streamComplete && field && (
        <>
          {/* Progress dots */}
          <div className="flex items-center justify-between mb-5">
            <span className="font-mono text-xs text-text-muted">
              Field {currentField + 1} of {fields.length}
            </span>
            <div className="flex gap-1.5">
              {fields.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentField(i)}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === currentField ? '20px' : '6px',
                    background: i <= currentField ? 'var(--accent)' : 'var(--border)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Field card */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden mb-5">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="font-display text-2xl text-text-primary">{field.fieldName}</h2>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* What to enter */}
              <div>
                <p className="font-mono text-xs text-accent mb-2 tracking-wide">WHAT TO ENTER</p>
                <div className="p-4 rounded-xl bg-accent-light border border-accent/20">
                  <p className="font-body text-base text-text-primary leading-relaxed">
                    {field.whatToEnter}
                  </p>
                  {field.fieldName.toLowerCase().includes('income') && fieldGuidanceIncome && (
                    <div className="mt-4 pt-4 border-t border-accent/20">
                      <p className="font-mono text-xs text-text-muted mb-1">CALCULATED TOTAL</p>
                      <p className="font-mono text-4xl font-medium text-accent">{fieldGuidanceIncome}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Why it matters */}
              <div>
                <p className="font-mono text-xs text-text-muted mb-2 tracking-wide">WHY IT MATTERS</p>
                <p className="font-body text-sm text-text-secondary leading-relaxed">{field.whyItMatters}</p>
              </div>

              {/* Common mistake */}
              <div className="flex gap-3 p-4 rounded-xl bg-warning/5 border border-warning/25">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-warning flex-shrink-0 mt-0.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinejoin="round"/>
                  <path d="M12 9v4M12 17h.01" strokeLinecap="round"/>
                </svg>
                <div>
                  <p className="font-mono text-xs text-warning mb-1 tracking-wide">COMMON MISTAKE</p>
                  <p className="font-body text-sm text-text-primary leading-relaxed">{field.commonMistake}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {!isFirst && (
              <button
                onClick={() => setCurrentField(currentField - 1)}
                className="flex-1 py-3.5 rounded-xl border border-border font-body text-sm text-text-secondary
                  hover:border-border-hover hover:text-text-primary transition-all"
              >
                ← Previous
              </button>
            )}
            {!isLast ? (
              <button
                onClick={() => setCurrentField(currentField + 1)}
                className="flex-1 py-3.5 bg-accent text-white font-body font-semibold text-sm rounded-xl
                  hover:bg-accent-dark transition-all"
              >
                Next field →
              </button>
            ) : (
              <button
                onClick={onApproved}
                className="flex-1 py-3.5 bg-accent text-white font-body font-semibold text-sm rounded-xl
                  hover:bg-accent-dark transition-all"
              >
                I got approved! →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
