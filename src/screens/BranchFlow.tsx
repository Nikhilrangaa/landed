import { useState } from 'react'
import { useLandedStore } from '../store'
import { QuestionLayout } from '../components/QuestionLayout'
import { OptionButton } from '../components/OptionButton'
import { TogglePair } from '../components/OptionButton'
import { type UserProfile } from '../types'
import { applyRuleSetA } from '../utils/ruleSetA'

// Branch steps vary by studentType + shared all-user questions
type IntlStep = 'B_VISA' | 'B_SSN_INTL' | 'B_ITIN' | 'B_COUNTRY' | 'B_WORK_AUTH' | 'B_BANK_INTL'
type DomStep = 'B_EMPLOYED' | 'B_WORKSTUDY' | 'B_BANK_DOM'
type SharedStep = 'B_PARENTAL' | 'B_REJECTED'
type BranchStep = IntlStep | DomStep | SharedStep

const INTL_STEPS: BranchStep[] = ['B_VISA', 'B_SSN_INTL', 'B_ITIN', 'B_COUNTRY', 'B_WORK_AUTH', 'B_BANK_INTL', 'B_PARENTAL', 'B_REJECTED']
const DOM_STEPS: BranchStep[] = ['B_EMPLOYED', 'B_WORKSTUDY', 'B_BANK_DOM', 'B_PARENTAL', 'B_REJECTED']

const TOTAL_MAIN = 7

interface Props {
  onBack: () => void
  onComplete: () => void
  animClass?: string
}

export function BranchFlow({ onBack, onComplete }: Props) {
  const { profile, setProfile } = useLandedStore()
  const [stepIdx, setStepIdx] = useState(0)
  const [dir, setDir] = useState<'forward' | 'back'>('forward')
  const anim = dir === 'forward' ? 'slide-enter-right' : 'slide-enter-left'

  const steps: BranchStep[] =
    profile.studentType === 'international' ? INTL_STEPS : DOM_STEPS

  const step = steps[stepIdx]
  const isLast = stepIdx === steps.length - 1

  const goNext = () => {
    setDir('forward')
    if (isLast) {
      // Apply Rule Set A before completing
      const derived = applyRuleSetA({ ...profile })
      setProfile(derived)
      onComplete()
    } else {
      setStepIdx(stepIdx + 1)
    }
  }

  const goBack = () => {
    setDir('back')
    if (stepIdx === 0) {
      onBack()
    } else {
      setStepIdx(stepIdx - 1)
    }
  }

  const qNum = TOTAL_MAIN + stepIdx + 1
  const totalQ = TOTAL_MAIN + steps.length

  const props = { onBack: goBack, onNext: goNext, qNum, totalQ, animClass: anim }

  if (step === 'B_VISA') return <B_Visa {...props} />
  if (step === 'B_SSN_INTL') return <B_SSN_Intl {...props} />
  if (step === 'B_ITIN') return <B_ITIN {...props} />
  if (step === 'B_COUNTRY') return <B_Country {...props} />
  if (step === 'B_WORK_AUTH') return <B_WorkAuth {...props} />
  if (step === 'B_BANK_INTL') return <B_Bank {...props} />
  if (step === 'B_EMPLOYED') return <B_Employed {...props} />
  if (step === 'B_WORKSTUDY') return <B_WorkStudy {...props} />
  if (step === 'B_BANK_DOM') return <B_Bank {...props} />
  if (step === 'B_PARENTAL') return <B_Parental {...props} />
  if (step === 'B_REJECTED') return <B_Rejected {...props} onFinalNext={goNext} />

  return null
}

// ─── Shared prop shape ────────────────────────────────────────────────────────

interface StepProps {
  onBack: () => void
  onNext: () => void
  qNum: number
  totalQ: number
  animClass?: string
}

// ─── International branch ─────────────────────────────────────────────────────

function B_Visa({ onBack, onNext, qNum, totalQ, animClass }: StepProps) {
  const { profile, setProfile } = useLandedStore()
  const options: { label: string; sub: string; value: UserProfile['visaType'] }[] = [
    { label: 'F-1', sub: 'Full-time international student', value: 'F1' },
    { label: 'J-1', sub: 'Exchange visitor program', value: 'J1' },
    { label: 'OPT', sub: 'Optional Practical Training (post-graduation)', value: 'OPT' },
    { label: 'STEM OPT', sub: '24-month extension for STEM fields', value: 'STEM-OPT' },
  ]
  return (
    <QuestionLayout
      questionNumber={qNum}
      totalQuestions={totalQ}
      question="What's your visa type?"
      subtext="Just a few more details to personalize your matches."
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.visaType === null}
      animClass={animClass}
    >
      <div className="flex flex-col gap-3">
        {options.map(({ label, sub, value }) => (
          <OptionButton
            key={value}
            selected={profile.visaType === value}
            onClick={() => setProfile({ visaType: value })}
          >
            <div>
              <span className="font-mono text-accent mr-2">{label}</span>
              <span className="text-sm text-[#888880]">{sub}</span>
            </div>
          </OptionButton>
        ))}
      </div>
    </QuestionLayout>
  )
}

function B_SSN_Intl({ onBack, onNext, qNum, totalQ, animClass }: StepProps) {
  const { profile, setProfile } = useLandedStore()
  return (
    <QuestionLayout
      questionNumber={qNum}
      totalQuestions={totalQ}
      question="Do you have a US Social Security Number (SSN)?"
      subtext="SSN unlocks far more card options — OPT/work authorization often leads to one."
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.hasSSN === null}
      animClass={animClass}
    >
      <TogglePair
        options={['Yes', 'No']}
        selected={profile.hasSSN === true ? 'Yes' : profile.hasSSN === false ? 'No' : null}
        onSelect={(v) => setProfile({ hasSSN: v === 'Yes' })}
      />
    </QuestionLayout>
  )
}

function B_ITIN({ onBack, onNext, qNum, totalQ, animClass }: StepProps) {
  const { profile, setProfile } = useLandedStore()
  const [showInfo, setShowInfo] = useState(false)
  return (
    <QuestionLayout
      questionNumber={qNum}
      totalQuestions={totalQ}
      question="Do you have an Individual Taxpayer Identification Number (ITIN)?"
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.hasITIN === null}
      animClass={animClass}
    >
      <div className="flex flex-col gap-3">
        <TogglePair
          options={['Yes', 'No']}
          selected={profile.hasITIN === true ? 'Yes' : profile.hasITIN === false ? 'No' : null}
          onSelect={(v) => { setProfile({ hasITIN: v === 'Yes' }); setShowInfo(false) }}
        />
        <button
          onClick={() => { setShowInfo(!showInfo); setProfile({ hasITIN: false }) }}
          className="text-left font-body text-sm text-[#888880] underline decoration-dotted mt-1"
        >
          What's an ITIN?
        </button>
        {showInfo && (
          <div className="mt-1 p-4 rounded-xl bg-[#141414] border border-[#2A2A2A]">
            <p className="font-body text-sm text-[#F5F5F0] leading-relaxed">
              An ITIN is a tax ID issued by the IRS to people who can't get an SSN. Some banks (like Deserve) accept it for credit card applications. You can apply for one at an IRS Taxpayer Assistance Center — it's free and doesn't affect your immigration status.
            </p>
          </div>
        )}
      </div>
    </QuestionLayout>
  )
}

const COUNTRIES = [
  'China', 'India', 'South Korea', 'Canada', 'Brazil', 'Nigeria', 'Mexico',
  'Vietnam', 'Taiwan', 'Japan', 'Saudi Arabia', 'Iran', 'Germany', 'France',
  'United Kingdom', 'Pakistan', 'Indonesia', 'Turkey', 'Bangladesh', 'Nepal',
  'Ghana', 'Kenya', 'Colombia', 'Ethiopia', 'Philippines', 'Thailand',
  'Malaysia', 'Egypt', 'Argentina', 'Ukraine', 'Other',
]

function B_Country({ onBack, onNext, qNum, totalQ, animClass }: StepProps) {
  const { profile, setProfile } = useLandedStore()
  const [query, setQuery] = useState('')
  const filtered = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  )
  return (
    <QuestionLayout
      questionNumber={qNum}
      totalQuestions={totalQ}
      question="What country are you from?"
      subtext="This affects which credit-building paths are available to you."
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={!profile.homeCountry}
      animClass={animClass}
    >
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search country..."
          className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#2A2A2A] text-[#F5F5F0] font-body text-sm
            focus:outline-none focus:border-accent placeholder:text-[#444444]"
        />
        <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
          {filtered.map((c) => (
            <OptionButton
              key={c}
              selected={profile.homeCountry === c}
              onClick={() => { setProfile({ homeCountry: c }); setQuery(c) }}
            >
              {c}
            </OptionButton>
          ))}
        </div>
      </div>
    </QuestionLayout>
  )
}

function B_WorkAuth({ onBack, onNext, qNum, totalQ, animClass }: StepProps) {
  const { profile, setProfile } = useLandedStore()
  const isJ1 = profile.visaType === 'J1'
  return (
    <QuestionLayout
      questionNumber={qNum}
      totalQuestions={totalQ}
      question="Are you authorized to work on campus?"
      subtext={
        isJ1
          ? 'J-1 students are generally authorized for on-campus work.'
          : 'F-1 students can work up to 20 hrs/week on campus while school is in session.'
      }
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.onCampusWorkAuth === null}
      animClass={animClass}
    >
      <TogglePair
        options={['Yes', 'No']}
        selected={
          profile.onCampusWorkAuth === true ? 'Yes'
          : profile.onCampusWorkAuth === false ? 'No'
          : null
        }
        onSelect={(v) => setProfile({ onCampusWorkAuth: v === 'Yes' })}
      />
    </QuestionLayout>
  )
}

// ─── Domestic branch ──────────────────────────────────────────────────────────

function B_Employed({ onBack, onNext, qNum, totalQ, animClass }: StepProps) {
  const { profile, setProfile } = useLandedStore()
  return (
    <QuestionLayout
      questionNumber={qNum}
      totalQuestions={totalQ}
      question="Are you currently employed?"
      subtext="Part-time, full-time, or gig work all count."
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.isEmployed === null}
      animClass={animClass}
    >
      <TogglePair
        options={['Yes', 'No']}
        selected={profile.isEmployed === true ? 'Yes' : profile.isEmployed === false ? 'No' : null}
        onSelect={(v) => setProfile({ isEmployed: v === 'Yes' })}
      />
    </QuestionLayout>
  )
}

function B_WorkStudy({ onBack, onNext, qNum, totalQ, animClass }: StepProps) {
  const { profile, setProfile } = useLandedStore()
  const options = [
    { label: 'Yes', sub: "I have federal work-study in my financial aid package", value: true as const },
    { label: 'No', sub: "It's not part of my aid", value: false as const },
    { label: 'Not sure', sub: "I'll check my financial aid letter", value: null as null },
  ]
  return (
    <QuestionLayout
      questionNumber={qNum}
      totalQuestions={totalQ}
      question="Do you have access to federal work-study?"
      subtext="Work-study counts as verifiable employment income on applications."
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={false}
      animClass={animClass}
    >
      <div className="flex flex-col gap-3">
        {options.map(({ label, sub, value }) => (
          <OptionButton
            key={label}
            selected={profile.workStudyAccess === value}
            onClick={() => setProfile({ workStudyAccess: value })}
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

// ─── Shared (all users) ───────────────────────────────────────────────────────

function B_Bank({ onBack, onNext, qNum, totalQ, animClass }: StepProps) {
  const { profile, setProfile } = useLandedStore()
  return (
    <QuestionLayout
      questionNumber={qNum}
      totalQuestions={totalQ}
      question="Do you have a US bank account?"
      subtext="A checking or savings account at a US bank or credit union."
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.hasUSBankAccount === null}
      animClass={animClass}
    >
      <TogglePair
        options={['Yes', 'No']}
        selected={
          profile.hasUSBankAccount === true ? 'Yes'
          : profile.hasUSBankAccount === false ? 'No'
          : null
        }
        onSelect={(v) => setProfile({ hasUSBankAccount: v === 'Yes' })}
      />
    </QuestionLayout>
  )
}

function B_Parental({ onBack, onNext, qNum, totalQ, animClass }: StepProps) {
  const { profile, setProfile } = useLandedStore()
  const options: { label: string; sub: string; value: UserProfile['receivesParentalSupport'] }[] = [
    { label: 'Yes', sub: 'Regular transfers from family', value: true },
    { label: 'Sometimes', sub: 'Occasional support', value: 'sometimes' },
    { label: 'No', sub: "I'm financially independent", value: false },
  ]
  return (
    <QuestionLayout
      questionNumber={qNum}
      totalQuestions={totalQ}
      question="Do you receive financial support from family?"
      subtext="This counts as reportable income on credit applications — don't leave it out."
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.receivesParentalSupport === null}
      animClass={animClass}
    >
      <div className="flex flex-col gap-3">
        {options.map(({ label, sub, value }) => (
          <OptionButton
            key={label}
            selected={profile.receivesParentalSupport === value}
            onClick={() => setProfile({ receivesParentalSupport: value })}
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

interface B_RejectedProps extends StepProps {
  onFinalNext: () => void
}

function B_Rejected({ onBack, onNext, qNum, totalQ, animClass }: B_RejectedProps) {
  const { profile, setProfile } = useLandedStore()
  return (
    <QuestionLayout
      questionNumber={qNum}
      totalQuestions={totalQ}
      question="Have you been rejected for a credit card before?"
      subtext="No judgment — it helps us calibrate how aggressive to be with recommendations."
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={profile.hasBeenRejected === null}
      continueLabel="See my results →"
      animClass={animClass}
    >
      <TogglePair
        options={['Yes', 'No']}
        selected={
          profile.hasBeenRejected === true ? 'Yes'
          : profile.hasBeenRejected === false ? 'No'
          : null
        }
        onSelect={(v) => setProfile({ hasBeenRejected: v === 'Yes' })}
      />
    </QuestionLayout>
  )
}
