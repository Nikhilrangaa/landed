import { useState, useCallback } from 'react'
import { useLandedStore } from '../store'
import { Q1_StudentType } from './Q1_StudentType'
import { Q2_FirstCard } from './Q2_FirstCard'
import { Q3_Income } from './Q3_Income'
import { Q4_CreditHistory } from './Q4_CreditHistory'
import { Q5_Goal } from './Q5_Goal'
import { Q6_Spending } from './Q6_Spending'
import { Q7_Career } from './Q7_Career'
import { BranchFlow } from './BranchFlow'

// Step indices: 1–7 are the main questions
// R1–R4: returning cardholder sub-branch (after Q2 if isFirstCard===false)
// BRANCH: international/domestic/all-user questions (after Q7)

type Step =
  | 'Q1' | 'Q2'
  | 'R1' | 'R2' | 'R3' | 'R4'
  | 'Q3' | 'Q4' | 'Q5' | 'Q6' | 'Q7'
  | 'BRANCH'

const STEP_ORDER_FIRST: Step[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'BRANCH']
const STEP_ORDER_RETURNING: Step[] = ['Q1', 'Q2', 'R1', 'R2', 'R3', 'R4', 'Q3', 'Q5', 'Q6', 'Q7', 'BRANCH']

interface Props {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: Props) {
  const { profile } = useLandedStore()
  const [step, setStep] = useState<Step>('Q1')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const animClass = direction === 'forward' ? 'slide-enter-right' : 'slide-enter-left'

  const getOrder = (): Step[] => {
    if (profile.isFirstCard === false) return STEP_ORDER_RETURNING
    return STEP_ORDER_FIRST
  }

  const goNext = useCallback(() => {
    setDirection('forward')
    const order = getOrder()
    const idx = order.indexOf(step)
    if (idx < order.length - 1) {
      setStep(order[idx + 1])
    } else {
      onComplete()
    }
  }, [step, profile.isFirstCard, onComplete])

  const goBack = useCallback(() => {
    setDirection('back')
    const order = getOrder()
    const idx = order.indexOf(step)
    if (idx > 0) {
      setStep(order[idx - 1])
    }
  }, [step, profile.isFirstCard])

  const commonProps = { animClass }

  if (step === 'Q1') {
    return <Q1_StudentType onNext={goNext} {...commonProps} />
  }

  if (step === 'Q2') {
    return (
      <Q2_FirstCard
        onBack={goBack}
        onNext={(isFirst) => {
          setDirection('forward')
          setStep(isFirst ? 'Q3' : 'R1')
        }}
        {...commonProps}
      />
    )
  }

  // Returning cardholder sub-branch
  if (step === 'R1') return <R1_CardType onBack={goBack} onNext={goNext} animClass={animClass} />
  if (step === 'R2') return <R2_ScoreRange onBack={goBack} onNext={goNext} animClass={animClass} />
  if (step === 'R3') return <R3_Utilization onBack={goBack} onNext={goNext} animClass={animClass} />
  if (step === 'R4') return <R4_ReturningGoal onBack={goBack} onNext={goNext} animClass={animClass} />

  if (step === 'Q3') return <Q3_Income onBack={goBack} onNext={goNext} {...commonProps} />
  if (step === 'Q4') return <Q4_CreditHistory onBack={goBack} onNext={goNext} {...commonProps} />
  if (step === 'Q5') return <Q5_Goal onBack={goBack} onNext={goNext} {...commonProps} />
  if (step === 'Q6') return <Q6_Spending onBack={goBack} onNext={goNext} {...commonProps} />
  if (step === 'Q7') {
    return (
      <Q7_Career
        onBack={goBack}
        onNext={() => {
          setDirection('forward')
          setStep('BRANCH')
        }}
        {...commonProps}
      />
    )
  }

  if (step === 'BRANCH') {
    return (
      <BranchFlow
        onBack={() => {
          setDirection('back')
          const order = getOrder()
          const idx = order.indexOf('BRANCH')
          setStep(order[idx - 1])
        }}
        onComplete={onComplete}
        animClass={animClass}
      />
    )
  }

  return null
}

// ─── Returning Cardholder Sub-Branch ─────────────────────────────────────────

import { QuestionLayout } from '../components/QuestionLayout'
import { OptionButton } from '../components/OptionButton'
import { type UserProfile } from '../types'

function R1_CardType({ onBack, onNext, animClass }: { onBack: () => void; onNext: () => void; animClass?: string }) {
  const { profile, setProfile } = useLandedStore()
  const options: { label: string; sub: string; value: UserProfile['existingCardType'] }[] = [
    { label: 'Secured card', sub: 'Required a deposit to open', value: 'secured' },
    { label: 'Student card', sub: 'Designed for students with limited credit', value: 'student' },
    { label: 'Standard card', sub: 'Regular consumer credit card', value: 'standard' },
    { label: 'Multiple cards', sub: 'I have more than one', value: 'multiple' },
  ]
  return (
    <QuestionLayout
      questionNumber={3}
      totalQuestions={10}
      question="What type of card do you currently have?"
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.existingCardType === null}
      animClass={animClass}
    >
      <div className="flex flex-col gap-3">
        {options.map(({ label, sub, value }) => (
          <OptionButton
            key={value}
            selected={profile.existingCardType === value}
            onClick={() => setProfile({ existingCardType: value })}
          >
            <div>
              <div className="font-medium">{label}</div>
              <div className="text-sm text-[#888880] mt-0.5">{sub}</div>
            </div>
          </OptionButton>
        ))}
      </div>
    </QuestionLayout>
  )
}

function R2_ScoreRange({ onBack, onNext, animClass }: { onBack: () => void; onNext: () => void; animClass?: string }) {
  const { profile, setProfile } = useLandedStore()
  const options: { label: string; value: UserProfile['creditScore'] }[] = [
    { label: 'Poor (300–579)', value: 'poor' },
    { label: 'Fair (580–669)', value: 'fair' },
    { label: 'Good (670–739)', value: 'good' },
    { label: 'Excellent (740+)', value: 'excellent' },
    { label: 'Not sure', value: 'none' },
  ]
  return (
    <QuestionLayout
      questionNumber={4}
      totalQuestions={10}
      question="What's your credit score range?"
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.creditScore === null}
      animClass={animClass}
    >
      <div className="flex flex-col gap-3">
        {options.map(({ label, value }) => (
          <OptionButton
            key={value}
            selected={profile.creditScore === value}
            onClick={() => setProfile({ creditScore: value, creditHistory: value === 'none' ? 'some' : 'yes' })}
          >
            {label}
          </OptionButton>
        ))}
      </div>
    </QuestionLayout>
  )
}

function R3_Utilization({ onBack, onNext, animClass }: { onBack: () => void; onNext: () => void; animClass?: string }) {
  const { profile, setProfile } = useLandedStore()
  const options: { label: string; sub: string; value: UserProfile['currentUtilization'] }[] = [
    { label: 'Under 10%', sub: 'Excellent — barely using it', value: 'under10' },
    { label: '10% – 30%', sub: 'Healthy range', value: '10to30' },
    { label: 'Over 30%', sub: 'May be hurting your score', value: 'over30' },
    { label: 'Not sure', sub: "I don't know my utilization", value: 'unknown' },
  ]
  return (
    <QuestionLayout
      questionNumber={5}
      totalQuestions={10}
      question="What's your current credit utilization?"
      subtext="This is your balance ÷ your credit limit."
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.currentUtilization === null}
      animClass={animClass}
    >
      <div className="flex flex-col gap-3">
        {options.map(({ label, sub, value }) => (
          <OptionButton
            key={value}
            selected={profile.currentUtilization === value}
            onClick={() => setProfile({ currentUtilization: value })}
          >
            <div>
              <div className="font-medium">{label}</div>
              <div className="text-sm text-[#888880] mt-0.5">{sub}</div>
            </div>
          </OptionButton>
        ))}
      </div>
    </QuestionLayout>
  )
}

function R4_ReturningGoal({ onBack, onNext, animClass }: { onBack: () => void; onNext: () => void; animClass?: string }) {
  const { profile, setProfile } = useLandedStore()
  const options: { icon: string; label: string; sub: string; value: UserProfile['returningGoal'] }[] = [
    { icon: '⬆️', label: 'Upgrade my card', sub: 'Graduation to unsecured, or a better product', value: 'upgrade' },
    { icon: '➕', label: 'Add a second card', sub: 'Diversify rewards or credit mix', value: 'add-second' },
    { icon: '📊', label: 'Understand my usage', sub: 'Am I using my card optimally?', value: 'understand-usage' },
  ]
  return (
    <QuestionLayout
      questionNumber={6}
      totalQuestions={10}
      question="What's your main goal right now?"
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.returningGoal === null}
      animClass={animClass}
    >
      <div className="flex flex-col gap-3">
        {options.map(({ icon, label, sub, value }) => (
          <OptionButton
            key={value}
            selected={profile.returningGoal === value}
            onClick={() => setProfile({ returningGoal: value })}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">{icon}</span>
              <div>
                <div className="font-medium">{label}</div>
                <div className="text-sm text-[#888880] mt-0.5">{sub}</div>
              </div>
            </div>
          </OptionButton>
        ))}
      </div>
    </QuestionLayout>
  )
}
