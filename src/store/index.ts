import { create } from 'zustand'
import { type UserProfile, defaultProfile, type Tip, type CardRecommendation, type FieldGuidance, type Roadmap, type Message } from '../types'

interface LandedStore {
  // Profile
  profile: UserProfile
  setProfile: (updates: Partial<UserProfile>) => void
  resetProfile: () => void

  // Onboarding
  currentQuestion: number
  setQuestion: (n: number) => void
  onboardingComplete: boolean
  setOnboardingComplete: (v: boolean) => void

  // Results
  tips: Tip[] | null
  setTips: (tips: Tip[] | null) => void
  cards: CardRecommendation[] | null
  setCards: (cards: CardRecommendation[] | null) => void
  cardsContext: string
  setCardsContext: (ctx: string) => void
  selectedCard: CardRecommendation | null
  setSelectedCard: (card: CardRecommendation | null) => void
  fieldGuidance: FieldGuidance[] | null
  setFieldGuidance: (fields: FieldGuidance[] | null) => void
  fieldGuidanceIncome: string
  setFieldGuidanceIncome: (s: string) => void
  fieldGuidanceRisks: string[]
  setFieldGuidanceRisks: (r: string[]) => void
  roadmap: Roadmap | null
  setRoadmap: (r: Roadmap | null) => void

  // Screen navigation
  currentScreen: 'onboarding' | 'tips' | 'cards' | 'walkthrough' | 'roadmap'
  setCurrentScreen: (s: 'onboarding' | 'tips' | 'cards' | 'walkthrough' | 'roadmap') => void

  // Chat
  chatMessages: Message[]
  chatOpen: boolean
  addMessage: (msg: Message) => void
  updateLastAssistantMessage: (content: string) => void
  toggleChat: () => void
  setChatOpen: (v: boolean) => void
}

export const useLandedStore = create<LandedStore>((set) => ({
  profile: { ...defaultProfile },
  setProfile: (updates) =>
    set((state) => ({ profile: { ...state.profile, ...updates } })),
  resetProfile: () => set({ profile: { ...defaultProfile } }),

  currentQuestion: 1,
  setQuestion: (n) => set({ currentQuestion: n }),
  onboardingComplete: false,
  setOnboardingComplete: (v) => set({ onboardingComplete: v }),

  tips: null,
  setTips: (tips) => set({ tips }),
  cards: null,
  setCards: (cards) => set({ cards }),
  cardsContext: '',
  setCardsContext: (cardsContext) => set({ cardsContext }),
  selectedCard: null,
  setSelectedCard: (selectedCard) => set({ selectedCard }),
  fieldGuidance: null,
  setFieldGuidance: (fieldGuidance) => set({ fieldGuidance }),
  fieldGuidanceIncome: '',
  setFieldGuidanceIncome: (fieldGuidanceIncome) => set({ fieldGuidanceIncome }),
  fieldGuidanceRisks: [],
  setFieldGuidanceRisks: (fieldGuidanceRisks) => set({ fieldGuidanceRisks }),
  roadmap: null,
  setRoadmap: (roadmap) => set({ roadmap }),

  currentScreen: 'onboarding',
  setCurrentScreen: (currentScreen) => set({ currentScreen }),

  chatMessages: [],
  chatOpen: false,
  addMessage: (msg) =>
    set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  updateLastAssistantMessage: (content) =>
    set((state) => {
      const msgs = [...state.chatMessages]
      const lastIdx = msgs.map((m) => m.role).lastIndexOf('assistant')
      if (lastIdx !== -1) msgs[lastIdx] = { ...msgs[lastIdx], content }
      return { chatMessages: msgs }
    }),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  setChatOpen: (chatOpen) => set({ chatOpen }),
}))
