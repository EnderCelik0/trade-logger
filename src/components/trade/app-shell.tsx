import { useState } from "react"
import { useTradeStore } from "@/store/useTradeStore"
import { Dashboard } from "@/components/trade/dashboard"
import { TradeLog } from "@/components/trade/trade-log"
import { AddTradeSheet } from "@/components/trade/add-trade-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  LayoutDashboard,
  FileText,
  FlaskConical,
  Menu,
  X,
  Wallet,
  ChartNoAxesCombined,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Backtest } from "./backtest/backtest"

type View = "dashboard" | "log" | "backtest"

const NAV_ITEMS: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "log", label: "Trade Log", icon: FileText },
  { id: "backtest", label: "Backtest", icon: FlaskConical },
]

// ─── Settings modal ───────────────────────────────────────────────────────────

function SettingsModal() {
  const { initialWallet, riskPercentage, setInitialWallet, setRiskPercentage } =
    useTradeStore()

  function handleSave() {
    const n = parseFloat(String(initialWallet))
    if (!isNaN(n) && n > 0) setInitialWallet(n)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-4">
          Wallet
          <Wallet className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-95">
        <DialogHeader>
          <DialogTitle>Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Initial Portfolio Value ($)</Label>
            <Input
              type="number"
              value={initialWallet}
              onChange={(e) => setInitialWallet(Number(e.target.value))}
              placeholder="5000"
            />
            <p className="text-xs text-muted-foreground">
              Used as the baseline for equity curve and drawdown calculations.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Risk (%)</Label>
            <Input
              type="number"
              value={riskPercentage || ""}
              onChange={(e) => setRiskPercentage(Number(e.target.value))}
              placeholder="1"
            />
            <p className="text-xs text-muted-foreground">
              Used as the baseline for equity curve and drawdown calculations.
            </p>
          </div>
          <Button className="w-full" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  view,
  setView,
  onClose,
}: {
  view: View
  setView: (v: View) => void
  onClose?: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <ChartNoAxesCombined className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold tracking-tight">
          TradeJournal
        </span>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setView(id)
              onClose?.()
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
              view === id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4">
        <AddTradeSheet />
      </div>
    </div>
  )
}

// ─── Page header ──────────────────────────────────────────────────────────────

const PAGE_TITLES: Record<View, string> = {
  dashboard: "Dashboard",
  log: "Trade Log",
  backtest: "Backtest",
}

// ─── App shell ────────────────────────────────────────────────────────────────

export function AppShell() {
  const [view, setView] = useState<View>("dashboard")
  const [mobileOpen, setMobileOpen] = useState(false)
  const { hasHydrated, storageError } = useTradeStore()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <Sidebar view={view} setView={setView} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-border bg-sidebar transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          view={view}
          setView={setView}
          onClose={() => setMobileOpen(false)}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-5 py-3.5">
          <div className="flex items-center gap-3">
            <button
              className="text-muted-foreground hover:text-foreground md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <h1 className="text-sm font-semibold">{PAGE_TITLES[view]}</h1>
          </div>
          <div className="flex items-center gap-2">
            {view === "log" && <AddTradeSheet />}
            <SettingsModal />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          {!hasHydrated ? (
            <div className="flex h-full items-center justify-center">
              <Spinner className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : storageError ? (
            <div className="mx-auto mt-20 max-w-md rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {storageError}
            </div>
          ) : (
            <>
              {view === "dashboard" && <Dashboard />}
              {view === "log" && <TradeLog />}
              {view === "backtest" && <Backtest />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
