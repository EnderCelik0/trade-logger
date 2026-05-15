import { create } from "zustand"
import { nanoid } from "nanoid"

export type Direction = "long" | "short"
export type ExitReason = "sl" | "tp" | "manual"
export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1D" | "1W"

export interface ScreenshotAttachment {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  createdAt: string
  blob?: Blob
}

export interface Trade {
  id: string
  timestamp_open: string
  timestamp_close: string
  symbol: string
  direction: Direction
  timeframe: Timeframe
  entry_price: number
  exit_price: number
  size_usd: number
  contract_size: number
  stop_loss: number
  take_profit: number
  fee: number
  pnl_net: number
  exit_reason: ExitReason
  setup_tag: string
  confidence: number
  notes?: string
  screenshots?: ScreenshotAttachment[]
}

// ─── Derived helpers ────────────────────────────────────────────────────────

export function pnlPct(t: Trade): number {
  const raw = ((t.exit_price - t.entry_price) / t.entry_price) * 100
  return t.direction === "short" ? -raw : raw
}

export function rrRatio(t: Trade): number {
  if (t.direction === "long") {
    const risk = t.entry_price - t.stop_loss
    const reward = t.take_profit - t.entry_price
    return risk > 0 ? +(reward / risk).toFixed(2) : 0
  } else {
    const risk = t.stop_loss - t.entry_price
    const reward = t.entry_price - t.take_profit
    return risk > 0 ? +(reward / risk).toFixed(2) : 0
  }
}

export function durationHours(t: Trade): number {
  const ms =
    new Date(t.timestamp_close).getTime() - new Date(t.timestamp_open).getTime()
  return +(ms / 3_600_000).toFixed(1)
}

export function isWin(t: Trade): boolean {
  return t.pnl_net > 0
}

// ─── Aggregate stats ────────────────────────────────────────────────────────

export interface Stats {
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  totalPnl: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  expectancy: number
  walletCurrent: number
  maxDrawdown: number
  avgRiskReward: number
}

export function computeStats(trades: Trade[], initialWallet: number): Stats {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalPnl: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      walletCurrent: initialWallet,
      maxDrawdown: 0,
      avgRiskReward: 0,
    }
  }

  const sorted = [...trades].sort(
    (a, b) =>
      new Date(a.timestamp_close).getTime() -
      new Date(b.timestamp_close).getTime()
  )

  const wins = sorted.filter(isWin)
  const losses = sorted.filter((t) => !isWin(t))
  const totalPnl = sorted.reduce((s, t) => s + t.pnl_net, 0)
  const grossWin = wins.reduce((s, t) => s + t.pnl_net, 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl_net, 0))
  const rrValues = sorted.map(rrRatio).filter((rr) => rr > 0)
  const wr = wins.length / sorted.length

  let peak = initialWallet
  let maxDD = 0
  let equity = initialWallet
  for (const t of sorted) {
    equity += t.pnl_net
    if (equity > peak) peak = equity
    const dd = ((peak - equity) / peak) * 100
    if (dd > maxDD) maxDD = dd
  }

  return {
    totalTrades: sorted.length,
    wins: wins.length,
    losses: losses.length,
    winRate: +(wr * 100).toFixed(1),
    totalPnl: +totalPnl.toFixed(2),
    avgWin: wins.length ? +(grossWin / wins.length).toFixed(2) : 0,
    avgLoss: losses.length ? +(grossLoss / losses.length).toFixed(2) : 0,
    profitFactor:
      grossLoss > 0
        ? +(grossWin / grossLoss).toFixed(2)
        : grossWin > 0
          ? Infinity
          : 0,
    expectancy: +(
      wr * (grossWin / (wins.length || 1)) -
      (1 - wr) * (grossLoss / (losses.length || 1))
    ).toFixed(2),
    walletCurrent: +(initialWallet + totalPnl).toFixed(2),
    maxDrawdown: +maxDD.toFixed(2),
    avgRiskReward: rrValues.length
      ? +(rrValues.reduce((s, rr) => s + rr, 0) / rrValues.length).toFixed(2)
      : 0,
  }
}

// ─── Daily PnL series ───────────────────────────────────────────────────────

export interface DailyPnl {
  date: string
  pnl: number
}

export function dailyPnlSeries(trades: Trade[]): DailyPnl[] {
  const map: Record<string, number> = {}
  for (const t of trades) {
    const date = t.timestamp_close.slice(0, 10)
    map[date] = (map[date] ?? 0) + t.pnl_net
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => ({ date, pnl: +pnl.toFixed(2) }))
}

// ─── Equity curve ───────────────────────────────────────────────────────────

export interface EquityPoint {
  date: string
  wallet: number
}

export function equityCurve(
  trades: Trade[],
  initialWallet: number
): EquityPoint[] {
  const sorted = [...trades].sort(
    (a, b) =>
      new Date(a.timestamp_close).getTime() -
      new Date(b.timestamp_close).getTime()
  )
  let wallet = initialWallet
  const points: EquityPoint[] = [{ date: "Start", wallet }]
  for (const t of sorted) {
    wallet = +(wallet + t.pnl_net).toFixed(2)
    points.push({ date: t.timestamp_close.slice(0, 10), wallet })
  }
  return points
}

// ─── Backtest ────────────────────────────────────────────────────────────

export interface BacktestRun {
  id: string
  name: string
  symbol: string
  timeframe: Timeframe
  strategy: string
  concept?: string
  hypothesis?: string
  tags?: string
  marketCondition?: string
  startDate: string
  endDate: string
  initialCapital: number
  totalSetups?: number
  successfulSetups?: number
  partialSetups?: number
  failedSetups?: number
  invalidatedSetups?: number
  averageMovePct?: number
  averageDrawdownPct?: number
  minRiskReward?: number
  trades?: BacktestTrade[]
  notes?: string
  screenshots?: ScreenshotAttachment[]
  createdAt: string
}

export interface BacktestTrade {
  id: string
  timestamp_open: string
  timestamp_close: string
  direction: Direction
  entry_price: number
  exit_price: number
  size_usd: number
  pnl_net: number
  exit_reason: ExitReason
}

export function computeBacktestStats(run: BacktestRun) {
  const trades = run.trades ?? []

  if (trades.length > 0 && run.totalSetups === undefined) {
    const wins = trades.filter((t) => t.pnl_net > 0)
    const losses = trades.filter((t) => t.pnl_net <= 0)
    const totalSetups = trades.length
    const successRate = +((wins.length / totalSetups) * 100).toFixed(1)

    return {
      totalSetups,
      successfulSetups: wins.length,
      partialSetups: 0,
      failedSetups: losses.length,
      invalidatedSetups: 0,
      unresolvedSetups: 0,
      successRate,
      weightedSuccessRate: successRate,
      failureRate: +((losses.length / totalSetups) * 100).toFixed(1),
      sampleHealth:
        totalSetups >= 30 ? "High" : totalSetups >= 15 ? "Medium" : "Low",
      edgeGrade:
        successRate >= 65
          ? "A"
          : successRate >= 55
            ? "B"
            : successRate >= 45
              ? "C"
              : "D",
    }
  }

  const totalSetups = Math.max(0, run.totalSetups ?? 0)
  if (totalSetups === 0) return null

  const successfulSetups = Math.max(0, run.successfulSetups ?? 0)
  const partialSetups = Math.max(0, run.partialSetups ?? 0)
  const failedSetups = Math.max(0, run.failedSetups ?? 0)
  const invalidatedSetups = Math.max(0, run.invalidatedSetups ?? 0)
  const resolved =
    successfulSetups + partialSetups + failedSetups + invalidatedSetups
  const unresolvedSetups = Math.max(0, totalSetups - resolved)
  const weightedWins = successfulSetups + partialSetups * 0.5
  const successRate = +((successfulSetups / totalSetups) * 100).toFixed(1)
  const weightedSuccessRate = +((weightedWins / totalSetups) * 100).toFixed(1)
  const failureRate = +(
    ((failedSetups + invalidatedSetups) / totalSetups) *
    100
  ).toFixed(1)

  return {
    totalSetups,
    successfulSetups,
    partialSetups,
    failedSetups,
    invalidatedSetups,
    unresolvedSetups,
    successRate,
    weightedSuccessRate,
    failureRate,
    sampleHealth:
      totalSetups >= 30 ? "High" : totalSetups >= 15 ? "Medium" : "Low",
    edgeGrade:
      weightedSuccessRate >= 65
        ? "A"
        : weightedSuccessRate >= 55
          ? "B"
          : weightedSuccessRate >= 45
            ? "C"
            : "D",
  }
}

// ─── Store ──────────────────────────────────────────────────────────────────

interface TradeStore {
  trades: Trade[]
  initialWallet: number
  riskPercentage: number
  backtestRuns: BacktestRun[]
  hasHydrated: boolean
  storageError?: string

  setInitialWallet: (v: number) => void
  setRiskPercentage: (v: number) => void
  addTrade: (t: Omit<Trade, "id">) => void
  updateTrade: (id: string, patch: Partial<Omit<Trade, "id">>) => void
  deleteTrade: (id: string) => void

  addBacktestRun: (run: Omit<BacktestRun, "id" | "createdAt">) => void
  deleteBacktestRun: (id: string) => void
}

type ScreenshotMeta = Omit<ScreenshotAttachment, "dataUrl" | "blob">
type ScreenshotOwnerType = "trade" | "backtestRun"

type PersistedTrade = Omit<Trade, "screenshots"> & {
  screenshots?: ScreenshotMeta[]
}

type PersistedBacktestRun = Omit<BacktestRun, "screenshots"> & {
  screenshots?: ScreenshotMeta[]
}

interface StoredScreenshot extends ScreenshotMeta {
  ownerType: ScreenshotOwnerType
  ownerId: string
  blob: Blob
}

interface TradeJournalSnapshot {
  trades: Trade[]
  initialWallet: number
  riskPercentage: number
  backtestRuns: BacktestRun[]
}

const DB_NAME = "trade-journal-indexed-db"
const DB_VERSION = 1
const LEGACY_STORAGE_KEY = "trade-journal-v1"
const DEFAULT_INITIAL_WALLET = 10_000

function canUseIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window
}

function openTradeDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains("trades")) {
        db.createObjectStore("trades", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("backtestRuns")) {
        db.createObjectStore("backtestRuns", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("screenshots")) {
        const screenshots = db.createObjectStore("screenshots", {
          keyPath: "id",
        })
        screenshots.createIndex("owner", ["ownerType", "ownerId"])
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "IndexedDB storage failed"
}

function toScreenshotMeta(shot: ScreenshotMeta): ScreenshotMeta {
  return {
    id: shot.id,
    name: shot.name,
    type: shot.type,
    size: shot.size,
    createdAt: shot.createdAt,
  }
}

function stripScreenshotData<
  T extends { screenshots?: ScreenshotAttachment[] },
>(item: T): Omit<T, "screenshots"> & { screenshots?: ScreenshotMeta[] } {
  const { screenshots, ...rest } = item
  return {
    ...rest,
    screenshots: screenshots?.map(toScreenshotMeta) ?? [],
  }
}

async function screenshotToBlob(
  shot: ScreenshotAttachment
): Promise<Blob | null> {
  if (shot.blob) return shot.blob
  if (!shot.dataUrl) return null

  const response = await fetch(shot.dataUrl)
  return response.blob()
}

async function collectStoredScreenshots(
  ownerType: ScreenshotOwnerType,
  ownerId: string,
  screenshots: ScreenshotAttachment[] = []
): Promise<StoredScreenshot[]> {
  const stored: StoredScreenshot[] = []

  for (const shot of screenshots) {
    const blob = await screenshotToBlob(shot).catch(() => null)
    if (!blob) continue

    stored.push({
      ...toScreenshotMeta(shot),
      ownerType,
      ownerId,
      blob,
    })
  }

  return stored
}

async function persistTradeJournalState(state: TradeJournalSnapshot) {
  if (!canUseIndexedDb()) return

  const db = await openTradeDb()
  const tradeScreenshots = await Promise.all(
    state.trades.map((trade) =>
      collectStoredScreenshots("trade", trade.id, trade.screenshots)
    )
  )
  const backtestScreenshots = await Promise.all(
    state.backtestRuns.map((run) =>
      collectStoredScreenshots("backtestRun", run.id, run.screenshots)
    )
  )

  const transaction = db.transaction(
    ["trades", "backtestRuns", "screenshots", "meta"],
    "readwrite"
  )

  const tradesStore = transaction.objectStore("trades")
  const backtestRunsStore = transaction.objectStore("backtestRuns")
  const screenshotsStore = transaction.objectStore("screenshots")
  const metaStore = transaction.objectStore("meta")
  const done = transactionDone(transaction)

  tradesStore.clear()
  backtestRunsStore.clear()
  screenshotsStore.clear()
  metaStore.put({ key: "initialWallet", value: state.initialWallet })
  metaStore.put({ key: "riskPercentage", value: state.riskPercentage })

  state.trades
    .map((trade) => stripScreenshotData(trade) as PersistedTrade)
    .forEach((trade) => tradesStore.put(trade))

  state.backtestRuns
    .map((run) => stripScreenshotData(run) as PersistedBacktestRun)
    .forEach((run) => backtestRunsStore.put(run))
  ;[...tradeScreenshots.flat(), ...backtestScreenshots.flat()].forEach((shot) =>
    screenshotsStore.put(shot)
  )

  await done
  db.close()
}

function readLegacyLocalStorageState(): TradeJournalSnapshot | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    const state = parsed?.state ?? parsed

    return {
      trades: Array.isArray(state?.trades) ? state.trades : [],
      initialWallet:
        typeof state?.initialWallet === "number"
          ? state.initialWallet
          : DEFAULT_INITIAL_WALLET,
      riskPercentage:
        typeof state?.riskPercentage === "number" ? state.riskPercentage : 1,
      backtestRuns: Array.isArray(state?.backtestRuns)
        ? state.backtestRuns
        : [],
    }
  } catch {
    return null
  }
}

function removeLegacyLocalStorageState() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(LEGACY_STORAGE_KEY)
}

async function restoreScreenshot(
  shot: StoredScreenshot
): Promise<ScreenshotAttachment> {
  return {
    ...toScreenshotMeta(shot),
    dataUrl: URL.createObjectURL(shot.blob),
    blob: shot.blob,
  }
}

async function loadTradeJournalState(): Promise<TradeJournalSnapshot> {
  if (!canUseIndexedDb()) {
    return {
      trades: [],
      initialWallet: DEFAULT_INITIAL_WALLET,
      riskPercentage: 1,
      backtestRuns: [],
    }
  }

  const db = await openTradeDb()
  const transaction = db.transaction(
    ["trades", "backtestRuns", "screenshots", "meta"],
    "readonly"
  )
  const done = transactionDone(transaction)

  const [
    trades,
    backtestRuns,
    screenshots,
    initialWalletRecord,
    riskPercentageRecord,
  ] = await Promise.all([
    requestToPromise<PersistedTrade[]>(
      transaction.objectStore("trades").getAll()
    ),
    requestToPromise<PersistedBacktestRun[]>(
      transaction.objectStore("backtestRuns").getAll()
    ),
    requestToPromise<StoredScreenshot[]>(
      transaction.objectStore("screenshots").getAll()
    ),
    requestToPromise<{ key: string; value: number } | undefined>(
      transaction.objectStore("meta").get("initialWallet")
    ),
    requestToPromise<{ key: string; value: number } | undefined>(
      transaction.objectStore("meta").get("riskPercentage")
    ),
  ])

  await done
  db.close()

  const hasIndexedDbData =
    trades.length > 0 ||
    backtestRuns.length > 0 ||
    typeof initialWalletRecord?.value === "number" ||
    typeof riskPercentageRecord?.value === "number"

  if (!hasIndexedDbData) {
    const legacy = readLegacyLocalStorageState()
    if (legacy) {
      await persistTradeJournalState(legacy)
      removeLegacyLocalStorageState()
      return legacy
    }
  }

  const screenshotsByOwner = new Map<string, StoredScreenshot[]>()
  for (const shot of screenshots) {
    const key = `${shot.ownerType}:${shot.ownerId}`
    screenshotsByOwner.set(key, [...(screenshotsByOwner.get(key) ?? []), shot])
  }

  const restoredTrades = await Promise.all(
    trades.map(async (trade) => ({
      ...trade,
      screenshots: await Promise.all(
        (screenshotsByOwner.get(`trade:${trade.id}`) ?? []).map(
          restoreScreenshot
        )
      ),
    }))
  )

  const restoredBacktestRuns = await Promise.all(
    backtestRuns.map(async (run) => ({
      ...run,
      screenshots: await Promise.all(
        (screenshotsByOwner.get(`backtestRun:${run.id}`) ?? []).map(
          restoreScreenshot
        )
      ),
    }))
  )

  return {
    trades: restoredTrades,
    initialWallet: initialWalletRecord?.value ?? DEFAULT_INITIAL_WALLET,
    riskPercentage: riskPercentageRecord?.value ?? 1,
    backtestRuns: restoredBacktestRuns,
  }
}

function snapshotFromStore(state: TradeStore): TradeJournalSnapshot {
  return {
    trades: state.trades,
    initialWallet: state.initialWallet,
    riskPercentage: state.riskPercentage,
    backtestRuns: state.backtestRuns,
  }
}

export const useTradeStore = create<TradeStore>()((set, get) => {
  function persistCurrentState() {
    void persistTradeJournalState(snapshotFromStore(get())).catch((error) => {
      set({ storageError: getErrorMessage(error) })
    })
  }

  return {
    trades: [],
    initialWallet: DEFAULT_INITIAL_WALLET,
    riskPercentage: 1,
    backtestRuns: [],
    hasHydrated: false,

    setInitialWallet: (v) => {
      set({ initialWallet: v, storageError: undefined })
      persistCurrentState()
    },

    setRiskPercentage: (v) => {
      set({ riskPercentage: v, storageError: undefined })
      persistCurrentState()
    },

    addTrade: (t) => {
      set((s) => ({
        trades: [...s.trades, { ...t, id: nanoid() }],
        storageError: undefined,
      }))
      persistCurrentState()
    },

    updateTrade: (id, patch) => {
      set((s) => ({
        trades: s.trades.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        storageError: undefined,
      }))
      persistCurrentState()
    },

    deleteTrade: (id) => {
      set((s) => ({
        trades: s.trades.filter((t) => t.id !== id),
        storageError: undefined,
      }))
      persistCurrentState()
    },

    addBacktestRun: (run) => {
      set((s) => ({
        backtestRuns: [
          ...s.backtestRuns,
          { ...run, id: nanoid(), createdAt: new Date().toISOString() },
        ],
        storageError: undefined,
      }))
      persistCurrentState()
    },

    deleteBacktestRun: (id) => {
      set((s) => ({
        backtestRuns: s.backtestRuns.filter((r) => r.id !== id),
        storageError: undefined,
      }))
      persistCurrentState()
    },
  }
})

if (typeof window !== "undefined") {
  void loadTradeJournalState()
    .then((snapshot) => {
      useTradeStore.setState({
        ...snapshot,
        hasHydrated: true,
        storageError: undefined,
      })
    })
    .catch((error) => {
      useTradeStore.setState({
        hasHydrated: true,
        storageError: getErrorMessage(error),
      })
    })
}
