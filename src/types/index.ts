export type UserProfile = {
  // Core
  studentType: 'domestic' | 'international' | null
  visaType: 'F1' | 'J1' | 'OPT' | 'STEM-OPT' | null
  school: string
  major: string
  year: '1st' | '2nd' | '3rd' | '4th' | 'grad' | null
  careerField: 'tech' | 'engineering' | 'healthcare' | 'finance' | 'law' | 'education' | 'business' | 'arts' | 'undecided' | 'other' | null

  // ID
  hasSSN: boolean | null
  hasITIN: boolean | null
  homeCountry: string | null

  // Financial
  hasUSBankAccount: boolean | null
  monthlyIncome: '$0' | '$1-500' | '$500-1000' | '$1000-2000' | '$2000+' | null
  receivesParentalSupport: boolean | 'sometimes' | null
  topSpendingCategories: string[]

  // Credit
  isFirstCard: boolean | null
  hasExistingCard: boolean | null
  creditHistory: 'none' | 'some' | 'yes' | null
  creditScore: 'none' | 'poor' | 'fair' | 'good' | 'excellent' | null
  existingCardType: 'secured' | 'student' | 'standard' | 'multiple' | null
  currentUtilization: 'under10' | '10to30' | 'over30' | 'unknown' | null
  missedPayment: boolean | null
  returningGoal: 'upgrade' | 'add-second' | 'understand-usage' | null

  // Work (domestic)
  isEmployed: boolean | null
  workStudyAccess: boolean | null

  // Work (international)
  onCampusWorkAuth: boolean | null
  offCampusWorkAuth: boolean | null

  // Signals
  isAuthorizedUser: boolean | null
  hasHomeCreditHistory: boolean | null
  hasTrustedUSContact: boolean | null
  hasBeenRejected: boolean | null

  // Goal
  goal: 'build-credit' | 'rewards' | 'emergency-backup' | 'all' | null

  // Post-approval
  approvedCard: string | null
}

export const defaultProfile: UserProfile = {
  studentType: null,
  visaType: null,
  school: '',
  major: '',
  year: null,
  careerField: null,
  hasSSN: null,
  hasITIN: null,
  homeCountry: null,
  hasUSBankAccount: null,
  monthlyIncome: null,
  receivesParentalSupport: null,
  topSpendingCategories: [],
  isFirstCard: null,
  hasExistingCard: null,
  creditHistory: null,
  creditScore: null,
  existingCardType: null,
  currentUtilization: null,
  missedPayment: null,
  returningGoal: null,
  isEmployed: null,
  workStudyAccess: null,
  onCampusWorkAuth: null,
  offCampusWorkAuth: null,
  isAuthorizedUser: null,
  hasHomeCreditHistory: null,
  hasTrustedUSContact: null,
  hasBeenRejected: null,
  goal: null,
  approvedCard: null,
}

export interface Tip {
  icon: 'income' | 'credit' | 'id' | 'strategy' | 'warning'
  title: string
  body: string
}

export interface CardRecommendation {
  name: string
  issuer: string
  annualFee: string
  approvalLikelihood: 'HIGH' | 'MEDIUM' | 'POSSIBLE'
  keyFeature: string
  matchReason: string
  applyUrl: string
}

export interface FieldGuidance {
  fieldName: string
  whatToEnter: string
  whyItMatters: string
  commonMistake: string
}

export interface RoadmapStage {
  stage: string
  action: string
  cardTarget: string
}

export interface Roadmap {
  creditFundamentals: string[]
  goalStrategy: {
    headline: string
    content: string
  }
  careerRoadmap: {
    field: string
    expectedStartingSalary: string
    stages: RoadmapStage[]
    cardProgression: string
  }
  alerts: string[]
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}
