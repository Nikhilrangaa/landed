import { QuestionLayout } from '../components/QuestionLayout'
import { OptionButton } from '../components/OptionButton'
import { useLandedStore } from '../store'
import { type UserProfile } from '../types'

const GOAL_OPTIONS: { icon: string; label: string; value: UserProfile['goal'] }[] = [
  { icon: '🏗', label: 'Build my credit history', value: 'build-credit' },
  { icon: '💰', label: 'Earn cash back and rewards', value: 'rewards' },
  { icon: '🛡', label: 'Have an emergency backup', value: 'emergency-backup' },
  { icon: '✦', label: 'All of the above', value: 'all' },
]

interface Props {
  onBack: () => void
  onNext: () => void
  animClass?: string
}

export function Q5_Goal({ onBack, onNext, animClass }: Props) {
  const { profile, setProfile } = useLandedStore()

  return (
    <QuestionLayout
      questionNumber={5}
      totalQuestions={7}
      question="What do you need a credit card for?"
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.goal === null}
      animClass={animClass}
    >
      <div className="flex flex-col gap-3">
        {GOAL_OPTIONS.map(({ icon, label, value }) => (
          <OptionButton
            key={value}
            selected={profile.goal === value}
            onClick={() => setProfile({ goal: value })}
          >
            <span className="mr-3 text-lg">{icon}</span>
            {label}
          </OptionButton>
        ))}
      </div>
    </QuestionLayout>
  )
}
