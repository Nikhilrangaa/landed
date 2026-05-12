import { useEffect, useState, useRef, useCallback, type ReactElement } from 'react'
import { useLandedStore } from '../store'
import { streamAndParse, TIPS_PROMPT } from '../utils/ai'
import { GeneratingLoader } from '../components/GeneratingLoader'
import { ErrorCard } from '../components/ErrorCard'
import { type Tip } from '../types'

interface Props {
  onNext: () => void
}

const ICON_SVG: Record<Tip['icon'], ReactElement> = {
  income: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round"/>
    </svg>
  ),
  credit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="16 7 22 7 22 13" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  id: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M8 13a2 2 0 100-4 2 2 0 000 4zM14 9h4M14 13h4" strokeLinecap="round"/>
    </svg>
  ),
  strategy: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinejoin="round"/>
      <path d="M12 9v4M12 17h.01" strokeLinecap="round"/>
    </svg>
  ),
}

function useTypewriter(text: string, active: boolean, speedMs = 10) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const idx = useRef(0)

  useEffect(() => {
    if (!active) return
    idx.current = 0
    setDisplayed('')
    setDone(false)
    const tick = () => {
      idx.current += 1
      setDisplayed(text.slice(0, idx.current))
      if (idx.current >= text.length) { setDone(true); return }
      setTimeout(tick, speedMs)
    }
    setTimeout(tick, speedMs)
  }, [active, text])

  return { displayed, done }
}

function TipCard({ tip, active, onDone }: { tip: Tip; active: boolean; onDone: () => void }) {
  const { displayed, done } = useTypewriter(tip.body, active)

  useEffect(() => { if (done) onDone() }, [done])

  return (
    <div
      className="p-5 rounded-2xl bg-surface border border-border shadow-card transition-all duration-300"
      style={{
        opacity: active || done ? 1 : 0,
        transform: active || done ? 'translateY(0)' : 'translateY(10px)',
      }}
    >
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0 text-accent">
          {ICON_SVG[tip.icon]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-body font-semibold text-text-primary text-sm mb-1.5">
            {tip.title}
          </h3>
          <p className="font-body text-sm text-text-secondary leading-relaxed">
            {displayed}
            {active && !done && <span className="tw-cursor" />}
          </p>
        </div>
      </div>
    </div>
  )
}

export function TipsScreen({ onNext }: Props) {
  const { profile, tips, setTips } = useLandedStore()
  const [streamComplete, setStreamComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTipIdx, setActiveTipIdx] = useState(0)
  const [allDone, setAllDone] = useState(false)
  const called = useRef(false)

  const runFetch = useCallback(() => {
    called.current = true
    setError(null)
    streamAndParse<{ tips: Tip[] }>(TIPS_PROMPT, profile, () => {}, undefined, 700)
      .then((data) => {
        setTips(data.tips)
        setStreamComplete(true)
        setActiveTipIdx(0)
      })
      .catch((e: Error) => setError(e.message))
  }, [profile, setTips])

  useEffect(() => {
    if (called.current) return
    if (tips) { setStreamComplete(true); setAllDone(true); setActiveTipIdx(tips.length); return }
    runFetch()
  }, [])

  const handleTipDone = (i: number) => {
    if (!tips) return
    if (i < tips.length - 1) {
      setTimeout(() => setActiveTipIdx(i + 1), 150)
    } else {
      setTimeout(() => setAllDone(true), 250)
    }
  }

  const generating = !streamComplete && !error

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full">
      <div className="mb-8">
        <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Before you apply</p>
        <h1 className="font-display text-4xl text-text-primary leading-tight mb-2">Your personalized plan</h1>
        <p className="font-body text-base text-text-secondary">
          {generating ? 'Analyzing your profile…' : 'Do these first to meaningfully improve your approval odds.'}
        </p>
      </div>

      {generating && <GeneratingLoader label="Generating your personalized tips…" lines={6} />}
      {error && <ErrorCard message={error} onRetry={() => { called.current = false; runFetch() }} />}

      {streamComplete && tips && (
        <div className="flex flex-col gap-4 mb-8">
          {tips.map((tip, i) => (
            <TipCard
              key={i}
              tip={tip}
              active={i === activeTipIdx && !allDone}
              onDone={() => handleTipDone(i)}
            />
          ))}
        </div>
      )}

      <div
        style={{
          opacity: allDone ? 1 : 0,
          transform: allDone ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
          pointerEvents: allDone ? 'auto' : 'none',
        }}
      >
        <button
          onClick={onNext}
          className="w-full py-4 bg-accent text-white font-body font-semibold text-base rounded-xl
            hover:bg-accent-dark active:scale-[0.98] transition-all shadow-lg shadow-accent/20"
        >
          See my card matches →
        </button>
      </div>
    </div>
  )
}
