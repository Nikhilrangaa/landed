import { useState, useCallback } from 'react'
import { useLandedStore } from '../store'
import { DEMO_PROFILES } from '../utils/demoProfiles'
import { applyRuleSetA } from '../utils/ruleSetA'
import { type UserProfile } from '../types'

type StartStep = 'tips' | 'cards' | 'roadmap'

interface Props {
  onSelect: (startStep: StartStep) => void
}

const START_OPTIONS: { label: string; sub: string; value: StartStep }[] = [
  { label: 'Full arc', sub: 'Tips → Cards → Walkthrough → Roadmap', value: 'tips' },
  { label: 'Cards only', sub: 'Skip tips, land on card matches', value: 'cards' },
  { label: 'Roadmap only', sub: 'Jump straight to post-approval', value: 'roadmap' },
]

const PERSONA_COLORS = ['#7C5CFC', '#059669', '#D97706', '#DC2626', '#0891B2']

export function DemoMode({ onSelect }: Props) {
  const { setProfile, resetProfile } = useLandedStore()
  const [open, setOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null)
  const [startStep, setStartStep] = useState<StartStep>('tips')

  const loadAndGo = useCallback(() => {
    if (selectedProfile === null) return
    const demo = DEMO_PROFILES[selectedProfile]
    resetProfile()
    const derived = applyRuleSetA(demo.profile as UserProfile)
    setProfile({ ...demo.profile, ...derived } as Partial<UserProfile>)
    setOpen(false)
    onSelect(startStep)
  }, [selectedProfile, startStep, resetProfile, setProfile, onSelect])

  return (
    <>
      {/* Hidden trigger — subtle, bottom-left */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 w-9 h-9 rounded-full
          bg-surface border border-border shadow-card flex items-center justify-center
          text-text-muted hover:text-text-secondary hover:border-border-hover transition-all"
        aria-label="Demo mode"
        tabIndex={-1}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
        </svg>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-modal border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-0.5">Demo Mode</p>
                <p className="font-body text-sm text-text-secondary">Load a persona, pick a starting point</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center
                  text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="px-6 py-5">
              {/* Persona selector */}
              <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-3">Persona</p>
              <div className="flex flex-col gap-2 mb-6">
                {DEMO_PROFILES.map((dp, i) => {
                  const color = PERSONA_COLORS[i]
                  const active = selectedProfile === i
                  return (
                    <button
                      key={dp.name}
                      onClick={() => setSelectedProfile(i)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border"
                      style={{
                        background: active ? `${color}08` : 'var(--surface-raised)',
                        borderColor: active ? `${color}50` : 'var(--border)',
                      }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: active ? color : 'var(--border-hover)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className="font-body text-sm font-semibold mr-2"
                          style={{ color: active ? color : 'var(--text-primary)' }}
                        >
                          {dp.name}
                        </span>
                        <span className="font-body text-xs text-text-secondary">
                          {dp.label.replace(/^[A-E] — /, '')}
                        </span>
                      </div>
                      {active && (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color }}>
                          <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Start step */}
              <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-3">Start at</p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {START_OPTIONS.map(({ label, sub, value }) => (
                  <button
                    key={value}
                    onClick={() => setStartStep(value)}
                    className="flex flex-col items-center py-3 px-2 rounded-xl text-center transition-all border"
                    style={{
                      background: startStep === value ? 'var(--accent-light)' : 'var(--surface-raised)',
                      borderColor: startStep === value ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    <span
                      className="font-body text-xs font-semibold mb-0.5"
                      style={{ color: startStep === value ? 'var(--accent)' : 'var(--text-primary)' }}
                    >
                      {label}
                    </span>
                    <span className="font-mono text-[9px] text-text-muted leading-tight text-center">{sub}</span>
                  </button>
                ))}
              </div>

              {/* Launch */}
              <button
                onClick={loadAndGo}
                disabled={selectedProfile === null}
                className="w-full py-3.5 rounded-xl font-body font-semibold text-base transition-all
                  disabled:opacity-30 disabled:cursor-not-allowed bg-accent text-white hover:bg-accent-dark"
              >
                {selectedProfile !== null
                  ? `Launch ${DEMO_PROFILES[selectedProfile].name} →`
                  : 'Select a persona'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
