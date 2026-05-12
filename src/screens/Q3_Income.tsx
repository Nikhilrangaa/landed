import { QuestionLayout } from '../components/QuestionLayout'
import { OptionButton } from '../components/OptionButton'
import { useLandedStore } from '../store'
import { type UserProfile } from '../types'

const INCOME_OPTIONS: { label: string; value: UserProfile['monthlyIncome'] }[] = [
  { label: '$0 — no income right now', value: '$0' },
  { label: '$1 – $500 / month', value: '$1-500' },
  { label: '$500 – $1,000 / month', value: '$500-1000' },
  { label: '$1,000 – $2,000 / month', value: '$1000-2000' },
  { label: '$2,000+ / month', value: '$2000+' },
]

interface Props {
  onBack: () => void
  onNext: () => void
  animClass?: string
}

export function Q3_Income({ onBack, onNext, animClass }: Props) {
  const { profile, setProfile } = useLandedStore()

  return (
    <QuestionLayout
      questionNumber={3}
      totalQuestions={7}
      question="What's your total monthly income from all sources?"
      subtext="Include family support, campus jobs, stipends — it all counts."
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.monthlyIncome === null}
      animClass={animClass}
    >
      <div className="flex flex-col gap-3">
        {INCOME_OPTIONS.map(({ label, value }) => (
          <OptionButton
            key={value}
            selected={profile.monthlyIncome === value}
            onClick={() => setProfile({ monthlyIncome: value })}
          >
            {label}
          </OptionButton>
        ))}
      </div>
    </QuestionLayout>
  )
}
