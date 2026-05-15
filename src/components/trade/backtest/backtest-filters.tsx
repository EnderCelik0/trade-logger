import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SlidersHorizontal } from "lucide-react"
import type { Timeframe } from "@/store/useTradeStore"

interface BacktestFiltersProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uniqueSymbols: string[]
  uniqueTimeframes: Timeframe[]
  uniqueConcepts: string[]
  uniqueTags: string[]
  filterSymbols: string[]
  filterTimeframes: Timeframe[]
  filterConcepts: string[]
  filterTags: string[]
  filterGrades: Array<"A" | "B" | "C" | "D">
  onFilterSymbolsChange: (v: string[]) => void
  onFilterTimeframesChange: (v: Timeframe[]) => void
  onFilterConceptsChange: (v: string[]) => void
  onFilterTagsChange: (v: string[]) => void
  onFilterGradesChange: (v: Array<"A" | "B" | "C" | "D">) => void
  onClearAll: () => void
}

export function BacktestFilters({
  open,
  onOpenChange,
  uniqueSymbols,
  uniqueTimeframes,
  uniqueConcepts,
  uniqueTags,
  filterSymbols,
  filterTimeframes,
  filterConcepts,
  filterTags,
  filterGrades,
  onFilterSymbolsChange,
  onFilterTimeframesChange,
  onFilterConceptsChange,
  onFilterTagsChange,
  onFilterGradesChange,
  onClearAll,
}: BacktestFiltersProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="mr-1.5 h-4 w-4" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {uniqueSymbols.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Symbol</Label>
              <div className="grid grid-cols-2 gap-3">
                {uniqueSymbols.map((symbol) => (
                  <div key={symbol} className="flex items-center gap-2">
                    <Checkbox
                      id={`bt-symbol-${symbol}`}
                      checked={filterSymbols.includes(symbol)}
                      onCheckedChange={(checked: boolean) =>
                        onFilterSymbolsChange(
                          checked
                            ? [...filterSymbols, symbol]
                            : filterSymbols.filter((s) => s !== symbol)
                        )
                      }
                    />
                    <Label htmlFor={`bt-symbol-${symbol}`} className="cursor-pointer text-sm font-normal">
                      {symbol}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uniqueTimeframes.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Timeframe</Label>
              <div className="grid grid-cols-2 gap-3">
                {uniqueTimeframes.map((timeframe) => (
                  <div key={timeframe} className="flex items-center gap-2">
                    <Checkbox
                      id={`bt-timeframe-${timeframe}`}
                      checked={filterTimeframes.includes(timeframe)}
                      onCheckedChange={(checked: boolean) =>
                        onFilterTimeframesChange(
                          checked
                            ? [...filterTimeframes, timeframe]
                            : filterTimeframes.filter((t) => t !== timeframe)
                        )
                      }
                    />
                    <Label htmlFor={`bt-timeframe-${timeframe}`} className="cursor-pointer text-sm font-normal">
                      {timeframe}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uniqueConcepts.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Concept</Label>
              <div className="grid grid-cols-2 gap-3">
                {uniqueConcepts.map((concept) => (
                  <div key={concept} className="flex items-center gap-2">
                    <Checkbox
                      id={`bt-concept-${concept}`}
                      checked={filterConcepts.includes(concept)}
                      onCheckedChange={(checked: boolean) =>
                        onFilterConceptsChange(
                          checked
                            ? [...filterConcepts, concept]
                            : filterConcepts.filter((c) => c !== concept)
                        )
                      }
                    />
                    <Label htmlFor={`bt-concept-${concept}`} className="cursor-pointer text-sm font-normal">
                      {concept}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uniqueTags.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tags</Label>
              <div className="grid grid-cols-2 gap-3">
                {uniqueTags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2">
                    <Checkbox
                      id={`bt-tag-${tag}`}
                      checked={filterTags.includes(tag)}
                      onCheckedChange={(checked: boolean) =>
                        onFilterTagsChange(
                          checked
                            ? [...filterTags, tag]
                            : filterTags.filter((t) => t !== tag)
                        )
                      }
                    />
                    <Label htmlFor={`bt-tag-${tag}`} className="cursor-pointer text-sm font-normal">
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-sm font-medium">Grade</Label>
            <div className="grid grid-cols-2 gap-3">
              {(["A", "B", "C", "D"] as const).map((grade) => (
                <div key={grade} className="flex items-center gap-2">
                  <Checkbox
                    id={`bt-grade-${grade}`}
                    checked={filterGrades.includes(grade)}
                    onCheckedChange={(checked: boolean) =>
                      onFilterGradesChange(
                        checked
                          ? [...filterGrades, grade]
                          : filterGrades.filter((g) => g !== grade)
                      )
                    }
                  />
                  <Label htmlFor={`bt-grade-${grade}`} className="cursor-pointer text-sm font-normal">
                    {grade}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onClearAll} className="w-full text-xs">
            Clear All Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
