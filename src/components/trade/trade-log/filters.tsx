import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, SlidersHorizontal, Download } from "lucide-react"

interface FiltersProps {
  search: string
  filterDir: "all" | "long" | "short"
  filterResult: "all" | "win" | "loss"
  filterSymbols: string[]
  filterSetupTags: string[]
  confidenceMin: number
  rrMin: number
  rrMax: number
  showAdvancedFilters: boolean
  uniqueSymbols: string[]
  uniqueSetupTags: string[]
  filteredCount: number
  totalCount: number
  onSearchChange: (value: string) => void
  onFilterDirChange: (value: "all" | "long" | "short") => void
  onFilterResultChange: (value: "all" | "win" | "loss") => void
  onFilterSymbolsChange: (symbols: string[]) => void
  onFilterSetupTagsChange: (tags: string[]) => void
  onConfidenceMinChange: (value: number) => void
  onRrMinChange: (value: number) => void
  onRrMaxChange: (value: number) => void
  onShowAdvancedFiltersChange: (open: boolean) => void
  onClearAll: () => void
  onExport: () => void
}

export function TradeLogFilters({
  search,
  filterDir,
  filterResult,
  filterSymbols,
  filterSetupTags,
  confidenceMin,
  rrMin,
  rrMax,
  showAdvancedFilters,
  uniqueSymbols,
  uniqueSetupTags,
  filteredCount,
  totalCount,
  onSearchChange,
  onFilterDirChange,
  onFilterResultChange,
  onFilterSymbolsChange,
  onFilterSetupTagsChange,
  onConfidenceMinChange,
  onRrMinChange,
  onRrMaxChange,
  onShowAdvancedFiltersChange,
  onClearAll,
  onExport,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-45 flex-1">
        <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search symbol, setup, or notes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-8 text-sm"
        />
      </div>

      <Dialog open={showAdvancedFilters} onOpenChange={onShowAdvancedFiltersChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
            Filters
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Trade Direction</Label>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "All sides" },
                  { value: "long", label: "Long" },
                  { value: "short", label: "Short" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    variant={filterDir === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFilterDirChange(opt.value as typeof filterDir)}
                    className="text-xs"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Trade Result</Label>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "All results" },
                  { value: "win", label: "Wins" },
                  { value: "loss", label: "Losses" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    variant={filterResult === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFilterResultChange(opt.value as typeof filterResult)}
                    className="text-xs"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {uniqueSymbols.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Symbol</Label>
                <div className="grid grid-cols-2 gap-3">
                  {uniqueSymbols.map((symbol) => (
                    <div key={symbol} className="flex items-center gap-2">
                      <Checkbox
                        id={`symbol-${symbol}`}
                        checked={filterSymbols.includes(symbol)}
                        onCheckedChange={(checked: boolean) => {
                          onFilterSymbolsChange(
                            checked
                              ? [...filterSymbols, symbol]
                              : filterSymbols.filter((s) => s !== symbol)
                          )
                        }}
                      />
                      <Label
                        htmlFor={`symbol-${symbol}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {symbol}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uniqueSetupTags.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Setup Tags</Label>
                <div className="grid grid-cols-2 gap-3">
                  {uniqueSetupTags.map((tag) => (
                    <div key={tag} className="flex items-center gap-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={filterSetupTags.includes(tag)}
                        onCheckedChange={(checked: boolean) => {
                          onFilterSetupTagsChange(
                            checked
                              ? [...filterSetupTags, tag]
                              : filterSetupTags.filter((t) => t !== tag)
                          )
                        }}
                      />
                      <Label
                        htmlFor={`tag-${tag}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {tag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Confidence: {confidenceMin}/5
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  min="0"
                  max="5"
                  value={confidenceMin}
                  onChange={(e) => onConfidenceMinChange(Number(e.target.value))}
                  className="h-1 flex-1 cursor-pointer appearance-none bg-muted"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onConfidenceMinChange(0)}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Risk:Reward Ratio (R:R)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Min:</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={rrMin}
                    onChange={(e) => onRrMinChange(Number(e.target.value))}
                    className="h-8 flex-1 text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Max:</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={rrMax}
                    onChange={(e) => onRrMaxChange(Number(e.target.value))}
                    className="h-8 flex-1 text-sm"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="w-full text-xs"
            >
              Clear All Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {filteredCount} of {totalCount} trades
        </span>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export ZIP
        </Button>
      </div>
    </div>
  )
}
