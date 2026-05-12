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

const COL = [
  { accent: '#7C5CFC', bg: '#F5F3FF', border: '#DDD6FE' }, // purple — credit
  { accent: '#059669', bg: '#F0FDF4', border: '#BBF7D0' }, // green  — strategy
  { accent: '#D97706', bg: '#FFFBEB', border: '#FDE68A' }, // amber  — career
]
const STAGE_COLORS = ['#7C5CFC', '#059669', '#D97706', '#DC2626']

// ── sub-components ────────────────────────────────────────────────────────────

function MindBranch({
  title,
  sub,
  color,
  children,
}: {
  title: string
  sub?: string
  color: (typeof COL)[0]
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-center">
      {/* stem from horizontal bar → hub */}
      <div className="w-px h-6 flex-shrink-0" style={{ background: color.border }} />

      {/* hub node */}
      <div
        className="px-4 py-2 rounded-full border text-center mb-4 shadow-sm"
        style={{ background: color.bg, borderColor: color.border }}
      >
        <span className="font-mono text-xs font-semibold tracking-wide" style={{ color: color.accent }}>
          {title}
        </span>
        {sub && (
          <span className="block font-body text-[9px] text-text-muted mt-0.5">{sub}</span>
        )}
      </div>

      {/* child nodes */}
      <div className="flex flex-col gap-2 w-full">{children}</div>
    </div>
  )
}

function MindNode({
  children,
  accentColor,
}: {
  children: ReactNode
  accentColor: string
}) {
  return (
    <div
      className="rounded-xl border border-border bg-surface p-3 shadow-card"
      style={{ borderLeftWidth: '3px', borderLeftColor: accentColor }}
    >
      {children}
    </div>
  )
}

// ── main screen ───────────────────────────────────────────────────────────────

export function RoadmapScreen({ onBack }: Props) {
  const { profile, roadmap, setRoadmap, selectedCard } = useLandedStore()
  const [streamComplete, setStreamComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
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
    if (roadmap) { setStreamComplete(true); setVisible(true); return }
    runFetch()
  }, [])

  useEffect(() => {
    if (streamComplete) setTimeout(() => setVisible(true), 80)
  }, [streamComplete])

  const r = roadmap

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 w-full">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 font-body text-sm text-text-secondary hover:text-text-primary mb-8 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {!streamComplete && !error && (
        <GeneratingLoader label="Building your personalized roadmap…" lines={9} />
      )}
      {error && (
        <ErrorCard message={error} onRetry={() => { called.current = false; runFetch() }} />
      )}

      {streamComplete && r && (
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(14px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          {/* ── ROOT NODE ─────────────────────────────── */}
          <div className="flex justify-center">
            <div className="w-full max-w-xl">
              <div className="rounded-2xl bg-accent px-8 py-6 text-center shadow-lg shadow-accent/20 relative overflow-hidden">
                {/* decorative circles */}
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

                <p className="font-mono text-[10px] text-white/60 tracking-[0.2em] uppercase mb-2">
                  {selectedCard ? 'Approved · Your Roadmap' : 'Your Financial Roadmap'}
                </p>
                <h1 className="font-display text-3xl text-white font-semibold leading-tight mb-1">
                  You're in. Here's what's next.
                </h1>
                {selectedCard && (
                  <p className="font-body text-sm text-white/70 mt-1">{selectedCard.name}</p>
                )}

                {/* alerts inside root */}
                {r.alerts && r.alerts.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-white/20 text-left space-y-2">
                    <p className="font-mono text-[9px] text-white/50 tracking-widest uppercase mb-2">
                      Action needed
                    </p>
                    {r.alerts.map((alert, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-white/60 text-xs flex-shrink-0 mt-0.5">⚠</span>
                        <p className="font-body text-xs text-white/80 leading-relaxed">{alert}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── TRUNK ─────────────────────────────────── */}
          <div className="flex justify-center">
            <div className="w-px h-8 bg-border" />
          </div>

          {/* ── BRANCHES ──────────────────────────────── */}
          <div className="relative">
            {/* horizontal connector spanning center of col-1 to center of col-3 */}
            <div
              className="absolute top-0 h-px bg-border hidden md:block"
              style={{ left: '16.67%', right: '16.67%' }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* ── Credit Rules ── */}
              <MindBranch title="Credit Rules" color={COL[0]}>
                {r.creditFundamentals.map((rule, i) => (
                  <MindNode key={i} accentColor={COL[0].accent}>
                    <div className="flex gap-3 items-start">
                      <span
                        className="font-mono text-xs font-bold flex-shrink-0 w-4 leading-relaxed"
                        style={{ color: COL[0].accent }}
                      >
                        {i + 1}
                      </span>
                      <p className="font-body text-xs text-text-primary leading-relaxed">{rule}</p>
                    </div>
                  </MindNode>
                ))}
              </MindBranch>

              {/* ── Goal Strategy ── */}
              <MindBranch title={r.goalStrategy.headline} color={COL[1]}>
                <MindNode accentColor={COL[1].accent}>
                  <p className="font-body text-xs text-text-primary leading-relaxed whitespace-pre-line">
                    {r.goalStrategy.content}
                  </p>
                </MindNode>
              </MindBranch>

              {/* ── Career Path ── */}
              {r.careerRoadmap && (
                <MindBranch
                  title={r.careerRoadmap.field}
                  sub={`From ${r.careerRoadmap.expectedStartingSalary}`}
                  color={COL[2]}
                >
                  {(r.careerRoadmap.stages ?? []).map((stage, i) => (
                    <div key={i}>
                      {i > 0 && (
                        <div className="flex justify-center my-1.5">
                          <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                            <path
                              d="M5 1v9M2 7l3 4 3-4"
                              stroke={COL[2].border}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                      <MindNode accentColor={STAGE_COLORS[i % 4]}>
                        <p
                          className="font-mono text-[9px] font-semibold uppercase tracking-wider mb-1.5"
                          style={{ color: STAGE_COLORS[i % 4] }}
                        >
                          {stage.stage}
                        </p>
                        <p className="font-body text-xs text-text-primary leading-relaxed mb-2">
                          {stage.action}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: STAGE_COLORS[i % 4] }}
                          />
                          <p className="font-mono text-[9px] text-text-muted leading-snug">
                            {stage.cardTarget}
                          </p>
                        </div>
                      </MindNode>
                    </div>
                  ))}
                </MindBranch>
              )}
            </div>
          </div>

          {/* ── card progression footer ─────────────────── */}
          {r.careerRoadmap?.cardProgression && (
            <div className="mt-6 px-5 py-4 rounded-xl border border-border bg-surface-raised text-center">
              <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-1.5">
                Card Progression
              </p>
              <p className="font-body text-sm text-text-secondary leading-relaxed">
                {r.careerRoadmap.cardProgression}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
