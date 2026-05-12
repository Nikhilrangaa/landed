import { useState } from 'react'
import { useLandedStore } from '../store'
import { DEMO_PROFILES } from '../utils/demoProfiles'
import { applyRuleSetA } from '../utils/ruleSetA'

interface Props {
  onDemoSelect?: () => void
}

export function ProfileDebug({ onDemoSelect }: Props) {
  const { profile, setProfile, resetProfile } = useLandedStore()
  const [open, setOpen] = useState(false)

  const loadDemo = (idx: number) => {
    const demo = DEMO_PROFILES[idx]
    resetProfile()
    const derived = applyRuleSetA(demo.profile)
    setProfile({ ...demo.profile, ...derived })
    onDemoSelect?.()
  }

  // Only render in dev or when demo mode is active
  return (
    <>
      {/* Floating debug button — bottom left */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#2A2A2A]
          text-[#444444] hover:text-[#888880] text-xs font-mono flex items-center justify-center"
        title="Debug panel (Ctrl+D)"
      >
        ⚙
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="relative w-full max-w-[390px] mx-auto bg-[#141414] border-t border-[#2A2A2A] rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-accent">DEMO MODE</span>
                <button onClick={() => setOpen(false)} className="text-[#888880] text-lg">×</button>
              </div>

              {/* Demo profile presets */}
              <div className="flex flex-col gap-2 mb-6">
                {DEMO_PROFILES.map((dp, i) => (
                  <button
                    key={dp.name}
                    onClick={() => { loadDemo(i); setOpen(false) }}
                    className="text-left px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]
                      hover:border-accent/50 transition-colors"
                  >
                    <div className="font-mono text-sm text-accent">{dp.name}</div>
                    <div className="font-body text-xs text-[#888880] mt-0.5">{dp.label}</div>
                  </button>
                ))}
              </div>

              {/* Current profile dump */}
              <div className="mb-2">
                <span className="font-mono text-xs text-[#888880]">CURRENT PROFILE</span>
              </div>
              <pre className="font-mono text-xs text-[#888880] bg-[#0A0A0A] rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
