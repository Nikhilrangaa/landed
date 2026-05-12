import { useState } from 'react'
import { useLandedStore } from '../store'
import { TipsScreen } from './TipsScreen'
import { CardResultsScreen } from './CardResultsScreen'
import { WalkthroughScreen } from './WalkthroughScreen'
import { RoadmapScreen } from './RoadmapScreen'
import { AIChat } from '../components/AIChat'
import { type CardRecommendation } from '../types'

type ResultStep = 'tips' | 'cards' | 'walkthrough' | 'roadmap'

interface Props {
  onRestart?: () => void
  initialStep?: ResultStep
}

const STEP_LABELS: Record<ResultStep, string> = {
  tips: 'Prep Tips',
  cards: 'Card Matches',
  walkthrough: 'Apply Guide',
  roadmap: 'Your Roadmap',
}

export function ResultsFlow({ onRestart, initialStep = 'tips' }: Props) {
  const { setSelectedCard } = useLandedStore()
  const [step, setStep] = useState<ResultStep>(initialStep)
  const [selectedCardLocal, setSelectedCardLocal] = useState<CardRecommendation | null>(null)

  const handleSelectCard = (card: CardRecommendation) => {
    setSelectedCard(card)
    setSelectedCardLocal(card)
    setStep('walkthrough')
  }

  const handleApproved = () => {
    setStep('roadmap')
  }

  const steps: ResultStep[] = ['tips', 'cards', 'walkthrough', 'roadmap']
  const currentIdx = steps.indexOf(step)

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="font-display text-lg font-semibold text-text-primary">Landed.</span>

          {/* Step breadcrumb */}
          <div className="hidden sm:flex items-center gap-1">
            {steps.map((s, i) => {
              if (s === 'walkthrough' && !selectedCardLocal) return null
              const past = i < currentIdx
              const active = s === step
              return (
                <div key={s} className="flex items-center gap-1">
                  {i > 0 && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-border-hover mx-0.5">
                      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  )}
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-full transition-all ${
                    active
                      ? 'bg-accent-light text-accent font-medium'
                      : past
                      ? 'text-text-muted'
                      : 'text-text-muted opacity-40'
                  }`}>
                    {STEP_LABELS[s]}
                  </span>
                </div>
              )
            })}
          </div>

          {onRestart && (
            <button
              onClick={onRestart}
              className="font-body text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Start over
            </button>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1">
        {step === 'tips' && (
          <TipsScreen onNext={() => setStep('cards')} />
        )}

        {step === 'cards' && (
          <CardResultsScreen
            onSelectCard={handleSelectCard}
            onApproved={handleApproved}
          />
        )}

        {step === 'walkthrough' && selectedCardLocal && (
          <WalkthroughScreen
            card={selectedCardLocal}
            onApproved={handleApproved}
            onBack={() => setStep('cards')}
          />
        )}

        {step === 'walkthrough' && !selectedCardLocal && (
          <CardResultsScreen
            onSelectCard={handleSelectCard}
            onApproved={handleApproved}
          />
        )}

        {step === 'roadmap' && (
          <RoadmapScreen
            onBack={() => setStep(selectedCardLocal ? 'walkthrough' : 'cards')}
          />
        )}
      </div>

      {/* AI Chat */}
      <AIChat />
    </div>
  )
}
