import { useEffect, useState, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useLandedStore } from '../store'
import { streamAndParse, ROADMAP_PROMPT } from '../utils/ai'
import { GeneratingLoader } from '../components/GeneratingLoader'
import { ErrorCard } from '../components/ErrorCard'
import { type Roadmap } from '../types'

interface Props {
  onBack: () => void
}

const STAGE_COLORS = ['#7C5CFC', '#059669', '#D97706', '#DC2626']

function Section({ visible, delay, children }: { visible: boolean; delay: number; children: ReactNode }) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition: `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

export function RoadmapScreen({ onBack }: Props) {
  const { profile, roadmap, setRoadmap, selectedCard } = useLandedStore()
  const [streamComplete, setStreamComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visibleSections, setVisibleSections] = useState(0)
  const called = useRef(false)

  const runFetch = useCallback(() => {
    called.current = true
    setError(null)
    streamAndParse<Roadmap>(ROADMAP_PROMPT, profile, () => {}, undefined, 2500)
      .then((data) => {
        setRoadmap(data)
        setStreamComplete(true)
      })
      .catch((e: Error) => setError(e.message))
  }, [profile, setRoadmap])

  useEffect(() => {
    if (called.current) return
    if (roadmap) { setStreamComplete(true); setVisibleSections(99); return }
    runFetch()
  }, [])

  useEffect(() => {
    if (!streamComplete || !roadmap) return
    const total = 4
    for (let i = 0; i <= total; i++) {
      setTimeout(() => setVisibleSections(i + 1), i * 100)
    }
  }, [streamComplete, roadmap])

  const r = roadmap

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-body text-sm text-text-secondary hover:text-text-primary mb-5 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        {selectedCard && (
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-2">Approved for</p>
        )}
        <h1 className="font-display text-4xl text-text-primary leading-tight">
          You're in. Here's what to do next.
        </h1>
        {selectedCard && (
          <p className="font-body text-base text-text-secondary mt-2">{selectedCard.name}</p>
        )}
      </div>

      {!streamComplete && !error && (
        <GeneratingLoader label="Building your personalized roadmap…" lines={9} />
      )}

      {error && (
        <ErrorCard message={error} onRetry={() => { called.current = false; runFetch() }} />
      )}

      {streamComplete && r && (
        <div className="flex flex-col gap-8">
          {/* Alerts */}
          {r.alerts && r.alerts.length > 0 && (
            <Section visible={visibleSections > 0} delay={0}>
              <div className="p-5 rounded-2xl border border-danger/30 bg-danger/5">
                <p className="font-mono text-xs text-danger mb-3 tracking-wide">ACTION NEEDED</p>
                {r.alerts.map((alert, i) => (
                  <p key={i} className="font-body text-sm text-text-primary mb-1">⚠ {alert}</p>
                ))}
              </div>
            </Section>
          )}

          {/* Credit Fundamentals */}
          <Section visible={visibleSections > 1} delay={0}>
            <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-4">
              Credit Fundamentals
            </p>
            <div className="flex flex-col gap-3">
              {r.creditFundamentals.map((rule, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-xl bg-surface border border-border shadow-card"
                  style={{
                    opacity: visibleSections > 1 ? 1 : 0,
                    transform: visibleSections > 1 ? 'translateY(0)' : 'translateY(8px)',
                    transition: `opacity 0.35s ease ${i * 0.05}s, transform 0.35s ease ${i * 0.05}s`,
                  }}
                >
                  <span className="font-mono text-sm text-accent font-medium flex-shrink-0 w-5">{i + 1}</span>
                  <p className="font-body text-sm text-text-primary leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Goal Strategy */}
          {r.goalStrategy && (
            <Section visible={visibleSections > 2} delay={0}>
              <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-4">
                {r.goalStrategy.headline}
              </p>
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-card">
                <p className="font-body text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {r.goalStrategy.content}
                </p>
              </div>
            </Section>
          )}

          {/* Career Roadmap */}
          {r.careerRoadmap && (
            <Section visible={visibleSections > 3} delay={0}>
              <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-1">
                Career Roadmap
              </p>
              <p className="font-body text-sm text-text-secondary mb-1">
                {r.careerRoadmap.field} · Starting salary{' '}
                <span className="text-text-primary font-medium">{r.careerRoadmap.expectedStartingSalary}</span>
              </p>
              <p className="font-body text-xs text-text-muted italic mb-6">{r.careerRoadmap.cardProgression}</p>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[11px] top-3 bottom-0 w-px bg-border" />
                <div className="flex flex-col gap-0">
                  {(r.careerRoadmap.stages ?? []).map((stage, i) => {
                    const color = STAGE_COLORS[i % STAGE_COLORS.length]
                    const isLast = i === r.careerRoadmap.stages.length - 1
                    return (
                      <div key={i} className={`flex gap-5 ${isLast ? '' : 'pb-6'}`}>
                        <div className="flex flex-col items-center flex-shrink-0 mt-1">
                          <div className="w-[23px] h-[23px] rounded-full border-2 border-surface flex items-center justify-center z-10"
                            style={{ background: color }}>
                            <div className="w-2 h-2 rounded-full bg-white/80" />
                          </div>
                        </div>
                        <div className="flex-1 pb-1">
                          <p className="font-mono text-xs font-medium mb-1" style={{ color }}>
                            {stage.stage.toUpperCase()}
                          </p>
                          <p className="font-body text-sm text-text-primary leading-relaxed mb-1">
                            {stage.action}
                          </p>
                          <p className="font-mono text-xs text-text-muted">
                            Card: {stage.cardTarget}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  )
}
