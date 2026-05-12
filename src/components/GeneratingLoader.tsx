interface Props {
  label: string
  lines?: number
}

export function GeneratingLoader({ label, lines = 4 }: Props) {
  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Status */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent"
              style={{ animation: `skeleton-pulse 1.2s ease-in-out ${i * 0.22}s infinite` }}
            />
          ))}
        </div>
        <span className="font-mono text-xs text-text-secondary">{label}</span>
      </div>

      {/* Skeleton lines */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div
              className="skeleton h-3 rounded-md"
              style={{
                width: `${[88, 72, 82, 65, 90, 58, 78, 68][i % 8]}%`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
            {i % 2 === 0 && (
              <div
                className="skeleton h-3 rounded-md"
                style={{
                  width: `${[60, 76, 52, 70][i % 4]}%`,
                  animationDelay: `${i * 0.08 + 0.04}s`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
