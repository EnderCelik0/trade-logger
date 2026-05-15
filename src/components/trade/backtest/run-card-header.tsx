import React from "react"
import { Button } from "@/components/ui/button"
import { SetupTagList } from "@/components/trade/setup-tag-input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react"
import type { BacktestRun } from "@/store/useTradeStore"
import { BacktestScreenshotsTrigger } from "./screenshots-dialog"

interface RunCardHeaderProps {
  run: BacktestRun
  expanded: boolean
  workedLabel: string
  totalLabel: string
  onToggle: () => void
  onDelete: () => void
  onShowScreenshots: () => void
}

export function RunCardHeader({
  run,
  expanded,
  workedLabel,
  totalLabel,
  onToggle,
  onDelete,
  onShowScreenshots,
}: RunCardHeaderProps) {
  const dateRange =
    run.startDate || run.endDate
      ? `${run.startDate || "Start"} - ${run.endDate || "Open"}`
      : "No date range"

  return (
    <div className="flex items-start justify-between gap-4">
      <button
        type="button"
        className="flex min-w-0 items-start gap-2 text-left"
        onClick={onToggle}
      >
        {expanded ? (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{run.name}</span>
            <span className="text-xs text-muted-foreground">{run.symbol}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {run.strategy} - {run.marketCondition}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SetupTagList value={run.tags || run.strategy} />
            <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
              {dateRange}
            </span>
            {run.screenshots?.length ? (
              <span onClick={(e) => e.stopPropagation()}>
                <BacktestScreenshotsTrigger
                  count={run.screenshots.length}
                  onClick={onShowScreenshots}
                />
              </span>
            ) : null}
          </div>
        </div>
      </button>

      <div className="flex items-start gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums">
            {workedLabel}/{totalLabel}
          </p>
          <p className="text-xs text-muted-foreground">Worked</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Concept Test</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
