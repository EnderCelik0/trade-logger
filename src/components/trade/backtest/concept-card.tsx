import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SetupTagInput } from "@/components/trade/setup-tag-input"
import { Target } from "lucide-react"
import type { Timeframe } from "@/store/useTradeStore"

const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"]
const CONCEPT_PRESETS = [
  "Order Block",
  "FVG",
  "Liquidity Sweep",
  "Breaker",
  "SFP",
]
const MARKET_CONDITIONS = ["Up trend", "Down Trend", "Range"]

interface ConceptCardProps {
  name: string
  symbol: string
  timeframe: Timeframe
  concept: string
  marketCondition: string
  startDate: string
  endDate: string
  tags: string
  hypothesis: string
  onApplyConcept?: (concept: string) => void
  onChange: (key: string, value: string) => void
  hideConceptFields?: boolean
  tagsLabel?: string
}

export function ConceptCard({
  name,
  symbol,
  timeframe,
  concept,
  marketCondition,
  startDate,
  endDate,
  tags,
  hypothesis,
  onApplyConcept,
  onChange,
  hideConceptFields,
  tagsLabel,
}: ConceptCardProps) {
  const maxDate = useMemo(() => {
    const now = new Date()
    const pad = (value: number) => value.toString().padStart(2, "0")
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Target className="h-4 w-4" />
          Concept
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hideConceptFields ? (
          <div className="flex flex-wrap gap-2">
            {CONCEPT_PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={concept === preset ? "default" : "outline"}
                size="sm"
                onClick={() => onApplyConcept?.(preset)}
                className="h-8 transition-transform active:scale-[0.98]"
              >
                {preset}
              </Button>
            ))}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Run Name</Label>
            <Input
              placeholder="BTC/USDT Order Block Test"
              value={name}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Symbol</Label>
            <Input
              value={symbol}
              onChange={(e) => onChange("symbol", e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Timeframe</Label>
            <Select
              value={timeframe}
              onValueChange={(v) => onChange("timeframe", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map((tf) => (
                  <SelectItem key={tf} value={tf}>
                    {tf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!hideConceptFields ? (
            <div className="space-y-1.5">
              <Label>Concept</Label>
              <Input
                value={concept}
                onChange={(e) => {
                  onChange("concept", e.target.value)
                  onChange("strategy", e.target.value)
                }}
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label>Market Condition</Label>
            <Select
              value={marketCondition}
              onValueChange={(v) => onChange("marketCondition", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MARKET_CONDITIONS.map((cond) => (
                  <SelectItem key={cond} value={cond}>
                    {cond}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Start Date</Label>
            <Input
              type="date"
              max={maxDate}
              value={startDate}
              onChange={(e) => onChange("startDate", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>End Date</Label>
            <Input
              type="date"
              max={maxDate}
              value={endDate}
              onChange={(e) => onChange("endDate", e.target.value)}
            />
          </div>
          <div className="my-4 sm:col-span-2">
            <SetupTagInput
              value={tags}
              onChange={(v) => onChange("tags", v)}
              label={tagsLabel ?? "Setup Tags"}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Hypothesis</Label>
            <Textarea
              rows={2}
              placeholder="Example: 4H bullish OB retests work best after a liquidity sweep."
              value={hypothesis}
              onChange={(e) => onChange("hypothesis", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
