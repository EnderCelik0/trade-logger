"use client"

import { useState, useMemo } from "react"
import { useTradeStore } from "@/store/useTradeStore"
import { AddTradeSheet } from "@/components/trade/add-trade-sheet"
import { FileText } from "lucide-react"
import { TradeLogFilters } from "./filters"
import { TradeTable } from "./trade-table"
import { isWinSafe, safePnlPct, safeRrRatio, exportTradesAsZip } from "./formatters"
import type { SortField, SortDir } from "./sort-header"

export function TradeLog() {
  const { trades, deleteTrade } = useTradeStore()

  const [search, setSearch] = useState("")
  const [filterDir, setFilterDir] = useState<"all" | "long" | "short">("all")
  const [filterResult, setFilterResult] = useState<"all" | "win" | "loss">("all")
  const [filterSymbols, setFilterSymbols] = useState<string[]>([])
  const [filterSetupTags, setFilterSetupTags] = useState<string[]>([])
  const [confidenceMin, setConfidenceMin] = useState(0)
  const [rrMin, setRrMin] = useState(0)
  const [rrMax, setRrMax] = useState(100)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const { uniqueSymbols, uniqueSetupTags } = useMemo(() => {
    const symbols = new Set<string>()
    const setupTags = new Set<string>()
    trades.forEach((t) => {
      if (t.symbol) symbols.add(t.symbol)
      if (t.setup_tag) {
        t.setup_tag.split(/[\s,]+/).forEach((tag) => {
          if (tag.trim()) setupTags.add(tag.trim())
        })
      }
    })
    return {
      uniqueSymbols: Array.from(symbols).sort(),
      uniqueSetupTags: Array.from(setupTags).sort(),
    }
  }, [trades])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const filtered = trades
    .filter((t) => {
      const query = search.toLowerCase()
      const symbol = String(t.symbol ?? "")
      const setupTag = String(t.setup_tag ?? "")
      const notes = String(t.notes ?? "")
      if (
        search &&
        !symbol.toLowerCase().includes(query) &&
        !setupTag.toLowerCase().includes(query) &&
        !notes.toLowerCase().includes(query)
      )
        return false
      if (filterDir !== "all" && t.direction !== filterDir) return false
      if (filterResult === "win" && !isWinSafe(t)) return false
      if (filterResult === "loss" && isWinSafe(t)) return false
      if (filterSymbols.length > 0 && !filterSymbols.includes(t.symbol ?? ""))
        return false
      if (filterSetupTags.length > 0) {
        const tradeTags = (t.setup_tag ?? "")
          .split(/[\s,]+/)
          .map((tag) => tag.trim())
          .filter(Boolean)
        if (!filterSetupTags.some((tag) => tradeTags.includes(tag))) return false
      }
      const confidence = typeof t.confidence === "number" ? t.confidence : 0
      if (confidence < confidenceMin) return false
      const rr = safeRrRatio(t)
      if (Number.isFinite(rr) && (rr < rrMin || rr > rrMax)) return false
      return true
    })
    .sort((a, b) => {
      let diff = 0
      if (sortField === "date") {
        const aTime = a.timestamp_close ? new Date(a.timestamp_close).getTime() : 0
        const bTime = b.timestamp_close ? new Date(b.timestamp_close).getTime() : 0
        diff = aTime - bTime
      } else if (sortField === "symbol") {
        diff = String(a.symbol ?? "").localeCompare(String(b.symbol ?? ""))
      } else if (sortField === "pnl") {
        diff = (a.pnl_net ?? 0) - (b.pnl_net ?? 0)
      } else if (sortField === "pct") {
        const aPct = safePnlPct(a)
        const bPct = safePnlPct(b)
        diff =
          (Number.isFinite(aPct) ? aPct : 0) -
          (Number.isFinite(bPct) ? bPct : 0)
      }
      return sortDir === "asc" ? diff : -diff
    })

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1 text-center">
          <p className="font-medium">No trades logged</p>
          <p className="text-sm text-muted-foreground">
            Your trade history will appear here.
          </p>
        </div>
        <AddTradeSheet />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <TradeLogFilters
        search={search}
        filterDir={filterDir}
        filterResult={filterResult}
        filterSymbols={filterSymbols}
        filterSetupTags={filterSetupTags}
        confidenceMin={confidenceMin}
        rrMin={rrMin}
        rrMax={rrMax}
        showAdvancedFilters={showAdvancedFilters}
        uniqueSymbols={uniqueSymbols}
        uniqueSetupTags={uniqueSetupTags}
        filteredCount={filtered.length}
        totalCount={trades.length}
        onSearchChange={setSearch}
        onFilterDirChange={setFilterDir}
        onFilterResultChange={setFilterResult}
        onFilterSymbolsChange={setFilterSymbols}
        onFilterSetupTagsChange={setFilterSetupTags}
        onConfidenceMinChange={setConfidenceMin}
        onRrMinChange={setRrMin}
        onRrMaxChange={setRrMax}
        onShowAdvancedFiltersChange={setShowAdvancedFilters}
        onClearAll={() => {
          setSearch("")
          setFilterDir("all")
          setFilterResult("all")
          setFilterSymbols([])
          setFilterSetupTags([])
          setConfidenceMin(0)
          setRrMin(0)
          setRrMax(100)
        }}
        onExport={() => void exportTradesAsZip(trades)}
      />

      <TradeTable
        trades={filtered}
        sortField={sortField}
        sortDir={sortDir}
        onToggleSort={toggleSort}
        onDelete={deleteTrade}
      />
    </div>
  )
}
