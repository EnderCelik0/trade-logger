import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MetricTile } from "./metric-tile"
import { gradeClass, formatPct, readNumber } from "./grade-utils"

interface OutcomeCountsCardProps {
  totalSetups: number
  successfulSetups: number
  partialSetups: number
  failedSetups: number
  invalidatedSetups: number
  averageMovePct: number
  averageDrawdownPct: number
  minRiskReward: number
  stats: {
    edgeGrade: string
    sampleHealth: string
    weightedSuccessRate: number
    successRate: number
    failureRate: number
    unresolvedSetups: number
  } | null
  resolved: number
  unresolved: number
  overfilled: boolean
  onChange: (key: string, value: number) => void
}

export function OutcomeCountsCard({
  totalSetups,
  successfulSetups,
  partialSetups,
  failedSetups,
  invalidatedSetups,
  averageMovePct,
  averageDrawdownPct,
  minRiskReward,
  stats,
  resolved,
  unresolved,
  overfilled,
  onChange,
}: OutcomeCountsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          Outcome Counts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-5">
          {[
            { label: "Found", key: "totalSetups", value: totalSetups },
            { label: "Worked", key: "successfulSetups", value: successfulSetups },
            { label: "Partial", key: "partialSetups", value: partialSetups },
            { label: "Failed", key: "failedSetups", value: failedSetups },
            { label: "Invalid", key: "invalidatedSetups", value: invalidatedSetups },
          ].map(({ label, key, value }) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Input
                type="number"
                min={0}
                value={value || ""}
                onChange={(e) => onChange(key, readNumber(e.target.value))}
              />
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Avg Move %</Label>
            <Input
              type="number"
              step="any"
              value={averageMovePct || ""}
              onChange={(e) => onChange("averageMovePct", readNumber(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Avg Drawdown %</Label>
            <Input
              type="number"
              step="any"
              value={averageDrawdownPct || ""}
              onChange={(e) => onChange("averageDrawdownPct", readNumber(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Min R:R</Label>
            <Input
              type="number"
              step="any"
              value={minRiskReward || ""}
              onChange={(e) => onChange("minRiskReward", readNumber(e.target.value))}
            />
          </div>
        </div>

        {stats ? (
          <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={gradeClass(stats.edgeGrade)}>
                  Grade {stats.edgeGrade}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Sample: {stats.sampleHealth}
                </span>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                {formatPct(stats.weightedSuccessRate)} weighted
              </span>
            </div>
            <Progress value={stats.weightedSuccessRate} className="h-2" />
            <div className="grid gap-2 sm:grid-cols-4">
              <MetricTile
                label="Worked"
                value={formatPct(stats.successRate)}
                tone="good"
              />
              <MetricTile
                label="Failed"
                value={formatPct(stats.failureRate)}
                tone={stats.failureRate > 45 ? "bad" : "warn"}
              />
              <MetricTile
                label="Unresolved"
                value={String(stats.unresolvedSetups)}
                tone={stats.unresolvedSetups > 0 ? "warn" : undefined}
              />
              <MetricTile
                label="Resolved"
                value={`${Math.min(resolved, totalSetups)}/${totalSetups}`}
              />
            </div>
          </div>
        ) : null}

        {overfilled ? (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            Outcome counts are higher than the number of found setups.
          </div>
        ) : unresolved > 0 ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
            {unresolved} setup{unresolved !== 1 ? "s are" : " is"} still
            unresolved.
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
