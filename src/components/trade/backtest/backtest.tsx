"use client"

import { useMemo, useState } from "react"
import { useTradeStore, computeBacktestStats } from "@/store/useTradeStore"
import type { Timeframe } from "@/store/useTradeStore"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FlaskConical, Plus } from "lucide-react"
import { RunCard } from "./run-card"
import { AddBacktestForm } from "./add-backtest-form"
import { BacktestFilters } from "./backtest-filters"

const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"]

export function Backtest() {
  const { backtestRuns } = useTradeStore()
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filterSymbols, setFilterSymbols] = useState<string[]>([])
  const [filterTimeframes, setFilterTimeframes] = useState<Timeframe[]>([])
  const [filterConcepts, setFilterConcepts] = useState<string[]>([])
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [filterGrades, setFilterGrades] = useState<Array<"A" | "B" | "C" | "D">>([])

  const { uniqueSymbols, uniqueTimeframes, uniqueConcepts, uniqueTags } =
    useMemo(() => {
      const symbols = new Set<string>()
      const timeframes = new Set<Timeframe>()
      const concepts = new Set<string>()
      const tags = new Set<string>()

      backtestRuns.forEach((run) => {
        if (run.symbol) symbols.add(run.symbol)
        if (run.timeframe) timeframes.add(run.timeframe)
        const concept = run.concept ?? run.strategy
        if (concept) concepts.add(concept)
        const runTags = (run.tags ?? run.strategy ?? "")
          .split(/[,\s]+/)
          .map((tag) => tag.trim())
          .filter(Boolean)
        runTags.forEach((tag) => tags.add(tag))
      })

      return {
        uniqueSymbols: Array.from(symbols).sort(),
        uniqueTimeframes: Array.from(timeframes).sort(
          (a, b) => TIMEFRAMES.indexOf(a) - TIMEFRAMES.indexOf(b)
        ),
        uniqueConcepts: Array.from(concepts).sort(),
        uniqueTags: Array.from(tags).sort(),
      }
    }, [backtestRuns])

  const filteredRuns = useMemo(() => {
    return backtestRuns.filter((run) => {
      if (filterSymbols.length > 0 && !filterSymbols.includes(run.symbol))
        return false
      if (filterTimeframes.length > 0 && !filterTimeframes.includes(run.timeframe))
        return false
      const concept = run.concept ?? run.strategy
      if (filterConcepts.length > 0 && !filterConcepts.includes(concept))
        return false
      if (filterTags.length > 0) {
        const runTags = (run.tags ?? run.strategy ?? "")
          .split(/[,\s]+/)
          .map((tag) => tag.trim())
          .filter(Boolean)
        if (!filterTags.some((tag) => runTags.includes(tag))) return false
      }
      const stats = computeBacktestStats(run)
      const grade = stats?.edgeGrade as "A" | "B" | "C" | "D" | undefined
      if (filterGrades.length > 0 && (!grade || !filterGrades.includes(grade)))
        return false
      return true
    })
  }, [backtestRuns, filterSymbols, filterTimeframes, filterConcepts, filterTags, filterGrades])

  function clearFilters() {
    setFilterSymbols([])
    setFilterTimeframes([])
    setFilterConcepts([])
    setFilterTags([])
    setFilterGrades([])
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {filteredRuns.length} of {backtestRuns.length} saved concept test
          {backtestRuns.length !== 1 ? "s" : ""}
        </p>

        <div className="flex items-center gap-2">
          <BacktestFilters
            open={showFilters}
            onOpenChange={setShowFilters}
            uniqueSymbols={uniqueSymbols}
            uniqueTimeframes={uniqueTimeframes}
            uniqueConcepts={uniqueConcepts}
            uniqueTags={uniqueTags}
            filterSymbols={filterSymbols}
            filterTimeframes={filterTimeframes}
            filterConcepts={filterConcepts}
            filterTags={filterTags}
            filterGrades={filterGrades}
            onFilterSymbolsChange={setFilterSymbols}
            onFilterTimeframesChange={setFilterTimeframes}
            onFilterConceptsChange={setFilterConcepts}
            onFilterTagsChange={setFilterTags}
            onFilterGradesChange={setFilterGrades}
            onClearAll={clearFilters}
          />

          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                New Concept Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] min-w-4xl scrollbar-thumb-primary overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Concept Test</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto pr-4">
                <AddBacktestForm onClose={() => setShowForm(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {backtestRuns.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-32">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FlaskConical className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1 text-center">
            <p className="font-medium">No concept tests yet</p>
            <p className="text-sm text-muted-foreground">
              Test setups like BTC/USDT order blocks and track their hit rate.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Concept Test
          </Button>
        </div>
      )}

      {backtestRuns.length > 0 && (
        <>
          {filteredRuns.length === 0 ? (
            <div className="border border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
              No concept tests match the current filters.
            </div>
          ) : (
            <div className="space-y-3">
              {[...filteredRuns]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((run) => (
                  <RunCard key={run.id} run={run} />
                ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
