import { useTradeStore, pnlPct } from "@/store/useTradeStore"
import type { Trade } from "@/store/useTradeStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : "-"
}

function safeValue<T>(value: T | null | undefined, fallback: T) {
  return value == null ? fallback : value
}

function safeWin(trade: Trade) {
  return trade.pnl_net != null && trade.pnl_net > 0
}

function safePct(trade: Trade) {
  if (trade.entry_price == null || trade.exit_price == null) return NaN
  return pnlPct(trade)
}

export function RecentTrades() {
  const { trades } = useTradeStore()
  const recent = [...trades]
    .sort((a, b) => {
      const aTime = a.timestamp_close ? new Date(a.timestamp_close).getTime() : 0
      const bTime = b.timestamp_close ? new Date(b.timestamp_close).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 5)

  if (recent.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Recent Trades</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {recent.map((t) => {
            const win = safeWin(t)
            const pct = safePct(t)
            const direction = safeValue(t.direction, undefined)
            const symbol = safeValue(t.symbol, "-")
            const timeframe = safeValue(t.timeframe, "-")
            return (
              <div
                key={t.id}
                className="flex items-center justify-between px-6 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      direction === "long"
                        ? "border-emerald-300 text-xs text-emerald-600 dark:border-emerald-800 dark:text-emerald-400"
                        : direction === "short"
                          ? "border-red-300 text-xs text-red-500 dark:border-red-800 dark:text-red-400"
                          : "border-border text-xs text-muted-foreground"
                    }
                  >
                    {direction ? direction.toUpperCase() : "-"}
                  </Badge>
                  <span className="font-medium">{symbol}</span>
                  <span className="text-xs text-muted-foreground">{timeframe}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {formatDate(t.timestamp_close)}
                  </span>
                  <span
                    className={`font-medium tabular-nums ${
                      win
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {t.pnl_net != null
                      ? `${win ? "+" : ""}$${t.pnl_net.toFixed(2)}`
                      : "-"}
                  </span>
                  <span
                    className={`text-xs tabular-nums ${
                      Number.isFinite(pct)
                        ? pct >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500 dark:text-red-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {Number.isFinite(pct)
                      ? `(${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%)`
                      : "-"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
