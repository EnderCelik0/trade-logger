import { getFearGreedColor } from "@/hooks/useMarketBias"

interface FearGreedGaugeProps {
  value: number
  label: string
  size?: number
}

export function FearGreedGauge({ value, label, size = 220 }: FearGreedGaugeProps) {
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.78
  const strokeWidth = (size / 2) * 0.12

  // Arc spans 180 degrees (left to right, half circle on bottom)
  const startAngle = Math.PI // 180 deg — left
  const endAngle = 0         // 0 deg — right

  // Build gradient arc segments: red → orange → yellow → lime → green
  const segments = [
    { color: "#dc2626", from: 0, to: 0.2 },
    { color: "#f97316", from: 0.2, to: 0.4 },
    { color: "#eab308", from: 0.4, to: 0.6 },
    { color: "#84cc16", from: 0.6, to: 0.8 },
    { color: "#059669", from: 0.8, to: 1.0 },
  ]

  function polarToCartesian(angle: number, r: number) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle),
    }
  }

  function arcPath(fromFrac: number, toFrac: number, r: number, sw: number) {
    const from = startAngle + (endAngle - startAngle) * fromFrac
    const to = startAngle + (endAngle - startAngle) * toFrac
    const p1 = polarToCartesian(from, r)
    const p2 = polarToCartesian(to, r)
    const largeArc = Math.abs(to - from) > Math.PI ? 1 : 0
    // sweep=0 because our angles go right→left in standard math
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 0 ${p2.x} ${p2.y}`
  }

  // Needle
  const fraction = value / 100
  const needleAngle = startAngle + (endAngle - startAngle) * fraction
  const needleLength = radius * 0.82
  const needleTip = polarToCartesian(needleAngle, needleLength)
  const needleBase = polarToCartesian(needleAngle + Math.PI / 2, strokeWidth * 0.28)
  const needleBase2 = polarToCartesian(needleAngle - Math.PI / 2, strokeWidth * 0.28)

  const needleColor = getFearGreedColor(value)
  const trackColor = "rgba(128,128,128,0.15)"

  const labelMap: Record<string, string> = {
    "Extreme Fear": "Extreme Fear",
    "Fear": "Fear",
    "Neutral": "Neutral",
    "Greed": "Greed",
    "Extreme Greed": "Extreme Greed",
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size * 0.58} viewBox={`0 0 ${size} ${size * 0.58}`} aria-label={`Fear & Greed: ${value} — ${label}`}>
        {/* Track (background arc) */}
        <path
          d={arcPath(0, 1, radius, strokeWidth)}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored segments */}
        {segments.map((seg) => (
          <path
            key={seg.color}
            d={arcPath(seg.from, seg.to, radius, strokeWidth)}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeLinecap={seg.from === 0 ? "round" : seg.to === 1 ? "round" : "butt"}
            opacity={0.85}
          />
        ))}

        {/* Needle */}
        <polygon
          points={`${needleTip.x},${needleTip.y} ${needleBase.x},${needleBase.y} ${needleBase2.x},${needleBase2.y}`}
          fill={needleColor}
          opacity={0.95}
        />

        {/* Center circle */}
        <circle cx={cx} cy={cy} r={strokeWidth * 0.38} fill={needleColor} />

        {/* Value label */}
        <text
          x={cx}
          y={cy * 0.62}
          textAnchor="middle"
          fontSize={size * 0.155}
          fontWeight="700"
          fill={needleColor}
          fontFamily="monospace"
        >
          {value}
        </text>
      </svg>

      {/* Zone ticks */}
      <div className="flex w-full items-center justify-between px-2 text-[10px] text-muted-foreground" style={{ maxWidth: size }}>
        <span style={{ color: "#dc2626" }}>Fear</span>
        <span style={{ color: "#eab308" }}>Neutral</span>
        <span style={{ color: "#059669" }}>Greed</span>
      </div>

      {/* Label badge */}
      <div
        className="mt-1 rounded-full px-3 py-0.5 text-xs font-semibold tracking-wider"
        style={{
          backgroundColor: `${needleColor}18`,
          color: needleColor,
          border: `1px solid ${needleColor}40`,
        }}
      >
        {labelMap[label] ?? label}
      </div>
    </div>
  )
}
