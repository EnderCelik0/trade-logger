"use client"

import { useMemo } from "react"
import {
  useTradeStore,
  computeStats,
  dailyPnlSeries,
  equityCurve,
} from "@/store/useTradeStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Wallet,
  BarChart2,
} from "lucide-react"
import { AddTradeSheet } from "@/components/trade/add-trade-sheet"
import { MetricCard } from "./metric-card"
import { RecentTrades } from "./recent-trades"

export function Dashboard() {
  const { trades, initialWallet } = useTradeStore()

  const stats = useMemo(
    () => computeStats(trades, initialWallet),
    [trades, initialWallet]
  )
  const daily = useMemo(() => dailyPnlSeries(trades), [trades])
  const equity = useMemo(
    () => equityCurve(trades, initialWallet),
    [trades, initialWallet]
  )

  const pieData = [
    { name: "Win", value: stats.wins },
    { name: "Loss", value: stats.losses },
  ]

  const now = new Date()
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const monthlyDaily = daily.filter((d) => d.date.startsWith(monthStr))

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <BarChart2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1 text-center">
          <p className="font-medium">No trades yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first trade to start tracking performance.
          </p>
        </div>
        <AddTradeSheet />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          label="Portfolio Value"
          value={`$${stats.walletCurrent.toLocaleString()}`}
          sub={`Initial $${initialWallet.toLocaleString()}`}
          icon={Wallet}
          positive={stats.walletCurrent >= initialWallet}
        />
        <MetricCard
          label="Total P&L"
          value={`${stats.totalPnl >= 0 ? "+" : ""}$${stats.totalPnl.toFixed(0)}`}
          sub={`${stats.totalTrades} closed trades`}
          icon={TrendingUp}
          positive={stats.totalPnl >= 0}
        />
        <MetricCard
          label="Win Rate"
          value={`${stats.winRate}%`}
          sub={`${stats.wins}W / ${stats.losses}L`}
          icon={Target}
        />
        <MetricCard
          label="Avg Win"
          value={`$${stats.avgWin.toFixed(0)}`}
          sub="Per winning trade"
          icon={TrendingUp}
        />
        <MetricCard
          label="Avg Loss"
          value={`$${stats.avgLoss.toFixed(0)}`}
          icon={TrendingDown}
        />
        <MetricCard
          label="Total Trades"
          value={String(stats.totalTrades)}
          sub={`${stats.wins} wins, ${stats.losses} losses`}
          icon={BarChart2}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Win/Loss donut */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win / Loss Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer
              config={{ Win: { color: "#059669" }, Loss: { color: "#dc2626" } }}
              className="h-50"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="#059669" />
                  <Cell fill="#dc2626" />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-1 flex justify-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-600" />
                Win {stats.wins}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-600" />
                Loss {stats.losses}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Equity curve */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Equity Curve
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer
              config={{ wallet: { color: "#3b82f6" } }}
              className="h-55"
            >
              <AreaChart data={equity}>
                <defs>
                  <linearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                  }
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) =>
                    typeof value === "number"
                      ? [`$${value.toLocaleString()}`]
                      : ["", "Equity"]
                  }
                />
                <Area
                  type="monotone"
                  dataKey="wallet"
                  stroke="#3b82f6"
                  fill="url(#walletGrad)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily PnL bar chart */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Daily P&L —{" "}
            {now.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {monthlyDaily.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No closed trades this month.
            </p>
          ) : (
            <ChartContainer
              config={{ pnl: { color: "#059669" } }}
              className="h-50"
            >
              <BarChart data={monthlyDaily}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => v.slice(8)}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) =>
                    typeof value === "number"
                      ? [`${value >= 0 ? "+" : ""}$${value.toFixed(2)}`, "P&L"]
                      : ["", "P&L"]
                  }
                />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                  {monthlyDaily.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.pnl >= 0 ? "#059669" : "#dc2626"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <RecentTrades />
    </div>
  )
}
