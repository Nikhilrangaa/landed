import { QuestionLayout } from '../components/QuestionLayout'
import { OptionButton } from '../components/OptionButton'
import { useLandedStore } from '../store'
import { type UserProfile } from '../types'

const HISTORY_OPTIONS: { label: string; sub: string; value: UserProfile['creditHistory'] }[] = [
  { label: 'None at all', sub: 'I\'ve never had a credit account in the US', value: 'none' },
  { label: 'A little', sub: 'I\'m an authorized user on someone\'s card, or have 1 account', value: 'some' },
  { label: 'Yes, 1+ years', sub: 'I have at least one account with a year of history', value: 'yes' },
]

const SCORE_OPTIONS: { label: string; value: UserProfile['creditScore'] }[] = [
  { label: 'Poor (300–579)', value: 'poor' },
  { label: 'Fair (580–669)', value: 'fair' },
  { label: 'Good (670–739)', value: 'good' },
  { label: 'Excellent (740+)', value: 'excellent' },
]

interface Props {
  onBack: () => void
  onNext: () => void
  animClass?: string
}

export function Q4_CreditHistory({ onBack, onNext, animClass }: Props) {
  const { profile, setProfile } = useLandedStore()

  const handleHistorySelect = (value: UserProfile['creditHistory']) => {
    if (value === 'none') {
      setProfile({ creditHistory: 'none', creditScore: 'none' })
    } else if (value === 'some') {
      setProfile({ creditHistory: 'some', creditScore: 'none' })
    } else {
      setProfile({ creditHistory: 'yes', creditScore: null })
    }
  }

  const continueDisabled =
    profile.creditHistory === null ||
    (profile.creditHistory === 'yes' && profile.creditScore === null)

  return (
    <QuestionLayout
      questionNumber={4}
      totalQuestions={7}
      question="Do you have any US credit history?"
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={continueDisabled}
      animClass={animClass}
    >
      <div className="flex flex-col gap-3">
        {HISTORY_OPTIONS.map(({ label, sub, value }) => (
          <OptionButton
            key={value}
            selected={profile.creditHistory === value}
            onClick={() => handleHistorySelect(value)}
          >
            <div>
              <div className="font-medium">{label}</div>
              <div className="text-sm text-[#888880] mt-0.5">{sub}</div>
            </div>
          </OptionButton>
        ))}

        {/* Score picker — only shown when creditHistory === 'yes' */}
        {profile.creditHistory === 'yes' && (
          <div className="mt-4">
            <p className="font-body text-sm text-[#888880] mb-3">
              Roughly, what's your credit score?
            </p>
            <div className="flex flex-col gap-2">
              {SCORE_OPTIONS.map(({ label, value }) => (
                <OptionButton
                  key={value}
                  selected={profile.creditScore === value}
                  onClick={() => setProfile({ creditScore: value })}
                >
                  {label}
                </OptionButton>
              ))}
            </div>
          </div>
        )}
      </div>
    </QuestionLayout>
  )
}
