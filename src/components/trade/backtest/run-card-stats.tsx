import { CheckCircle2, XCircle, CircleDashed } from "lucide-react"
import { MetricTile } from "./metric-tile"
import { gradeLabel } from "./grade-utils"
import type { BacktestRun } from "@/store/useTradeStore"

interface BacktestStats {
  totalSetups: number
  successfulSetups: number
  failedSetups: number
  invalidatedSetups: number
  successRate: number
  weightedSuccessRate: number
  sampleHealth: string
}

interface RunCardStatsProps {
  stats: BacktestStats
  run: BacktestRun
  dateRange: string
}

export function RunCardStats({ stats, run, dateRange }: RunCardStatsProps) {
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-3">
        <MetricTile label="Found" value={String(stats.totalSetups)} />
        <MetricTile
          label="Worked"
          value={String(stats.successfulSetups)}
          tone="good"
        />
        <MetricTile
          label="Failed"
          value={String(stats.failedSetups + stats.invalidatedSetups)}
          tone="bad"
        />
        <MetricTile
          label="Worked %"
          value={gradeLabel(stats.successRate)}
          tone="good"
        />
        <MetricTile
          label="Weighted %"
          value={gradeLabel(stats.weightedSuccessRate)}
          tone={stats.weightedSuccessRate >= 55 ? "good" : "warn"}
        />
        <MetricTile label="Sample" value={stats.sampleHealth} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Weighted success</span>
          <span>{dateRange}</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${stats.weightedSuccessRate}%` }}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="flex items-center gap-2 border-b border-border px-2 py-1 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Avg move: {run.averageMovePct ? `${run.averageMovePct}%` : "-"}
        </div>
        <div className="flex items-center gap-2 border-b border-border px-2 py-1 text-sm">
          <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
          Avg drawdown:{" "}
          {run.averageDrawdownPct ? `${run.averageDrawdownPct}%` : "-"}
        </div>
        <div className="flex items-center gap-2 border-b border-border px-2 py-1 text-sm">
          <CircleDashed className="h-4 w-4 text-muted-foreground" />
          Min R:R: {run.minRiskReward ? `${run.minRiskReward}R` : "-"}
        </div>
      </div>
    </>
  )
}
