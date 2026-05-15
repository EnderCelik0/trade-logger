import { useEffect, useMemo, useState } from "react"
import { computeStats, useTradeStore } from "@/store/useTradeStore"
import type {
  Trade,
  Direction,
  ExitReason,
  Timeframe,
} from "@/store/useTradeStore"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScreenshotUploader } from "@/components/trade/screenshot-uploader"
import { SetupTagInput } from "@/components/trade/setup-tag-input"
import { Plus } from "lucide-react"

const EMPTY: Omit<Trade, "id"> = {
  timestamp_open: new Date().toISOString().slice(0, 16),
  timestamp_close: new Date().toISOString().slice(0, 16),
  symbol: "BTC/USDT",
  direction: "long",
  timeframe: "4h",
  entry_price: 0,
  exit_price: 0,
  size_usd: 0,
  contract_size: 0,
  stop_loss: 0,
  take_profit: 0,
  fee: 0,
  pnl_net: 0,
  exit_reason: "manual",
  setup_tag: "",
  confidence: 3,
  notes: "",
  screenshots: [],
}

const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1h", "4h", "1D", "1W"]
const EXIT_REASONS: ExitReason[] = ["sl", "tp", "manual"]

function computePnl(form: Omit<Trade, "id">): number {
  if (!form.entry_price || !form.exit_price || !form.size_usd) return 0
  const move =
    form.direction === "long"
      ? form.exit_price - form.entry_price
      : form.entry_price - form.exit_price
  const raw = (move / form.entry_price) * form.size_usd
  return +(raw - form.fee).toFixed(2)
}

interface Props {
  initial?: Trade
  trigger?: React.ReactNode
}

export function AddTradeSheet({ initial, trigger }: Props) {
  const { trades, initialWallet, riskPercentage, addTrade, updateTrade } =
    useTradeStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Omit<Trade, "id">>(
    initial
      ? {
          ...initial,
          contract_size: initial.contract_size ?? 0,
          screenshots: initial.screenshots ?? [],
        }
      : { ...EMPTY }
  )

  useEffect(() => {
    if (!open) return
    setForm(
      initial
        ? {
            ...initial,
            contract_size: initial.contract_size ?? 0,
            screenshots: initial.screenshots ?? [],
          }
        : {
            ...EMPTY,
            timestamp_open: new Date().toISOString().slice(0, 16),
            timestamp_close: new Date().toISOString().slice(0, 16),
            screenshots: [],
          }
    )
  }, [initial, open])

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  const maxDateTime = useMemo(() => {
    const now = new Date()
    const pad = (value: number) => value.toString().padStart(2, "0")
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
  }, [])

  const validationErrors = useMemo(() => {
    const errors: string[] = []
    if (form.entry_price && form.stop_loss) {
      if (form.direction === "long" && form.stop_loss >= form.entry_price) {
        errors.push("Long trades require stop loss below entry price.")
      }
      if (form.direction === "short" && form.stop_loss <= form.entry_price) {
        errors.push("Short trades require stop loss above entry price.")
      }
    }

    if (form.entry_price && form.take_profit) {
      if (form.direction === "long" && form.take_profit <= form.entry_price) {
        errors.push("Long trades require take profit above entry price.")
      }
      if (form.direction === "short" && form.take_profit >= form.entry_price) {
        errors.push("Short trades require take profit below entry price.")
      }
    }

    return errors
  }, [form.direction, form.entry_price, form.stop_loss, form.take_profit])

  const currentWallet = useMemo(
    () => computeStats(trades, initialWallet).walletCurrent,
    [trades, initialWallet]
  )

  const calculatedContractSize = useMemo(() => {
    const riskAmount = currentWallet * (riskPercentage / 100)
    const riskPerContract =
      form.entry_price && form.stop_loss
        ? form.direction === "long"
          ? form.entry_price - form.stop_loss
          : form.stop_loss - form.entry_price
        : 0

    return riskAmount > 0 && riskPerContract > 0
      ? +(riskAmount / riskPerContract).toFixed(2)
      : 0
  }, [
    currentWallet,
    form.direction,
    form.entry_price,
    form.stop_loss,
    riskPercentage,
  ])

  useEffect(() => {
    if (form.contract_size !== calculatedContractSize) {
      setForm((prev) => ({ ...prev, contract_size: calculatedContractSize }))
    }
  }, [calculatedContractSize, form.contract_size])

  function handleSubmit() {
    if (validationErrors.length > 0) return

    const positionSize = +(form.contract_size * form.entry_price).toFixed(2)
    const payload = {
      ...form,
      size_usd: positionSize,
      pnl_net: computePnl({ ...form, size_usd: positionSize }),
    }
    if (initial) {
      updateTrade(initial.id, payload)
    } else {
      addTrade(payload)
    }
    setOpen(false)
  }

  const isEdit = Boolean(initial)
  const positionSizeUsd = +(form.contract_size * form.entry_price).toFixed(2)
  const previewPnl = computePnl({ ...form, size_usd: positionSizeUsd })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Trade
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="inset-x-2 bottom-2 mx-auto h-[88vh] max-w-5xl overflow-hidden border sm:inset-x-4"
      >
        <SheetHeader className="px-5 pt-5 pb-0 sm:px-6">
          <SheetTitle>{isEdit ? "Edit Trade" : "New Trade"}</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Symbol</Label>
                  <Input
                    value={form.symbol}
                    onChange={(e) =>
                      setField("symbol", e.target.value.toUpperCase())
                    }
                    placeholder="BTC/USDT"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Direction</Label>
                  <Select
                    value={form.direction}
                    onValueChange={(v) => setField("direction", v as Direction)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="long">
                        <Badge
                          variant="outline"
                          className="border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400"
                        >
                          Long
                        </Badge>
                      </SelectItem>
                      <SelectItem value="short">
                        <Badge
                          variant="outline"
                          className="border-red-300 text-red-500 dark:border-red-700 dark:text-red-400"
                        >
                          Short
                        </Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Timeframe</Label>
                  <Select
                    value={form.timeframe}
                    onValueChange={(v) => setField("timeframe", v as Timeframe)}
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
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Open Time</Label>
                  <Input
                    type="datetime-local"
                    max={maxDateTime}
                    value={form.timestamp_open}
                    onChange={(e) => setField("timestamp_open", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Close Time</Label>
                  <Input
                    type="datetime-local"
                    max={maxDateTime}
                    value={form.timestamp_close}
                    onChange={(e) =>
                      setField("timestamp_close", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Entry $</Label>
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    value={form.entry_price || ""}
                    placeholder="0.00"
                    onChange={(e) =>
                      setField("entry_price", Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Exit $</Label>
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    value={form.exit_price || ""}
                    placeholder="0.00"
                    onChange={(e) =>
                      setField("exit_price", Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Contract Size</Label>
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    value={form.contract_size || ""}
                    placeholder="Auto"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Stop Loss $</Label>
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    value={form.stop_loss || ""}
                    placeholder="0.00"
                    onChange={(e) =>
                      setField("stop_loss", Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Take Profit $</Label>
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    value={form.take_profit || ""}
                    placeholder="0.00"
                    onChange={(e) =>
                      setField("take_profit", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Fee $</Label>
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    value={form.fee || ""}
                    placeholder="0.00"
                    onChange={(e) => setField("fee", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Exit Reason</Label>
                  <Select
                    value={form.exit_reason}
                    onValueChange={(v) =>
                      setField("exit_reason", v as ExitReason)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXIT_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {validationErrors.length > 0 ? (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                  <p className="font-semibold">
                    Please fix the following issues:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {validationErrors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="space-y-5">
              <SetupTagInput
                value={form.setup_tag}
                onChange={(value) => setField("setup_tag", value)}
              />

              <div className="space-y-2">
                <Label>Confidence - {form.confidence}/5</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setField("confidence", n)}
                      className={`h-8 w-8 border text-sm font-medium transition-colors ${
                        n <= form.confidence
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  rows={4}
                  placeholder="Why did you enter, why did you exit..."
                  value={form.notes ?? ""}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>

              <ScreenshotUploader
                screenshots={form.screenshots ?? []}
                onChange={(screenshots) => setField("screenshots", screenshots)}
              />

              <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-muted/40 p-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Contract Size</p>
                  <p className="mt-1 font-semibold">
                    {form.contract_size
                      ? form.contract_size.toFixed(2)
                      : "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Position Size</p>
                  <p className="mt-1 font-semibold">
                    ${positionSizeUsd.toFixed(2)}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-muted-foreground">Estimated PnL</p>
                  <p
                    className={
                      previewPnl === 0
                        ? "mt-1 font-semibold text-muted-foreground"
                        : previewPnl > 0
                          ? "mt-1 font-semibold text-emerald-600 dark:text-emerald-400"
                          : "mt-1 font-semibold text-red-500 dark:text-red-400"
                    }
                  >
                    ${previewPnl.toFixed(2)}
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={validationErrors.length > 0}
              >
                {isEdit ? "Update Trade" : "Save Trade"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
