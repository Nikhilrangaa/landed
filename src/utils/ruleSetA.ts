import { type UserProfile } from '../types'

/**
 * Rule Set A — applied once after all intake questions are answered.
 * Derives computed fields and enforces sync invariants.
 */
export function applyRuleSetA(profile: UserProfile): Partial<UserProfile> {
  const updates: Partial<UserProfile> = {}

  // ── Enforce hasExistingCard sync ──────────────────────────────────────────
  if (profile.isFirstCard !== null) {
    updates.hasExistingCard = !profile.isFirstCard
  }

  // ── creditHistory derivation for returning cardholders ───────────────────
  if (profile.isFirstCard === false) {
    const goodScore = profile.creditScore === 'good' || profile.creditScore === 'excellent'
    const solidCard =
      profile.existingCardType === 'student' ||
      profile.existingCardType === 'standard' ||
      profile.existingCardType === 'multiple'
    if (solidCard && goodScore) {
      updates.creditHistory = 'yes'
    } else {
      updates.creditHistory = 'some'
    }
    // Also carry missedPayment default if not set
    if (profile.missedPayment === null) {
      updates.missedPayment = false
    }
  }

  // ── creditHistory/creditScore for first-card path ────────────────────────
  // (already set during Q4 onSelect, but enforce here in case of demo mode injection)
  if (profile.isFirstCard === true) {
    if (profile.creditHistory === 'none') {
      updates.creditScore = 'none'
    } else if (profile.creditHistory === 'some') {
      updates.creditScore = profile.creditScore ?? 'none'
    }
    // 'yes' keeps whatever score was chosen
  }

  // ── J-1 default: on-campus work authorized ───────────────────────────────
  if (
    profile.visaType === 'J1' &&
    profile.onCampusWorkAuth !== false
  ) {
    updates.onCampusWorkAuth = true
  }

  // ── hasUSBankAccount routing ──────────────────────────────────────────────
  // (already set per branch — domestic Q9 / international I-branch)
  // Just ensure it's not null when studentType is known
  if (profile.studentType !== null && profile.hasUSBankAccount === null) {
    updates.hasUSBankAccount = false // safe default
  }

  // ── hasSSN default for domestic ───────────────────────────────────────────
  if (profile.studentType === 'domestic' && profile.hasSSN === null) {
    updates.hasSSN = true // domestic students almost always have SSN
  }

  // ── OPT/STEM-OPT: off-campus work is authorized (they're employed in field) ──
  if (profile.visaType === 'OPT' || profile.visaType === 'STEM-OPT') {
    updates.offCampusWorkAuth = true
  }

  return updates
}
