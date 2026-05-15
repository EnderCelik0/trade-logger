"use client"

import { useState } from "react"
import { useTradeStore, computeBacktestStats } from "@/store/useTradeStore"
import type { BacktestRun } from "@/store/useTradeStore"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RunCardHeader } from "./run-card-header"
import { RunCardStats } from "./run-card-stats"
import { RunCardDetails } from "./run-card-details"
import { BacktestScreenshotsDialog } from "./screenshots-dialog"

export function RunCard({ run }: { run: BacktestRun }) {
  const { deleteBacktestRun } = useTradeStore()
  const [expanded, setExpanded] = useState(false)
  const [showScreenshots, setShowScreenshots] = useState(false)
  const stats = computeBacktestStats(run)

  if (!stats) return null

  const dateRange =
    run.startDate || run.endDate
      ? `${run.startDate || "Start"} - ${run.endDate || "Open"}`
      : "No date range"

  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardHeader className="pb-0">
        <RunCardHeader
          run={run}
          expanded={expanded}
          workedLabel={String(stats.successfulSetups)}
          totalLabel={String(stats.totalSetups)}
          onToggle={() => setExpanded((v) => !v)}
          onDelete={() => deleteBacktestRun(run.id)}
          onShowScreenshots={() => setShowScreenshots(true)}
        />
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-5 pt-4">
          <Separator />
          <RunCardStats stats={stats} run={run} dateRange={dateRange} />
          <RunCardDetails hypothesis={run.hypothesis} notes={run.notes} />
        </CardContent>
      )}

      <BacktestScreenshotsDialog
        runName={run.name}
        screenshots={run.screenshots ?? []}
        open={showScreenshots}
        onOpenChange={setShowScreenshots}
      />
    </Card>
  )
}
