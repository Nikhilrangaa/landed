import { QuestionLayout } from '../components/QuestionLayout'
import { useLandedStore } from '../store'

const SPENDING_OPTIONS = [
  'Dining',
  'Groceries',
  'Transport',
  'Subscriptions',
  'Online shopping',
  'Travel',
  'Other',
]

interface Props {
  onBack: () => void
  onNext: () => void
  animClass?: string
}

export function Q6_Spending({ onBack, onNext, animClass }: Props) {
  const { profile, setProfile } = useLandedStore()
  const selected = profile.topSpendingCategories

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      setProfile({ topSpendingCategories: selected.filter((s) => s !== opt) })
    } else {
      setProfile({ topSpendingCategories: [...selected, opt] })
    }
  }

  return (
    <QuestionLayout
      questionNumber={6}
      totalQuestions={7}
      question="Where do you spend the most?"
      subtext="Select all that apply. First selection = your top category."
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={selected.length === 0}
      animClass={animClass}
    >
      <div className="grid grid-cols-2 gap-3">
        {SPENDING_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt)
          const rank = selected.indexOf(opt) + 1
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`
                relative py-4 px-3 rounded-xl border font-body text-sm text-left transition-all
                ${isSelected
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-[#2A2A2A] text-[#F5F5F0] bg-[#141414] hover:border-[#444444]'
                }
              `}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent text-bg text-[10px] font-mono font-bold flex items-center justify-center">
                  {rank}
                </span>
              )}
              {opt}
            </button>
          )
        })}
      </div>
    </QuestionLayout>
  )
}
