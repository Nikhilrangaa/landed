interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full h-0.5 bg-border">
      <div
        className="h-full bg-accent transition-all duration-400 ease-out rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
