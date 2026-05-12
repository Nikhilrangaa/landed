import { useEffect, useState, useRef, useCallback } from 'react'
import { useLandedStore } from '../store'
import { streamAndParse, CARDS_PROMPT } from '../utils/ai'
import { GeneratingLoader } from '../components/GeneratingLoader'
import { ErrorCard } from '../components/ErrorCard'
import { type CardRecommendation } from '../types'

interface Props {
  onSelectCard: (card: CardRecommendation) => void
  onApproved: () => void
}

const LIKELIHOOD_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  HIGH:     { color: '#059669', bg: '#ECFDF5', label: 'High approval odds' },
  MEDIUM:   { color: '#D97706', bg: '#FFFBEB', label: 'Medium approval odds' },
  POSSIBLE: { color: '#78716C', bg: '#F5F2EE', label: 'Possible with effort' },
}

function getLikelihoodCfg(likelihood: string) {
  const key = likelihood?.toUpperCase()
  if (key?.includes('HIGH')) return LIKELIHOOD_CONFIG.HIGH
  if (key?.includes('MED')) return LIKELIHOOD_CONFIG.MEDIUM
  return LIKELIHOOD_CONFIG.POSSIBLE
}

function ApprovalBadge({ likelihood }: { likelihood: CardRecommendation['approvalLikelihood'] }) {
  const cfg = getLikelihoodCfg(likelihood)
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

function CardTile({
  card,
  index,
  visible,
  onSelect,
}: {
  card: CardRecommendation
  index: number
  visible: boolean
  onSelect: () => void
}) {
  return (
    <div
      className="bg-surface rounded-2xl border border-border shadow-card card-lift flex flex-col overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`,
      }}
    >
      {/* Top accent strip */}
      <div className="h-1 bg-accent" />

      <div className="p-6 flex flex-col flex-1">
        {/* Card name + issuer */}
        <div className="mb-3">
          <h3 className="font-display text-xl text-text-primary leading-tight mb-1">{card.name}</h3>
          <div className="flex items-center gap-2 text-text-secondary font-body text-sm">
            <span>{card.issuer}</span>
            <span className="text-border-hover">·</span>
            <span>{card.annualFee}</span>
          </div>
        </div>

        <div className="mb-3">
          <ApprovalBadge likelihood={card.approvalLikelihood} />
        </div>

        {/* Key feature */}
        <p className="font-body text-sm text-accent font-medium mb-2 leading-snug">
          {card.keyFeature}
        </p>

        {/* Match reason */}
        <p className="font-body text-sm text-text-secondary leading-relaxed flex-1 mb-5">
          {card.matchReason}
        </p>

        {/* CTAs */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={onSelect}
            className="flex-1 py-3 bg-accent text-white font-body font-semibold text-sm rounded-xl
              hover:bg-accent-dark active:scale-[0.98] transition-all"
          >
            Walk me through applying →
          </button>
          {card.applyUrl && (
            <a
              href={card.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl border border-border font-body text-sm text-text-secondary
                hover:border-border-hover hover:text-text-primary transition-all"
            >
              Apply
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function CardResultsScreen({ onSelectCard, onApproved }: Props) {
  const { profile, cards, setCards, setCardsContext, cardsContext } = useLandedStore()
  const [streamComplete, setStreamComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(0)
  const called = useRef(false)

  const runFetch = useCallback(() => {
    called.current = true
    setError(null)
    streamAndParse<{ cards: CardRecommendation[]; context: string }>(
      CARDS_PROMPT, profile, () => {}, undefined, 1100
    )
      .then((data) => {
        setCards(data.cards)
        setCardsContext(data.context)
        setStreamComplete(true)
      })
      .catch((e: Error) => setError(e.message))
  }, [profile, setCards, setCardsContext])

  useEffect(() => {
    if (called.current) return
    if (cards) { setStreamComplete(true); setVisibleCount(cards.length); return }
    runFetch()
  }, [])

  useEffect(() => {
    if (!cards || !streamComplete) return
    cards.forEach((_, i) => { setTimeout(() => setVisibleCount(i + 1), i * 100) })
  }, [cards, streamComplete])

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 w-full">
      {/* Header */}
      <div className="mb-8">
        <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">AI-Matched</p>
        <h1 className="font-display text-4xl text-text-primary leading-tight mb-2">Cards matched to you</h1>
        {cardsContext && (
          <p className="font-body text-base text-text-secondary max-w-2xl leading-relaxed">{cardsContext}</p>
        )}
        {!cardsContext && !streamComplete && (
          <p className="font-body text-base text-text-secondary">Finding your best options…</p>
        )}
      </div>

      {!streamComplete && !error && (
        <GeneratingLoader label="Matching cards to your profile…" lines={8} />
      )}

      {error && (
        <ErrorCard message={error} onRetry={() => { called.current = false; runFetch() }} />
      )}

      {streamComplete && cards && (
        <div className="flex flex-col gap-4">
          {/* Cards grid — 1 col on mobile, 3 on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cards.map((card, i) => (
              <CardTile
                key={i}
                card={card}
                index={i}
                visible={visibleCount > i}
                onSelect={() => onSelectCard(card)}
              />
            ))}
          </div>

          {/* "Already approved" shortcut */}
          <button
            onClick={onApproved}
            className="w-full py-4 mt-2 rounded-2xl border border-border font-body text-sm text-text-secondary
              hover:border-border-hover hover:text-text-primary transition-all"
          >
            I already got approved — show me my roadmap →
          </button>
        </div>
      )}
    </div>
  )
}
