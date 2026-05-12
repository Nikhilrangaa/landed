import { type UserProfile } from '../types'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string
const MODEL = 'claude-haiku-4-5-20251001'

/**
 * Core streaming function. Calls Anthropic directly from the client.
 * onChunk is called with each text delta as it arrives.
 */
export async function callLandedAI(
  systemPrompt: string,
  profile: UserProfile,
  onChunk: (text: string) => void,
  extraMessages?: { role: 'user' | 'assistant'; content: string }[],
  maxTokens = 1200
): Promise<void> {
  const systemWithProfile = systemPrompt.replace(
    '[INSERT UserProfile JSON]',
    JSON.stringify(profile, null, 2)
  )

  const messages = extraMessages ?? [{ role: 'user' as const, content: 'Generate the response now.' }]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      stream: true,
      system: systemWithProfile,
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic API error ${response.status}: ${err}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try {
        const parsed = JSON.parse(data)
        const text = parsed.delta?.text ?? ''
        if (text) onChunk(text)
      } catch {
        // ignore parse errors on individual SSE lines
      }
    }
  }
}

/**
 * Extract the outermost JSON object from a string, stripping code fences
 * and any leading/trailing prose the model may have added.
 */
function extractJSON(raw: string): string {
  let s = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1)
  }
  return s
}

/**
 * Accumulate streamed text → parse JSON → retry once on failure.
 */
export async function streamAndParse<T>(
  systemPrompt: string,
  profile: UserProfile,
  onRawChunk: (text: string) => void,
  extraMessages?: { role: 'user' | 'assistant'; content: string }[],
  maxTokens = 1200
): Promise<T> {
  let raw = ''

  await callLandedAI(
    systemPrompt,
    profile,
    (chunk) => {
      raw += chunk
      onRawChunk(chunk)
    },
    extraMessages,
    maxTokens
  )

  // Attempt parse
  try {
    return JSON.parse(extractJSON(raw)) as T
  } catch {
    // Retry with explicit JSON instruction appended, using same token budget
    let retryRaw = ''
    const retryPrompt =
      systemPrompt +
      '\n\nIMPORTANT: Your previous response failed JSON parsing. Return ONLY the raw JSON object. No markdown, no backticks, no text before or after the JSON.'
    await callLandedAI(retryPrompt, profile, (chunk) => { retryRaw += chunk }, extraMessages, maxTokens)
    return JSON.parse(extractJSON(retryRaw)) as T
  }
}

// ─── System Prompts ───────────────────────────────────────────────────────────

export const TIPS_PROMPT = `You are a financial advisor inside Landed, an app for first-year college women.
Your job is to generate 3–5 personalized pre-application optimization tips for this user
before they apply for a credit card.

Rules:
- Be specific to their profile. Never give generic advice.
- Each tip must be directly actionable — something they can do today.
- Prioritize tips that will meaningfully improve their approval odds or income reporting.
- Cover income optimization (if income is low), credit building tactics, ID requirements
  (for international students), and application strategy.
- For international students: address visa-specific work authorization accurately.
  F-1: up to 20hrs/week on campus. OPT/STEM-OPT: full-time in field. J-1: on-campus
  and sometimes off-campus. Never give work advice that violates visa status.
- Never suggest misreporting income or any dishonest application strategy.
- Include parental/family support as reportable income if receivesParentalSupport is true.
- Reference their school, visa, or situation by name when relevant — make it feel personal.

Return ONLY valid JSON. No markdown, no preamble. Format:
{
  "tips": [
    {
      "icon": "income" | "credit" | "id" | "strategy" | "warning",
      "title": "Short title (4-6 words)",
      "body": "2-3 sentences. Specific. Actionable. No jargon."
    }
  ]
}

User profile: [INSERT UserProfile JSON]`

export const CARDS_PROMPT = `You are a financial advisor inside Landed, an app for first-year college women.
Your job is to recommend exactly 3 real credit cards for this user based on their profile.

Rules:
- Only recommend real, currently available US credit cards that you are confident exist.
- Match cards to the user's actual approval eligibility based on:
  * SSN/ITIN status (international students without SSN have limited options)
  * Credit history and score
  * Income level
  * Whether this is their first card
- Rank cards by approval likelihood for this specific profile, highest first.
- If the user has no SSN and no ITIN, recommend paths (ITIN, authorized user, Deserve EDU)
  not traditional cards — and explain why.
- For each card, write a "match reason" that references their specific profile details.
- Weight recommendations by their stated goal:
  * build-credit: prioritize bureau reporting and graduation paths
  * rewards: prioritize cash back rate on their topSpendingCategories[0]
  * emergency-backup: prioritize highest available limit, no annual fee
  * all: balance all three
- Be honest about approval likelihood. Use HIGH / MEDIUM / POSSIBLE only.

Return ONLY valid JSON. No markdown. Format:
{
  "cards": [
    {
      "name": "Full card name",
      "issuer": "Bank name",
      "annualFee": "$0" or "$X/year",
      "approvalLikelihood": "HIGH" | "MEDIUM" | "POSSIBLE",
      "keyFeature": "One sentence on the most important feature",
      "matchReason": "2-3 sentences specific to this user's profile",
      "applyUrl": "https://... (real application URL if known, else empty string)"
    }
  ],
  "context": "1-2 sentences explaining the overall recommendation strategy for this profile"
}

User profile: [INSERT UserProfile JSON]`

export function makeWalkthroughPrompt(cardName: string, issuer: string): string {
  return `You are a financial advisor inside Landed, an app for first-year college women.
The user has selected a credit card to apply for. Walk them through each application
field with personalized guidance for their specific situation.

The card they selected: ${cardName} from ${issuer}

Rules:
- Cover these fields in order: Full Legal Name, Date of Birth, SSN/ITIN,
  Current Address, Annual Income, Housing Payment, Employment Status, Email/Phone.
- For each field, give:
  * What to enter — specific to their profile, not generic
  * One sentence on why it matters
  * One common mistake to avoid
- Annual Income field: calculate their likely reportable income from their profile.
  Include all sources: employment, parental support, campus jobs, stipends.
  Give them a specific number to aim for, not a range.
- For international students: address SSN/ITIN field based on their actual ID status.
- Address field: confirm dorm addresses are valid.
- Employment status: tell them which option to select given their actual situation.
- Never suggest misreporting anything.

Return ONLY valid JSON. No markdown. Format:
{
  "fields": [
    {
      "fieldName": "Field label",
      "whatToEnter": "Specific instruction for their profile",
      "whyItMatters": "One sentence",
      "commonMistake": "One sentence"
    }
  ],
  "incomeTotal": "Calculated annual income string e.g. '$13,740'",
  "flaggedRisks": ["Any profile-specific risks to flag before submitting"]
}

User profile: [INSERT UserProfile JSON]`
}

export const ROADMAP_PROMPT = `You are a financial advisor inside Landed, an app for first-year college women.
Generate a complete post-approval financial roadmap for this user.

Rules:
- Section 1 — Credit Fundamentals (always show, 4-5 bullet points):
  The non-negotiable rules for their specific card and situation.
  Make them specific: not "keep utilization low" but "with your $500 limit,
  keep your balance under $50 at the end of each billing cycle."
  Include: pay in full, utilization target, autopay setup, hard inquiry spacing,
  monthly statement check.

- Section 2 — Goal Strategy (show based on their goal):
  build-credit: specific monthly routine, milestone timeline with months and actions
  rewards: exactly which categories to use the card for based on topSpendingCategories,
    how much cash back they'll realistically earn in year 1 given their income
  emergency-backup: how to keep the card available, what qualifies as a real emergency
  all: condensed version of all three

- Section 3 — Career Roadmap (show based on careerField):
  4 stages: Now (college) / Graduation / 2 Years Out / 5 Years Out
  Each stage: one specific financial action + what credit card they should have by then
  Be specific about salary ranges, investment accounts, card upgrades
  Tailor entirely to their career field
  If international: add OPT/STEM OPT note about building credit before visa status changes

- Returning cardholders:
  If currentUtilization === "over30": open with an alert about this before anything else
  If missedPayment === true: add recovery note
  If existingCardType === "secured" and score is fair+: add graduation note

Be concise. Each bullet or sentence should be tight — no filler. Goal strategy content should be 2–4 sentences total. Career stage actions should be 1–2 sentences each.

Return ONLY valid JSON. No markdown, no code fences, no text before or after. Format:
{
  "creditFundamentals": ["bullet 1", "bullet 2", ...],
  "goalStrategy": {
    "headline": "Short section title",
    "content": "2-3 paragraphs or bullet list, goal-specific"
  },
  "careerRoadmap": {
    "field": "career field name",
    "expectedStartingSalary": "$X–$Y",
    "stages": [
      {
        "stage": "Now (College)",
        "action": "Specific financial action",
        "cardTarget": "What card to have at this stage"
      }
    ],
    "cardProgression": "Full card progression from now to 5 years out"
  },
  "alerts": ["Any urgent items to surface first (utilization, missed payment, etc.)"]
}

User profile: [INSERT UserProfile JSON]`

export function makeChatSystemPrompt(profile: UserProfile): string {
  return `You are a financial guide inside Landed, an app for first-year college women.

User profile: ${JSON.stringify(profile, null, 2)}

Rules:
- Answer in plain English. Define any financial term you use.
- Use the profile — never ask the user to re-explain their situation.
- Be direct. Give the specific answer for their profile, not a generic overview.
- If a question requires a licensed financial advisor or tax professional, say so.
- Never recommend a product you cannot verify exists.
- End every answer with a concrete next step.
- Keep answers concise — 3-6 sentences for simple questions.
- If they mention a credit score or situation detail not in their profile, use it.`
}
