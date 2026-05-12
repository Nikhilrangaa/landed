import { useState, useCallback } from 'react'
import './index.css'
import { SplashScreen } from './screens/SplashScreen'
import { OnboardingFlow } from './screens/OnboardingFlow'
import { ResultsFlow } from './screens/ResultsFlow'
import { DemoMode } from './components/DemoMode'
import { useLandedStore } from './store'

type AppScreen = 'splash' | 'onboarding' | 'results'
type ResultStep = 'tips' | 'cards' | 'roadmap'

function App() {
  const [screen, setScreen] = useState<AppScreen>('splash')
  const [resultStep, setResultStep] = useState<ResultStep>('tips')

  const {
    resetProfile, setTips, setCards, setCardsContext,
    setFieldGuidance, setFieldGuidanceIncome, setFieldGuidanceRisks,
    setRoadmap, setSelectedCard,
  } = useLandedStore()

  const clearAIState = useCallback(() => {
    setTips(null)
    setCards(null)
    setCardsContext('')
    setFieldGuidance(null)
    setFieldGuidanceIncome('')
    setFieldGuidanceRisks([])
    setRoadmap(null)
    setSelectedCard(null)
  }, [setTips, setCards, setCardsContext, setFieldGuidance,
      setFieldGuidanceIncome, setFieldGuidanceRisks, setRoadmap, setSelectedCard])

  const handleRestart = useCallback(() => {
    resetProfile()
    clearAIState()
    setResultStep('tips')
    setScreen('splash')
  }, [resetProfile, clearAIState])

  const handleDemoSelect = useCallback((step: ResultStep) => {
    clearAIState()
    setResultStep(step)
    setScreen('results')
  }, [clearAIState])

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {screen === 'splash' && (
        <SplashScreen onStart={() => setScreen('onboarding')} />
      )}

      {screen === 'onboarding' && (
        <OnboardingFlow onComplete={() => { setResultStep('tips'); setScreen('results') }} />
      )}

      {screen === 'results' && (
        <ResultsFlow
          onRestart={handleRestart}
          initialStep={resultStep}
        />
      )}

      <DemoMode onSelect={handleDemoSelect} />
    </div>
  )
}

export default App
