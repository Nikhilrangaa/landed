import { QuestionLayout } from '../components/QuestionLayout'
import { TogglePair } from '../components/OptionButton'
import { useLandedStore } from '../store'

interface Props {
  onNext: () => void
  animClass?: string
}

export function Q1_StudentType({ onNext, animClass }: Props) {
  const { profile, setProfile } = useLandedStore()

  const handleSelect = (val: string) => {
    setProfile({ studentType: val === 'Domestic' ? 'domestic' : 'international' })
  }

  return (
    <QuestionLayout
      questionNumber={1}
      totalQuestions={7}
      question="Are you a domestic or international student?"
      onContinue={onNext}
      continueDisabled={profile.studentType === null}
      animClass={animClass}
    >
      <TogglePair
        options={['Domestic', 'International']}
        selected={
          profile.studentType === 'domestic'
            ? 'Domestic'
            : profile.studentType === 'international'
            ? 'International'
            : null
        }
        onSelect={handleSelect}
      />
    </QuestionLayout>
  )
}
