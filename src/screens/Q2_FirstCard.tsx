import { QuestionLayout } from '../components/QuestionLayout'
import { TogglePair } from '../components/OptionButton'
import { useLandedStore } from '../store'

interface Props {
  onBack: () => void
  onNext: (isFirst: boolean) => void
  animClass?: string
}

export function Q2_FirstCard({ onBack, onNext, animClass }: Props) {
  const { profile, setProfile } = useLandedStore()

  const handleSelect = (val: string) => {
    const isFirst = val === 'Yes'
    setProfile({
      isFirstCard: isFirst,
      hasExistingCard: !isFirst,
    })
  }

  const handleContinue = () => {
    if (profile.isFirstCard !== null) {
      onNext(profile.isFirstCard)
    }
  }

  return (
    <QuestionLayout
      questionNumber={2}
      totalQuestions={7}
      question="Is this your first credit card?"
      onBack={onBack}
      onContinue={handleContinue}
      continueDisabled={profile.isFirstCard === null}
      animClass={animClass}
    >
      <TogglePair
        options={['Yes', 'No']}
        selected={
          profile.isFirstCard === true ? 'Yes' : profile.isFirstCard === false ? 'No' : null
        }
        onSelect={handleSelect}
      />
    </QuestionLayout>
  )
}
