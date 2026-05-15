"use client"

import { useMemo, useState } from "react"
import { useTradeStore, computeBacktestStats } from "@/store/useTradeStore"
import type {
  BacktestRun,
  Timeframe,
  ScreenshotAttachment,
} from "@/store/useTradeStore"
import { Button } from "@/components/ui/button"
import { ConceptCard } from "./concept-card"
import { OutcomeCountsCard } from "./outcome-counts-card"
import { EvidenceCard } from "./evidence-card"

type BacktestDraft = Omit<BacktestRun, "id" | "createdAt" | "trades"> & {
  totalSetups: number
  successfulSetups: number
  partialSetups: number
  failedSetups: number
  invalidatedSetups: number
  averageMovePct: number
  averageDrawdownPct: number
  minRiskReward: number
}

const EMPTY_RUN: BacktestDraft = {
  name: "",
  symbol: "BTC/USDT",
  timeframe: "4h",
  strategy: "Order Block",
  concept: "Order Block",
  hypothesis: "",
  tags: "OB",
  marketCondition: "Up trend",
  startDate: "",
  endDate: "",
  initialCapital: 0,
  totalSetups: 0,
  successfulSetups: 0,
  partialSetups: 0,
  failedSetups: 0,
  invalidatedSetups: 0,
  averageMovePct: 0,
  averageDrawdownPct: 0,
  minRiskReward: 0,
  notes: "",
  screenshots: [],
}

export function AddBacktestForm({ onClose }: { onClose: () => void }) {
  const { addBacktestRun } = useTradeStore()
  const [run, setRun] = useState<BacktestDraft>({ ...EMPTY_RUN })

  function setRunField<K extends keyof BacktestDraft>(
    key: K,
    value: BacktestDraft[K]
  ) {
    setRun((prev) => ({ ...prev, [key]: value }))
  }

  const stats = useMemo(
    () =>
      computeBacktestStats({
        ...run,
        id: "preview",
        createdAt: new Date().toISOString(),
      }),
    [run]
  )

  const resolved =
    run.successfulSetups +
    run.partialSetups +
    run.failedSetups +
    run.invalidatedSetups
  const unresolved = Math.max(0, run.totalSetups - resolved)
  const overfilled = resolved > run.totalSetups && run.totalSetups > 0

  function handleSave() {
    if (!run.name || run.totalSetups <= 0 || overfilled) return
    addBacktestRun({
      ...run,
      strategy: run.concept || run.strategy,
      screenshots: run.screenshots ?? [],
    })
    onClose()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto pb-5">
        <ConceptCard
          name={run.name}
          symbol={run.symbol}
          timeframe={run.timeframe as Timeframe}
          concept={run.concept ?? ""}
          marketCondition={run.marketCondition ?? ""}
          startDate={run.startDate ?? ""}
          endDate={run.endDate ?? ""}
          tags={run.tags ?? ""}
          hypothesis={run.hypothesis ?? ""}
          hideConceptFields
          onChange={(key, value) =>
            setRunField(
              key as keyof BacktestDraft,
              value as BacktestDraft[keyof BacktestDraft]
            )
          }
        />

        <OutcomeCountsCard
          totalSetups={run.totalSetups}
          successfulSetups={run.successfulSetups}
          partialSetups={run.partialSetups}
          failedSetups={run.failedSetups}
          invalidatedSetups={run.invalidatedSetups}
          averageMovePct={run.averageMovePct}
          averageDrawdownPct={run.averageDrawdownPct}
          minRiskReward={run.minRiskReward}
          stats={stats}
          resolved={resolved}
          unresolved={unresolved}
          overfilled={overfilled}
          onChange={(key, value) =>
            setRunField(
              key as keyof BacktestDraft,
              value as BacktestDraft[keyof BacktestDraft]
            )
          }
        />

        <EvidenceCard
          notes={run.notes ?? ""}
          screenshots={run.screenshots ?? []}
          onNotesChange={(value) => setRunField("notes", value)}
          onScreenshotsChange={(screenshots) =>
            setRunField("screenshots", screenshots as ScreenshotAttachment[])
          }
        />
      </div>

      <div className="sticky z-10 flex w-full gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={!run.name || run.totalSetups <= 0 || overfilled}
        >
          Save Concept Test
        </Button>
      </div>
    </div>
  )
}
