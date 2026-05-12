import { type ReactNode } from 'react'

interface OptionButtonProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}

export function OptionButton({ selected, onClick, children, className = '' }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-5 py-4 rounded-xl border font-body text-base transition-all
        ${selected
          ? 'border-accent text-accent bg-accent-light shadow-sm'
          : 'border-border text-text-primary bg-surface hover:border-border-hover hover:shadow-card'
        }
        ${className}
      `}
    >
      {children}
    </button>
  )
}

interface TogglePairProps {
  options: [string, string]
  selected: string | null
  onSelect: (val: string) => void
}

export function TogglePair({ options, selected, onSelect }: TogglePairProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`
            py-4 rounded-xl border font-body font-medium text-base transition-all
            ${selected === opt
              ? 'border-accent text-accent bg-accent-light shadow-sm'
              : 'border-border text-text-primary bg-surface hover:border-border-hover hover:shadow-card'
            }
          `}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
