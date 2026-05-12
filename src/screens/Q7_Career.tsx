import { QuestionLayout } from '../components/QuestionLayout'
import { OptionButton } from '../components/OptionButton'
import { useLandedStore } from '../store'
import { type UserProfile } from '../types'

const CAREER_OPTIONS: { icon: string; label: string; value: UserProfile['careerField'] }[] = [
  { icon: '💻', label: 'Tech', value: 'tech' },
  { icon: '⚙️', label: 'Engineering', value: 'engineering' },
  { icon: '🏥', label: 'Healthcare', value: 'healthcare' },
  { icon: '📈', label: 'Finance', value: 'finance' },
  { icon: '⚖️', label: 'Law', value: 'law' },
  { icon: '📚', label: 'Education', value: 'education' },
  { icon: '💼', label: 'Business', value: 'business' },
  { icon: '🎨', label: 'Arts', value: 'arts' },
  { icon: '🧭', label: 'Undecided', value: 'undecided' },
]

interface Props {
  onBack: () => void
  onNext: () => void
  animClass?: string
}

export function Q7_Career({ onBack, onNext, animClass }: Props) {
  const { profile, setProfile } = useLandedStore()

  return (
    <QuestionLayout
      questionNumber={7}
      totalQuestions={7}
      question="What field are you heading into?"
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.careerField === null}
      continueLabel="Continue →"
      animClass={animClass}
    >
      <div className="grid grid-cols-2 gap-3">
        {CAREER_OPTIONS.map(({ icon, label, value }) => (
          <OptionButton
            key={value}
            selected={profile.careerField === value}
            onClick={() => setProfile({ careerField: value })}
          >
            <span className="mr-2">{icon}</span>
            {label}
          </OptionButton>
        ))}
      </div>
    </QuestionLayout>
  )
}
